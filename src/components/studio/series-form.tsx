"use client";

import { AGE_RATING, GENRES, RUN_STATUS, WEEK_ORDER, weekdayLabel } from "@/lib/constants";
import type { SeriesRow } from "@/lib/types";
import { useLang, useT } from "../lang-provider";

const input = "w-full h-12 px-4 border border-hair bg-white text-ink focus:outline-none focus:border-ink font-normal";
const area = "w-full p-4 border border-hair bg-white text-ink focus:outline-none focus:border-ink font-normal";
const label = "flex flex-col gap-1.5 text-sm font-semibold";

export function SeriesForm({ action, series, error }: { action: (form: FormData) => void | Promise<void>; series?: SeriesRow; error?: string }) {
  const d = useT();
  const lang = useLang();
  const editing = !!series;

  return (
    <form action={action} className="flex flex-col gap-5 max-w-[640px]">
      {!editing && (
        <fieldset className="flex flex-col gap-1.5 text-sm font-semibold">
          <legend className="mb-1.5">{d.studio.kind}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["comic", "novel"] as const).map((k) => (
              <label key={k} className="flex items-center gap-3 p-4 border border-hair has-[:checked]:border-ink has-[:checked]:bg-surface cursor-pointer">
                <input type="radio" name="kind" value={k} defaultChecked={k === "comic"} className="accent-blue" />
                {k === "comic" ? d.studio.comic : d.studio.novel}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className={label}>
        {d.studio.titleAr}
        <input name="title_ar" required maxLength={120} defaultValue={series?.title_ar ?? ""} className={input} dir="rtl" />
      </label>
      <label className={label}>
        {d.studio.titleEn}
        <input name="title_en" maxLength={120} defaultValue={series?.title_en ?? ""} className={input} dir="ltr" />
      </label>
      <label className={label}>
        {d.studio.descAr}
        <textarea name="description_ar" rows={4} maxLength={2000} defaultValue={series?.description_ar ?? ""} className={area} dir="rtl" />
      </label>
      <label className={label}>
        {d.studio.descEn}
        <textarea name="description_en" rows={4} maxLength={2000} defaultValue={series?.description_en ?? ""} className={area} dir="ltr" />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={label}>
          {d.studio.genre}
          <select name="genre" required defaultValue={series?.genre ?? ""} className={input}>
            <option value="" disabled>
              —
            </option>
            {GENRES.map((g) => (
              <option key={g.key} value={g.key}>
                {g[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          {d.studio.publishDay}
          <select name="publish_day" required defaultValue={series?.publish_day ?? ""} className={input}>
            <option value="" disabled>
              —
            </option>
            {WEEK_ORDER.map((wd) => (
              <option key={wd} value={wd}>
                {weekdayLabel(wd, lang)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={label}>
          {d.studio.runStatus}
          <select name="run_status" defaultValue={series?.run_status ?? "ongoing"} className={input}>
            {RUN_STATUS.map((r) => (
              <option key={r.key} value={r.key}>
                {r[lang]}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1.5 text-sm font-semibold">
          <legend className="mb-1.5">{d.studio.ageRating}</legend>
          <div className="flex flex-col gap-1.5 font-normal">
            {AGE_RATING.map((r) => (
              <label key={r.key} className="flex items-center gap-2">
                <input type="radio" name="age_rating" value={r.key} defaultChecked={(series?.age_rating ?? "all") === r.key} className="accent-blue" />
                {r[lang]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-1.5 text-sm font-semibold">
        <legend className="mb-1.5">{d.studio.languages}</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 font-normal">
            <input type="checkbox" name="languages" value="ar" defaultChecked={series ? series.languages.includes("ar") : true} className="accent-blue" />
            العربية
          </label>
          <label className="flex items-center gap-2 font-normal">
            <input type="checkbox" name="languages" value="en" defaultChecked={series?.languages.includes("en") ?? false} className="accent-blue" />
            English
          </label>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-[#B3261E]">
          {d.studio.errors.required}
        </p>
      )}

      <button type="submit" className="self-start px-7 h-12 bg-blue text-white font-bold hover:bg-blue-deep">
        {editing ? d.studio.save : d.studio.create}
      </button>
    </form>
  );
}
