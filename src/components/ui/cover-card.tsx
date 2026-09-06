"use client";

import Link from "next/link";
import { Cover } from "../cover";
import { VerifiedMark } from "../icons";
import { useLang, useT } from "../lang-provider";
import { EPISODE_WORD, formatNumber, weekdayLabel } from "@/lib/constants";
import { seriesHref } from "@/lib/links";
import type { SeriesSummary } from "@/lib/types";

export type PeekSide = "start" | "end" | false;

/**
 * The core of the site: a 2:3 cover, then the title (El Messiri 500),
 * one caption line (creator · weekday), then the Latin micro-label.
 * Nothing on the cover itself. On desktop, pointing at the cover opens a
 * page beside it, like a book: the description and the latest episode.
 */
export function CoverCard({ series, priority = false, compact = false, peek = "end" }: { series: SeriesSummary; priority?: boolean; compact?: boolean; peek?: PeekSide }) {
  const lang = useLang();
  const d = useT();
  const word = EPISODE_WORD[series.kind][lang];
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-2.5 text-ink">
      <div className={peek ? "peek-host" : undefined}>
        <div className="cover-hover">
          <Cover src={series.coverUrl} priority={priority} />
        </div>
        {peek && (
          <div className={`peek ${peek === "start" ? "peek-start" : "peek-end"} flex-col justify-between gap-3 p-4 overflow-hidden`} aria-hidden>
            <div className="flex flex-col gap-2 min-h-0">
              <span className={`t-micro ${series.kind === "novel" ? "text-violet" : ""}`} dir="ltr">
                {series.kind === "novel" ? "novels" : "web comics"}
              </span>
              <span className="t-series">{series.title}</span>
              {series.description && <p className="t-caption text-ink-2 line-clamp-[7] leading-[1.7]">{series.description}</p>}
            </div>
            <div className="flex flex-col gap-1">
              {series.latestEpisode && (
                <span className="t-caption">
                  {word} {formatNumber(series.latestEpisode.number, lang)} · {weekdayLabel(series.publishDay, lang)}
                </span>
              )}
              <span className="text-[13px] text-ink">
                {d.peek.open} {d.common.fwd}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="t-series group-hover:text-blue transition-colors line-clamp-2">{series.title}</span>
        {!compact && (
          <>
            <span className="t-caption flex items-center gap-1">
              <span className="inline-flex items-center gap-1">
                {series.creator.name}
                {series.creator.verified && <VerifiedMark size={12} />}
              </span>
              <span aria-hidden>·</span>
              <span>{weekdayLabel(series.publishDay, lang)}</span>
            </span>
            <span className={`t-micro ${series.kind === "novel" ? "text-violet" : ""}`} dir="ltr">
              {series.kind === "novel" ? "novels" : "web comics"}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

/** The grid used everywhere: two across on phones, four on desktop. The last column's peek opens inward. */
export function CoverGrid({ items, empty, priority = false, cols = 4 }: { items: SeriesSummary[]; empty?: string; priority?: boolean; cols?: 4 | 6 }) {
  if (items.length === 0) {
    return empty ? <p className="t-caption py-10 text-center">{empty}</p> : null;
  }
  return (
    <ul className={`grid grid-cols-2 gap-3 md:gap-6 ${cols === 6 ? "md:grid-cols-6" : "md:grid-cols-4"}`}>
      {items.map((s, i) => (
        <li key={s.id}>
          <CoverCard series={s} priority={priority && i < 4} peek={i % cols === cols - 1 ? "start" : "end"} />
        </li>
      ))}
    </ul>
  );
}
