import "server-only";
import { createClient } from "./supabase/server";
import { mediaUrl } from "./media";
import type { Lang } from "./i18n";
import type { EpisodeImage, EpisodeListItem, EpisodeRow, SeriesCardRow, SeriesDetail, SeriesSummary } from "./types";
import type { SeriesKind } from "./constants";

const TINTS = ["#2B5CF6", "#6B4DE6", "#FFB800", "#FF7A59", "#1E44C2", "#111111"];

/** A stable placeholder colour per series, until a cover is uploaded. */
export function tintFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function toSummary(r: SeriesCardRow, lang: Lang = "ar"): SeriesSummary {
  return {
    id: r.id,
    slug: r.slug,
    kind: r.kind,
    title: lang === "en" && r.title_en ? r.title_en : r.title_ar,
    titleEn: r.title_en,
    genre: r.genre,
    publishDay: r.publish_day,
    coverUrl: mediaUrl(r.cover_key),
    tint: tintFor(r.id),
    creator: { id: r.creator_id, name: r.creator_name, verified: r.creator_verified },
    latestEpisode: r.latest_number ? { number: r.latest_number, publishedAt: r.latest_published_at! } : null,
    createdAt: r.approved_at ?? r.created_at,
    languages: r.languages,
  };
}

export function toDetail(r: SeriesCardRow, lang: Lang = "ar"): SeriesDetail {
  return { ...toSummary(r, lang), descriptionAr: r.description_ar, descriptionEn: r.description_en, featuredRank: r.featured_rank };
}

const CARD_COLUMNS = "*";

/** Listing pages stay up even if the database is unreachable: they log and show nothing. */
function orEmpty(error: { message: string } | null, where: string) {
  if (error) console.error(`[toomar] ${where}: ${error.message}`);
}

export async function listApproved(opts: { kind?: SeriesKind; genre?: string; lang?: Lang } = {}): Promise<SeriesSummary[]> {
  const supabase = await createClient();
  let q = supabase.from("series_cards").select(CARD_COLUMNS).order("approved_at", { ascending: false });
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.genre) q = q.eq("genre", opts.genre);
  const { data, error } = await q;
  orEmpty(error, "listApproved");
  return ((data ?? []) as SeriesCardRow[]).map((r) => toSummary(r, opts.lang));
}

export async function listPicks(lang?: Lang): Promise<SeriesSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("series_cards")
    .select(CARD_COLUMNS)
    .not("featured_rank", "is", null)
    .order("featured_rank", { ascending: true });
  orEmpty(error, "listPicks");
  return ((data ?? []) as SeriesCardRow[]).map((r) => toSummary(r, lang));
}

export async function getSeriesBySlug(slug: string, lang?: Lang): Promise<SeriesDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("series_cards").select(CARD_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? toDetail(data as SeriesCardRow, lang) : null;
}

/** A series by id through the base table: owners and the editor see it in any status. */
export async function getSeriesById(id: string, lang?: Lang): Promise<SeriesDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("series").select("*, profiles!series_creator_id_fkey(id, display_name, is_verified)").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const p = data.profiles as { id: string; display_name: string; is_verified: boolean };
  const row: SeriesCardRow = { ...data, creator_id: p.id, creator_name: p.display_name, creator_verified: p.is_verified, latest_number: null, latest_published_at: null };
  return toDetail(row, lang);
}

export async function listEpisodes(seriesId: string, lang: Lang): Promise<EpisodeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("id, number, lang, title, published_at")
    .eq("series_id", seriesId)
    .eq("lang", lang)
    .eq("is_published", true)
    .order("number", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((e) => ({ id: e.id, number: e.number, lang: e.lang, title: e.title, publishedAt: e.published_at }));
}

export async function getEpisode(seriesId: string, number: number, lang: Lang, preview = false): Promise<EpisodeRow | null> {
  const supabase = await createClient();
  let q = supabase.from("episodes").select("*").eq("series_id", seriesId).eq("number", number).eq("lang", lang);
  if (!preview) q = q.eq("is_published", true);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return (data as EpisodeRow | null) ?? null;
}

export async function listEpisodeImages(episodeId: string): Promise<EpisodeImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episode_images")
    .select("id, key, width, height")
    .eq("episode_id", episodeId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((i) => ({ id: i.id, url: mediaUrl(i.key)!, width: i.width, height: i.height }));
}

/** Published neighbours of an episode, for the reader's navigation. */
export async function getNeighbours(seriesId: string, number: number, lang: Lang, preview = false) {
  const supabase = await createClient();
  const base = () => {
    const q = supabase.from("episodes").select("number").eq("series_id", seriesId).eq("lang", lang);
    return preview ? q : q.eq("is_published", true);
  };
  const [{ data: prev }, { data: next }] = await Promise.all([
    base().lt("number", number).order("number", { ascending: false }).limit(1).maybeSingle(),
    base().gt("number", number).order("number", { ascending: true }).limit(1).maybeSingle(),
  ]);
  return { prev: prev?.number ?? null, next: next?.number ?? null };
}

export async function isFollowing(userId: string | null, seriesId: string) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase.from("follows").select("series_id").eq("user_id", userId).eq("series_id", seriesId).maybeSingle();
  return !!data;
}

export async function getProgress(userId: string | null, seriesId: string) {
  if (!userId) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("reading_progress").select("number, lang").eq("user_id", userId).eq("series_id", seriesId).maybeSingle();
  return data as { number: number; lang: Lang } | null;
}

export async function searchSeries(term: string, lang?: Lang): Promise<SeriesSummary[]> {
  const q = term.trim();
  if (!q) return [];
  const supabase = await createClient();
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const { data, error } = await supabase
    .from("series_cards")
    .select(CARD_COLUMNS)
    .or(`title_ar.ilike.${like},title_en.ilike.${like},creator_name.ilike.${like}`)
    .limit(30);
  if (error) throw error;
  return ((data ?? []) as SeriesCardRow[]).map((r) => toSummary(r, lang));
}

/** Weekday in Cairo right now (0 = Sunday). */
export function cairoWeekday(now = Date.now()) {
  return new Date(new Date(now).toLocaleString("en-US", { timeZone: "Africa/Cairo" })).getDay();
}

/** The next calendar date on which a series publishes, as a weekday label key and ISO date. */
export function nextPublishDate(publishDay: number, now = Date.now()) {
  const cairo = new Date(new Date(now).toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
  const diff = (publishDay - cairo.getDay() + 7) % 7 || 7;
  const d = new Date(cairo);
  d.setDate(cairo.getDate() + diff);
  return d;
}
