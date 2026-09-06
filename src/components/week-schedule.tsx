"use client";

import Link from "next/link";
import { useState } from "react";
import { WEEK_ORDER, weekdayLabel, EPISODE_WORD, formatNumber } from "@/lib/constants";
import { fill } from "@/lib/i18n";
import type { SeriesSummary } from "@/lib/types";
import { Cover } from "./cover";
import { VerifiedMark } from "./icons";
import { useLang, useT } from "./lang-provider";
import { seriesHref } from "@/lib/links";

/** Weekday chips; tap a day to see what publishes on it. */
export function WeekSchedule({ items, today }: { items: SeriesSummary[]; today: number }) {
  const [day, setDay] = useState(today);
  const lang = useLang();
  const d = useT();
  const list = items.filter((s) => s.publishDay === day);

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {WEEK_ORDER.map((wd) => {
          const active = wd === day;
          return (
            <button
              key={wd}
              role="tab"
              aria-selected={active}
              onClick={() => setDay(wd)}
              className={`shrink-0 px-4 py-2 text-sm font-semibold border transition-colors ${
                active ? "bg-ink text-white border-ink" : "bg-white text-ink-2 border-hair hover:border-ink"
              }`}
            >
              {weekdayLabel(wd, lang)}
              {wd === today && <span className="sr-only"> ({d.home.today})</span>}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted border border-dashed border-hair">{fill(d.home.nothingOn, { day: weekdayLabel(day, lang) })}</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((s) => (
            <li key={s.id}>
              <Link href={seriesHref(s)} className="flex items-center gap-4 p-3 bg-surface border border-hair hover:border-ink">
                <div className="w-[56px] shrink-0">
                  <Cover src={s.coverUrl} title={s.title} tint={s.tint} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-semibold leading-snug truncate">{s.title}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    {s.creator.name}
                    {s.creator.verified && <VerifiedMark />}
                  </span>
                  <span className="text-xs text-ink-2">
                    {s.latestEpisode
                      ? `${EPISODE_WORD[s.kind][lang]} ${formatNumber(s.latestEpisode.number + 1, lang)} · ${weekdayLabel(s.publishDay, lang)}`
                      : fill(d.home.startsOn, { day: weekdayLabel(s.publishDay, lang) })}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
