"use client";

import { AGE_RATING, GENRES, RUN_STATUS, WEEK_ORDER, weekdayLabel } from "@/lib/constants";
import type { SeriesRow } from "@/lib/types";
import { useLang, useT } from "../lang-provider";
import { Button } from "../ui/button";

const label = "flex flex-col gap-1.5 t-caption text-ink";

export function SeriesForm({ action, series, error }: { action: (form: FormData) => void | Promise<void>; series?: SeriesRow; error?: string }) {
  const d = useT();
  const lang = useLang();
  const editing = !!series;

  return (
    <form action={action} className="flex flex-col gap-5 max-w-[560px]">
      {!editing && (
        <fieldset className="flex flex-col gap-2">
          <legend className="t-caption text-ink mb-2">{d.studio.kind}</legend>
          <div className="flex gap-6 text-[15px]">
            {(["comic", "novel"] as const).map((k) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="kind" value={k} defaultChecked={k === "comic"} className="accent-ink" />
                {k === "comic" ? d.studio.comic : d.studio.novel}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className={label}>
        {d.studio.titleAr}
        <input name="title_ar" required maxLength={120} defaultValue={series?.title_ar ?? ""} className="field text-[15px]" dir="rtl" />
      </label>
      <label className={label}>
        {d.studio.titleEn}
        <input name="title_en" maxLength={120} defaultValue={series?.title_en ?? ""} className="field text-[15px]" dir="ltr" />
      </label>
      <label className={label}>
        {d.studio.descAr}
        <textarea name="description_ar" rows={4} maxLength={2000} defaultValue={series?.description_ar ?? ""} className="field text-[15px]" dir="rtl" />
      </label>
      <label className={label}>
        {d.studio.descEn}
        <textarea name="description_en" rows={4} maxLength={2000} defaultValue={series?.description_en ?? ""} className="field text-[15px]" dir="ltr" />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={label}>
          {d.studio.genre}
          <select name="genre" required defaultValue={series?.genre ?? ""} className="field text-[15px]">
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
          <select name="publish_day" required defaultValue={series?.publish_day ?? ""} className="field text-[15px]">
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
        <label className={label}>
          {d.studio.runStatus}
          <select name="run_status" defaultValue={series?.run_status ?? "ongoing"} className="field text-[15px]">
            {RUN_STATUS.map((r) => (
              <option key={r.key} value={r.key}>
                {r[lang]}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="t-caption text-ink mb-1.5">{d.studio.ageRating}</legend>
          <div className="flex flex-col gap-1.5 text-[15px]">
            {AGE_RATING.map((r) => (
              <label key={r.key} className="flex items-center gap-2">
                <input type="radio" name="age_rating" value={r.key} defaultChecked={(series?.age_rating ?? "all") === r.key} className="accent-ink" />
                {r[lang]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="t-caption text-ink mb-1.5">{d.studio.languages}</legend>
        <div className="flex gap-6 text-[15px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="languages" value="ar" defaultChecked={series ? series.languages.includes("ar") : true} className="accent-ink" />
            العربية
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="languages" value="en" defaultChecked={series?.languages.includes("en") ?? false} className="accent-ink" />
            English
          </label>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="t-caption text-ink">
          {d.studio.errors.required}
        </p>
      )}

      <Button type="submit" variant="primary" className="self-start">
        {editing ? d.studio.save : d.studio.create}
      </Button>
    </form>
  );
}
