export const GENRES = [
  { key: "drama", ar: "دراما", en: "Drama" },
  { key: "fantasy", ar: "فانتازيا", en: "Fantasy" },
  { key: "comedy", ar: "كوميديا", en: "Comedy" },
  { key: "action", ar: "أكشن", en: "Action" },
  { key: "romance", ar: "رومانسية", en: "Romance" },
  { key: "mystery", ar: "غموض", en: "Mystery" },
  { key: "slice_of_life", ar: "حياة يومية", en: "Slice of Life" },
  { key: "historical", ar: "تاريخي", en: "Historical" },
] as const;

export type GenreKey = (typeof GENRES)[number]["key"];

export function genreLabel(key: GenreKey, lang: "ar" | "en" = "ar") {
  const g = GENRES.find((x) => x.key === key);
  return g ? g[lang] : key;
}

/** 0 = Sunday … 6 = Saturday, matching JavaScript's Date#getDay. */
export const WEEKDAYS = [
  { day: 0, ar: "الأحد", en: "Sunday" },
  { day: 1, ar: "الاثنين", en: "Monday" },
  { day: 2, ar: "الثلاثاء", en: "Tuesday" },
  { day: 3, ar: "الأربعاء", en: "Wednesday" },
  { day: 4, ar: "الخميس", en: "Thursday" },
  { day: 5, ar: "الجمعة", en: "Friday" },
  { day: 6, ar: "السبت", en: "Saturday" },
] as const;

/** The week as it is read in Egypt: Saturday first. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

export function weekdayLabel(day: number, lang: "ar" | "en" = "ar") {
  const d = WEEKDAYS.find((x) => x.day === day);
  return d ? d[lang] : "";
}

export type SeriesKind = "comic" | "novel";

/** How a comic is drawn and read: one long strip, or page after page. */
export const LAYOUTS = [
  { key: "vertical", ar: "شريط رأسي", en: "Vertical strip" },
  { key: "horizontal", ar: "صفحات أفقية", en: "Horizontal pages" },
] as const;

export type ComicLayout = (typeof LAYOUTS)[number]["key"];

export function layoutLabel(key: ComicLayout, lang: "ar" | "en" = "ar") {
  return LAYOUTS.find((l) => l.key === key)?.[lang] ?? key;
}

export function isLayout(v: unknown): v is ComicLayout {
  return v === "vertical" || v === "horizontal";
}

export const KIND_LABEL: Record<SeriesKind, { ar: string; en: string }> = {
  comic: { ar: "قصص مصوّرة", en: "Web Comics" },
  novel: { ar: "روايات", en: "Novels" },
};

export const EPISODE_WORD: Record<SeriesKind, { ar: string; en: string }> = {
  comic: { ar: "الحلقة", en: "Episode" },
  novel: { ar: "الفصل", en: "Chapter" },
};

export const RUN_STATUS = [
  { key: "ongoing", ar: "مستمرة", en: "Ongoing" },
  { key: "completed", ar: "مكتملة", en: "Completed" },
  { key: "hiatus", ar: "متوقفة مؤقتاً", en: "On hiatus" },
] as const;
export type RunStatus = (typeof RUN_STATUS)[number]["key"];

export const AGE_RATING = [
  { key: "all", ar: "لجميع الأعمار", en: "All ages", short: { ar: "الجميع", en: "All" } },
  { key: "13", ar: "لمن هم فوق ١٣ عاماً", en: "Ages 13 and up", short: { ar: "+١٣", en: "13+" } },
  { key: "16", ar: "لمن هم فوق ١٦ عاماً", en: "Ages 16 and up", short: { ar: "+١٦", en: "16+" } },
] as const;
export type AgeRating = (typeof AGE_RATING)[number]["key"];

export const SOCIAL_KEYS = ["instagram", "x", "facebook", "youtube", "tiktok", "website"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];
export type SocialLinks = Partial<Record<SocialKey, string>>;

/** True when a scheduled time lies ahead. Kept outside components so renders stay pure. */
export function isScheduledAhead(publishAt: string | null, isPublished: boolean) {
  return !isPublished && !!publishAt && Date.parse(publishAt) > Date.now();
}

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function arabicNumber(n: number) {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/** Eastern Arabic digits in the Arabic interface, Western otherwise. */
export function formatNumber(n: number, lang: "ar" | "en" = "ar") {
  return lang === "ar" ? arabicNumber(n) : String(n);
}
