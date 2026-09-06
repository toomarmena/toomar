import type { GenreKey, SeriesKind } from "./constants";

export type Creator = {
  id: string;
  name: string;
  verified: boolean;
};

export type SeriesSummary = {
  id: string;
  slug: string;
  kind: SeriesKind;
  title: string;
  titleEn: string;
  genre: GenreKey;
  publishDay: number;
  coverUrl: string | null;
  /** Placeholder tint used until a cover is uploaded. */
  tint: string;
  creator: Creator;
  latestEpisode: { number: number; publishedAt: string } | null;
  createdAt: string;
};
