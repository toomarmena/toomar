"use client";

import { useState } from "react";
import { WEEK_ORDER, weekdayLabel } from "@/lib/constants";
import { fill } from "@/lib/i18n";
import type { SeriesSummary } from "@/lib/types";
import { useLang, useT } from "./lang-provider";
import { Chip } from "./ui/chip";
import { CoverCard } from "./ui/cover-card";

/** Weekday chips; tap a day to see what publishes on it. Compact cards: cover and title only. */
export function WeekSchedule({ items, today }: { items: SeriesSummary[]; today: number }) {
  const [day, setDay] = useState(today);
  const lang = useLang();
  const d = useT();
  const list = items.filter((s) => s.publishDay === day);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
        {WEEK_ORDER.map((wd) => (
          <Chip key={wd} role="tab" ariaSelected={wd === day} active={wd === day} onClick={() => setDay(wd)}>
            {weekdayLabel(wd, lang)}
            {wd === today && <span className="sr-only"> ({d.home.today})</span>}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="t-caption py-10 text-center">{fill(d.home.nothingOn, { day: weekdayLabel(day, lang) })}</p>
      ) : (
        <ul className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6">
          {list.map((s, i) => (
            <li key={s.id}>
              <CoverCard series={s} compact peek={i % 6 === 5 ? "start" : "end"} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
