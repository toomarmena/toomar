import "server-only";
import { createClient } from "./supabase/server";
import { mediaUrl } from "./media";
import type { Lang } from "./i18n";
import type { CreatorCard, CreatorProfile, EpisodeImage, EpisodeListItem, EpisodeRow, EpisodeStats, SeriesCardRow, SeriesDetail, SeriesSummary } from "./types";
import { SOCIAL_KEYS, type SeriesKind, type SocialLinks } from "./constants";

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
    creator: { id: r.creator_id, name: r.creator_name, verified: r.creator_verified, handle: r.creator_handle, avatarUrl: mediaUrl(r.creator_avatar_key) },
    latestEpisode: r.latest_number ? { number: r.latest_number, publishedAt: r.latest_published_at! } : null,
    createdAt: r.approved_at ?? r.created_at,
    languages: r.languages,
    runStatus: r.run_status ?? "ongoing",
    ageRating: r.age_rating ?? "all",
  };
}

/** Keeps only the known social keys, as strings. */
export function cleanSocialLinks(raw: unknown): SocialLinks {
  const out: SocialLinks = {};
  if (raw && typeof raw === "object") {
    for (const k of SOCIAL_KEYS) {
      const v = (raw as Record<string, unknown>)[k];
      if (typeof v === "string" && v) out[k] = v;
    }
  }
  return out;
}

type ProfileRow = { id: string; display_name: string; is_verified: boolean; handle: string; avatar_key: string | null; bio: string | null; social_links: unknown };

function toCreatorProfile(p: ProfileRow): CreatorProfile {
  return { id: p.id, name: p.display_name, verified: p.is_verified, handle: p.handle, avatarUrl: mediaUrl(p.avatar_key), bio: p.bio, socialLinks: cleanSocialLinks(p.social_links) };
}

/** A creator by handle, falling back to id (old links). */
export async function getCreator(handleOrId: string): Promise<CreatorProfile | null> {
  const supabase = await createClient();
  const cols = "id, display_name, is_verified, handle, avatar_key, bio, social_links";
  const { data } = await supabase.from("profiles").select(cols).eq("handle", handleOrId.toLowerCase()).maybeSingle();
  if (data) return toCreatorProfile(data as ProfileRow);
  if (/^[0-9a-f-]{36}$/i.test(handleOrId)) {
    const { data: byId } = await supabase.from("profiles").select(cols).eq("id", handleOrId).maybeSingle();
    if (byId) return toCreatorProfile(byId as ProfileRow);
  }
  return null;
}

export type CreatorFilter = "all" | "artists" | "authors";

type CreatorCardRow = { id: string; display_name: string; handle: string; avatar_key: string | null; is_verified: boolean; bio: string | null; has_comics: boolean; has_novels: boolean; latest_approved_at: string | null };

function toCreatorCard(r: CreatorCardRow): CreatorCard {
  return { id: r.id, name: r.display_name, verified: r.is_verified, handle: r.handle, avatarUrl: mediaUrl(r.avatar_key), bio: r.bio, hasComics: r.has_comics, hasNovels: r.has_novels };
}

/** Everyone with a published series. Verified first, then the most recently published. */
export async function listCreators(filter: CreatorFilter = "all"): Promise<CreatorCard[]> {
  const supabase = await createClient();
  let q = supabase.from("creator_cards").select("*").order("is_verified", { ascending: false }).order("latest_approved_at", { ascending: false });
  if (filter === "artists") q = q.eq("has_comics", true);
  if (filter === "authors") q = q.eq("has_novels", true);
  const { data, error } = await q;
  orEmpty(error, "listCreators");
  return ((data ?? []) as CreatorCardRow[]).map(toCreatorCard);
}

export async function searchCreators(term: string): Promise<CreatorCard[]> {
  const q = term.trim();
  if (!q) return [];
  const supabase = await createClient();
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const { data, error } = await supabase.from("creator_cards").select("*").or(`display_name.ilike.${like},handle.ilike.${like}`).limit(12);
  orEmpty(error, "searchCreators");
  return ((data ?? []) as CreatorCardRow[]).map(toCreatorCard);
}

/** Retention numbers for one series. Empty unless the caller owns it or is the editor. */
export async function getSeriesStats(seriesId: string): Promise<EpisodeStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("series_stats", { sid: seriesId });
  if (error) throw error;
  return (data ?? []) as EpisodeStats[];
}

export function toDetail(r: SeriesCardRow, lang: Lang = "ar"): SeriesDetail {
  return { ...toSummary(r, lang), descriptionAr: r.description_ar, descriptionEn: r.description_en, featuredRank: r.featured_rank };
}

const CARD_COLUMNS = "*";

/** Listing pages stay up even if the database is unreachable: they log and show nothing. */
function orEmpty(error: { message: string } | null, where: string) {
  if (error) console.error(`[toomar] ${where}: ${error.message}`);
}

export async function listApproved(opts: { kind?: SeriesKind; genre?: string; lang?: Lang; creatorId?: string } = {}): Promise<SeriesSummary[]> {
  const supabase = await createClient();
  let q = supabase.from("series_cards").select(CARD_COLUMNS).order("approved_at", { ascending: false });
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.genre) q = q.eq("genre", opts.genre);
  if (opts.creatorId) q = q.eq("creator_id", opts.creatorId);
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
  const { data, error } = await supabase.from("series").select("*, profiles!series_creator_id_fkey(id, display_name, is_verified, handle, avatar_key)").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const p = data.profiles as { id: string; display_name: string; is_verified: boolean; handle: string; avatar_key: string | null };
  const row: SeriesCardRow = { ...data, creator_id: p.id, creator_name: p.display_name, creator_verified: p.is_verified, creator_handle: p.handle, creator_avatar_key: p.avatar_key, latest_number: null, latest_published_at: null };
  return toDetail(row, lang);
}

export async function listEpisodes(seriesId: string, lang: Lang): Promise<EpisodeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("id, number, lang, title, published_at, episode_images(key, position)")
    .eq("series_id", seriesId)
    .eq("lang", lang)
    .eq("is_published", true)
    .order("number", { ascending: false })
    .order("position", { referencedTable: "episode_images", ascending: true })
    .limit(1, { referencedTable: "episode_images" });
  if (error) throw error;
  return (data ?? []).map((e) => {
    const first = (e.episode_images as { key: string }[] | null)?.[0];
    return { id: e.id, number: e.number, lang: e.lang, title: e.title, publishedAt: e.published_at, thumbUrl: mediaUrl(first?.key) };
  });
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
