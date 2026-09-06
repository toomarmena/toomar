import type { AgeRating, GenreKey, RunStatus, SeriesKind, SocialLinks } from "./constants";
import type { Lang } from "./i18n";

export type Creator = {
  id: string;
  name: string;
  verified: boolean;
  handle: string;
  avatarUrl: string | null;
};

export type CreatorProfile = Creator & {
  bio: string | null;
  socialLinks: SocialLinks;
};

/** A row of the creators' directory. */
export type CreatorCard = Creator & {
  bio: string | null;
  hasComics: boolean;
  hasNovels: boolean;
};

/** What a card or list needs. Built from the `series_cards` view. */
export type SeriesSummary = {
  id: string;
  slug: string;
  kind: SeriesKind;
  title: string;
  titleEn: string | null;
  genre: GenreKey;
  publishDay: number;
  coverUrl: string | null;
  tint: string;
  creator: Creator;
  latestEpisode: { number: number; publishedAt: string } | null;
  createdAt: string;
  languages: Lang[];
  runStatus: RunStatus;
  ageRating: AgeRating;
  /** Short description in the interface language. */
  description: string | null;
  /** Latest episode went live within the last three days. */
  fresh: boolean;
};

export type SeriesDetail = SeriesSummary & {
  descriptionAr: string | null;
  descriptionEn: string | null;
  featuredRank: number | null;
};

export type EpisodeListItem = {
  id: string;
  number: number;
  lang: Lang;
  title: string | null;
  publishedAt: string | null;
  thumbUrl: string | null;
};

export type EpisodeImage = { id: string; url: string; width: number; height: number };

/** Raw row of the series_cards view. */
export type SeriesCardRow = {
  id: string;
  slug: string;
  kind: SeriesKind;
  genre: GenreKey;
  publish_day: number;
  cover_key: string | null;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  languages: Lang[];
  featured_rank: number | null;
  approved_at: string | null;
  created_at: string;
  creator_id: string;
  creator_name: string;
  creator_verified: boolean;
  latest_number: number | null;
  latest_published_at: string | null;
  run_status: RunStatus;
  age_rating: AgeRating;
  creator_handle: string;
  creator_avatar_key: string | null;
};

export type SeriesRow = {
  id: string;
  slug: string;
  kind: SeriesKind;
  creator_id: string;
  genre: GenreKey;
  publish_day: number;
  status: "draft" | "pending" | "approved" | "rejected";
  rejection_note: string | null;
  cover_key: string | null;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  languages: Lang[];
  adaptation_of: string | null;
  featured_rank: number | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  run_status: RunStatus;
  age_rating: AgeRating;
};

export type EpisodeStats = {
  episode_id: string;
  number: number;
  lang: Lang;
  openers: number;
  completers: number;
  returned: number;
  liked: number;
};

export type EpisodeRow = {
  id: string;
  series_id: string;
  number: number;
  lang: Lang;
  title: string | null;
  body: string | null;
  is_published: boolean;
  published_at: string | null;
  publish_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportRow = {
  id: string;
  series_id: string;
  episode_id: string | null;
  reporter_id: string | null;
  reason: string;
  created_at: string;
  resolved_at: string | null;
};

export type EpisodeImageRow = {
  id: string;
  episode_id: string;
  position: number;
  key: string;
  width: number;
  height: number;
  bytes: number | null;
};
