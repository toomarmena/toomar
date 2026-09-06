"use client";

import { useState } from "react";
import { WEEK_ORDER, weekdayLabel } from "@/lib/constants";
import { fill } from "@/lib/i18n";
import type { SeriesSummary } from "@/lib/types";
import { useLang, useT } from "./lang-provider";
import { Chip } from "./ui/chip";
import { CoverTile } from "./ui/cover-card";

/** Weekday chips; tap a day to see what publishes on it. Six 2:3 tiles across on desktop, three on phones. */
export function WeekSchedule({ items, today }: { items: SeriesSummary[]; today: number }) {
  const [day, setDay] = useState(today);
  const lang = useLang();
  const d = useT();
  const list = items.filter((s) => s.publishDay === day);

  return (
    <div className="flex flex-col gap-3 md:gap-[18px]">
      <div role="tablist" className="flex gap-2 md:gap-2.5 overflow-x-auto no-scrollbar -mx-[18px] px-[18px] pb-1 md:mx-0 md:px-0 md:pb-0">
        {WEEK_ORDER.map((wd) => (
          <Chip key={wd} role="tab" ariaSelected={wd === day} active={wd === day} onClick={() => setDay(wd)}>
            {weekdayLabel(wd, lang)}
            {wd === today && <span className="sr-only"> ({d.home.today})</span>}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted frame border-dashed">{fill(d.home.nothingOn, { day: weekdayLabel(day, lang) })}</p>
      ) : (
        <ul className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {list.map((s) => (
            <li key={s.id}>
              <CoverTile series={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
