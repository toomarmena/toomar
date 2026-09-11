"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AGE_RATING, GENRES, LAYOUTS, RUN_STATUS, SOCIAL_KEYS, isLayout, type AgeRating, type ComicLayout, type GenreKey, type RunStatus, type SocialLinks } from "@/lib/constants";
import { isLang, type Lang } from "@/lib/i18n";
import { deleteObject, deleteObjects, presignUpload } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { nextPublishInstant } from "@/lib/queries";
import type { EpisodeRow, SeriesRow } from "@/lib/types";

const IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account?next=/studio");
  return { supabase, user };
}

async function ownSeries(id: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("series").select("*").eq("id", id).maybeSingle();
  const s = data as SeriesRow | null;
  if (!s) throw new Error("not found");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (s.creator_id !== user.id && me?.role !== "admin") throw new Error("forbidden");
  return { supabase, user, series: s };
}

async function ownEpisode(id: string) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("episodes").select("*").eq("id", id).maybeSingle();
  const e = data as EpisodeRow | null;
  if (!e) throw new Error("not found");
  const { series } = await ownSeries(e.series_id);
  return { supabase, user, episode: e, series };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function readSeriesForm(form: FormData) {
  const kind = form.get("kind") === "novel" ? "novel" : "comic";
  const title_ar = String(form.get("title_ar") ?? "").trim().slice(0, 120);
  const title_en = String(form.get("title_en") ?? "").trim().slice(0, 120) || null;
  const description_ar = String(form.get("description_ar") ?? "").trim().slice(0, 2000) || null;
  const description_en = String(form.get("description_en") ?? "").trim().slice(0, 2000) || null;
  const genreRaw = String(form.get("genre") ?? "");
  const genre = GENRES.some((g) => g.key === genreRaw) ? (genreRaw as GenreKey) : null;
  const publish_day = Number(form.get("publish_day"));
  const languages = form.getAll("languages").filter(isLang) as Lang[];
  const rs = String(form.get("run_status") ?? "ongoing");
  const run_status: RunStatus = RUN_STATUS.some((r) => r.key === rs) ? (rs as RunStatus) : "ongoing";
  const ar = String(form.get("age_rating") ?? "all");
  const age_rating: AgeRating = AGE_RATING.some((r) => r.key === ar) ? (ar as AgeRating) : "all";
  const picked = form.getAll("layouts").filter(isLayout) as ComicLayout[];
  const layouts = picked.length ? LAYOUTS.filter((l) => picked.includes(l.key)).map((l) => l.key) : (["vertical"] as ComicLayout[]);
  return { kind, title_ar, title_en, description_ar, description_en, genre, publish_day, languages: languages.length ? languages : (["ar"] as Lang[]), run_status, age_rating, layouts };
}

// ---------- public profile ----------
const HANDLE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Turns "@name", "name" or a full address into a full address for the given network. */
function normaliseSocial(key: (typeof SOCIAL_KEYS)[number], raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v.slice(0, 300);
  const user = v.replace(/^@/, "").replace(/^www\./, "");
  if (!user) return null;
  switch (key) {
    case "instagram":
      return `https://instagram.com/${user}`;
    case "x":
      return `https://x.com/${user}`;
    case "facebook":
      return `https://facebook.com/${user}`;
    case "youtube":
      return user.startsWith("@") || user.includes("/") ? `https://youtube.com/${user}` : `https://youtube.com/@${user}`;
    case "tiktok":
      return `https://tiktok.com/@${user}`;
    case "website":
      return `https://${user}`;
  }
}

export type ProfileState = { error?: "handleTaken" | "handleBad" | "required" | "generic"; saved?: boolean } | null;

export async function updatePublicProfile(_prev: ProfileState, form: FormData): Promise<ProfileState> {
  const { supabase, user } = await requireUser();
  const display_name = String(form.get("display_name") ?? "").trim().slice(0, 60);
  const handle = String(form.get("handle") ?? "").trim().toLowerCase();
  const bio = String(form.get("bio") ?? "").trim().slice(0, 500) || null;
  if (!display_name) return { error: "required" };
  if (!HANDLE_RE.test(handle) || handle.length < 3 || handle.length > 30) return { error: "handleBad" };
  const social_links: SocialLinks = {};
  for (const k of SOCIAL_KEYS) {
    const v = normaliseSocial(k, String(form.get(`social_${k}`) ?? ""));
    if (v) social_links[k] = v;
  }
  const { error } = await supabase.from("profiles").update({ display_name, handle, bio, social_links }).eq("id", user.id);
  if (error) return { error: error.code === "23505" ? "handleTaken" : "generic" };
  revalidatePath("/studio/profile");
  revalidatePath(`/creators/${handle}`);
  revalidatePath("/account");
  return { saved: true };
}

