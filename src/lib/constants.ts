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

export const KIND_LABEL: Record<SeriesKind, { ar: string; en: string }> = {
  comic: { ar: "قصص مصوّرة", en: "Web Comics" },
  novel: { ar: "روايات", en: "Novels" },
};

export const EPISODE_WORD: Record<SeriesKind, { ar: string; en: string }> = {
  comic: { ar: "الحلقة", en: "Episode" },
  novel: { ar: "الفصل", en: "Chapter" },
};

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export function arabicNumber(n: number) {
  return String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}
