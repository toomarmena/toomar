"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { GENRES, type GenreKey } from "@/lib/constants";
import { isLang, type Lang } from "@/lib/i18n";
import { deleteObject, deleteObjects, presignUpload } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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
  return { kind, title_ar, title_en, description_ar, description_en, genre, publish_day, languages: languages.length ? languages : (["ar"] as Lang[]) };
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
  const body = series.kind === "novel" ? String(form.get("body") ?? "").replace(/\r\n/g, "\n").slice(0, 200000) || null : undefined;
  await supabase
    .from("episodes")
    .update(body === undefined ? { title } : { title, body })
    .eq("id", id);
  revalidatePath(`/studio/${series.id}/episodes/${id}`);
}

export async function setEpisodePublished(id: string, published: boolean) {
  const { supabase, series } = await ownEpisode(id);
  await supabase.from("episodes").update({ is_published: published }).eq("id", id);
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

export async function presignImage(episodeId: string, contentType: string) {
  const { series } = await ownEpisode(episodeId);
  if (!IMAGE_TYPES.has(contentType)) throw new Error("type");
  const ext = contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : "webp";
  return presignUpload(`series/${series.id}/ep/${episodeId}/${crypto.randomUUID()}.${ext}`, contentType);
}

export async function addImage(episodeId: string, key: string, width: number, height: number, bytes: number) {
  const { supabase, series } = await ownEpisode(episodeId);
  if (!key.startsWith(`series/${series.id}/ep/${episodeId}/`)) throw new Error("key");
  const { data: last } = await supabase.from("episode_images").select("position").eq("episode_id", episodeId).order("position", { ascending: false }).limit(1).maybeSingle();
  const position = (last?.position ?? 0) + 1;
  const { data, error } = await supabase
    .from("episode_images")
    .insert({ episode_id: episodeId, key, width: Math.round(width), height: Math.round(height), bytes: Math.round(bytes), position })
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