export async function presignAvatar(contentType: string) {
  const { user } = await requireUser();
  if (!IMAGE_TYPES.has(contentType)) throw new Error("type");
  const ext = contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : "webp";
  return presignUpload(`avatars/${user.id}/${Date.now()}.${ext}`, contentType);
}

export async function setAvatar(key: string) {
  const { supabase, user } = await requireUser();
  if (!key.startsWith(`avatars/${user.id}/`)) throw new Error("key");
  const { data: prev } = await supabase.from("profiles").select("avatar_key, handle").eq("id", user.id).maybeSingle();
  await supabase.from("profiles").update({ avatar_key: key }).eq("id", user.id);
  if (prev?.avatar_key) await deleteObject(prev.avatar_key).catch(() => {});
  revalidatePath("/studio/profile");
  if (prev?.handle) revalidatePath(`/creators/${prev.handle}`);
}

export async function createSeries(form: FormData) {
  const { supabase, user } = await requireUser();
  const f = readSeriesForm(form);
  if (!f.title_ar || !f.genre || !Number.isInteger(f.publish_day) || f.publish_day < 0 || f.publish_day > 6) {
    redirect("/studio/new?error=required");
  }
  const base = slugify(f.title_en ?? "") || `s-${Math.random().toString(36).slice(2, 8)}`;
  let slug = base;
  let created: { id: string } | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    const { data, error } = await supabase
      .from("series")
      .insert({ ...f, slug, creator_id: user.id })
      .select("id")
      .single();
    if (!error) created = data;
    else if (error.code === "23505") slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    else throw error;
  }
  if (!created) throw new Error("slug");
  // The first series makes a reader a creator. Role changes go through the service role.
  const admin = createAdminClient();
  await admin.from("profiles").update({ role: "creator" }).eq("id", user.id).eq("role", "reader");
  revalidatePath("/studio");
  redirect(`/studio/${created.id}`);
}

export async function updateSeries(id: string, form: FormData) {
  const { supabase } = await ownSeries(id);
  const f = readSeriesForm(form);
  if (!f.title_ar || !f.genre || !Number.isInteger(f.publish_day) || f.publish_day < 0 || f.publish_day > 6) return;
  const { kind: _kind, ...rest } = f; // the kind is fixed once created
  void _kind;
  await supabase.from("series").update(rest).eq("id", id);
  revalidatePath(`/studio/${id}`);
  revalidatePath("/");
}

export async function submitSeries(id: string): Promise<"ok" | "cover" | "episode"> {
  const { supabase, series } = await ownSeries(id);
  if (!series.cover_key) return "cover";
  const { count } = await supabase.from("episodes").select("id", { count: "exact", head: true }).eq("series_id", id);
  if (!count) return "episode";
  await supabase.from("series").update({ status: "pending" }).eq("id", id);
  revalidatePath(`/studio/${id}`);
  revalidatePath("/admin");
  return "ok";
}

export async function withdrawSeries(id: string) {
  const { supabase } = await ownSeries(id);
  await supabase.from("series").update({ status: "draft" }).eq("id", id);
  revalidatePath(`/studio/${id}`);
  revalidatePath("/admin");
}

export async function deleteSeries(id: string) {
  const { supabase, series } = await ownSeries(id);
  if (series.status === "approved" || series.status === "pending") return;
  const { data: eps } = await supabase.from("episodes").select("id").eq("series_id", id);
  const ids = (eps ?? []).map((e) => e.id);
  const keys: string[] = series.cover_key ? [series.cover_key] : [];
  if (ids.length) {
    const { data: imgs } = await supabase.from("episode_images").select("key").in("episode_id", ids);
    keys.push(...(imgs ?? []).map((i) => i.key));
  }
  await supabase.from("series").delete().eq("id", id);
  await deleteObjects(keys).catch(() => {});
  revalidatePath("/studio");
  redirect("/studio");
}

export async function presignCover(seriesId: string, contentType: string) {
  await ownSeries(seriesId);
  if (!IMAGE_TYPES.has(contentType)) throw new Error("type");
  const ext = contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : "webp";
  return presignUpload(`series/${seriesId}/cover-${Date.now()}.${ext}`, contentType);
}

export async function setCover(seriesId: string, key: string) {
  const { supabase, series } = await ownSeries(seriesId);
  if (!key.startsWith(`series/${seriesId}/cover-`)) throw new Error("key");
  await supabase.from("series").update({ cover_key: key }).eq("id", seriesId);
  if (series.cover_key) await deleteObject(series.cover_key).catch(() => {});
  revalidatePath(`/studio/${seriesId}`);
  revalidatePath("/");
}

export async function createEpisode(seriesId: string, langRaw: string) {
  const { supabase, series } = await ownSeries(seriesId);
  const lang: Lang = isLang(langRaw) && series.languages.includes(langRaw) ? langRaw : series.languages[0];
  const { data: last } = await supabase.from("episodes").select("number").eq("series_id", seriesId).eq("lang", lang).order("number", { ascending: false }).limit(1).maybeSingle();
  const number = (last?.number ?? 0) + 1;
  const { data, error } = await supabase.from("episodes").insert({ series_id: seriesId, number, lang }).select("id").single();
  if (error) throw error;
  revalidatePath(`/studio/${seriesId}`);
  redirect(`/studio/${seriesId}/episodes/${data.id}`);
}

export async function updateEpisode(id: string, form: FormData) {
  const { supabase, series } = await ownEpisode(id);
  const title = String(form.get("title") ?? "").trim().slice(0, 160) || null;
  const note = String(form.get("note") ?? "").trim().slice(0, 600) || null;
  const body = series.kind === "novel" ? String(form.get("body") ?? "").replace(/\r\n/g, "\n").slice(0, 200000) || null : undefined;
  await supabase
    .from("episodes")
    .update(body === undefined ? { title, note } : { title, note, body })
    .eq("id", id);
  revalidatePath(`/studio/${series.id}/episodes/${id}`);
}

/** Publish on the series' next publish day at 09:00 Cairo. */
export async function scheduleEpisode(id: string) {
  const { supabase, series } = await ownEpisode(id);
  const when = nextPublishInstant(series.publish_day);
  await supabase.from("episodes").update({ publish_at: when.toISOString(), is_published: false }).eq("id", id);
  revalidatePath(`/studio/${series.id}`);
  revalidatePath(`/studio/${series.id}/episodes/${id}`);
}

export async function unscheduleEpisode(id: string) {
  const { supabase, series } = await ownEpisode(id);
  await supabase.from("episodes").update({ publish_at: null }).eq("id", id);
  revalidatePath(`/studio/${series.id}`);
  revalidatePath(`/studio/${series.id}/episodes/${id}`);
}

export async function setEpisodePublished(id: string, published: boolean) {
  const { supabase, series } = await ownEpisode(id);
  await supabase.from("episodes").update({ is_published: published, publish_at: null }).eq("id", id);
  revalidatePath(`/studio/${series.id}`);
  revalidatePath(`/studio/${series.id}/episodes/${id}`);
  revalidatePath("/");
  revalidatePath(`/${series.kind === "comic" ? "comics" : "novels"}/${series.slug}`);
}

export async function deleteEpisode(id: string) {
  const { supabase, series } = await ownEpisode(id);
  const { data: imgs } = await supabase.from("episode_images").select("key").eq("episode_id", id);
  await supabase.from("episodes").delete().eq("id", id);
  await deleteObjects((imgs ?? []).map((i) => i.key)).catch(() => {});
  revalidatePath(`/studio/${series.id}`);
  redirect(`/studio/${series.id}`);
}

export async function presignImage(episodeId: string, contentType: string, layout: ComicLayout = "vertical") {
  const { series } = await ownEpisode(episodeId);
  if (!IMAGE_TYPES.has(contentType)) throw new Error("type");
  if (!isLayout(layout)) throw new Error("layout");
  const ext = contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : "webp";
  return presignUpload(`series/${series.id}/ep/${episodeId}/${layout}/${crypto.randomUUID()}.${ext}`, contentType);
}

export async function addImage(episodeId: string, key: string, width: number, height: number, bytes: number, layout: ComicLayout = "vertical") {
  const { supabase, series } = await ownEpisode(episodeId);
  if (!key.startsWith(`series/${series.id}/ep/${episodeId}/`)) throw new Error("key");
  if (!isLayout(layout)) throw new Error("layout");
  // Positions count from one within each layout.
  const { data: last } = await supabase.from("episode_images").select("position").eq("episode_id", episodeId).eq("layout", layout).order("position", { ascending: false }).limit(1).maybeSingle();
  const position = (last?.position ?? 0) + 1;
  const { data, error } = await supabase
    .from("episode_images")
    .insert({ episode_id: episodeId, key, width: Math.round(width), height: Math.round(height), bytes: Math.round(bytes), position, layout })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function reorderImages(episodeId: string, orderedIds: string[]) {
  const { supabase } = await ownEpisode(episodeId);
  await Promise.all(orderedIds.map((id, i) => supabase.from("episode_images").update({ position: i + 1 }).eq("id", id).eq("episode_id", episodeId)));
}

export async function deleteImage(imageId: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("episode_images").select("key, episode_id").eq("id", imageId).maybeSingle();
  if (!data) return;
  await ownEpisode(data.episode_id);
  await supabase.from("episode_images").delete().eq("id", imageId);
  await deleteObject(data.key).catch(() => {});
}
