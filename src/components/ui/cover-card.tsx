"use client";

import Link from "next/link";
import { Cover } from "../cover";
import { VerifiedMark } from "../icons";
import { useLang, useT } from "../lang-provider";
import { weekdayLabel } from "@/lib/constants";
import { seriesHref } from "@/lib/links";
import type { SeriesSummary } from "@/lib/types";

/**
 * The core of the site: a 2:3 cover, then the title (El Messiri 500),
 * one caption line (creator · weekday), then the Latin micro-label.
 * Nothing on the cover itself. On desktop, pointing at it turns the cover
 * in 3D like a book on a table, its pages showing at the edge.
 */
export function CoverCard({ series, priority = false, compact = false }: { series: SeriesSummary; priority?: boolean; compact?: boolean }) {
  const lang = useLang();
  const d = useT();
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-2.5 text-ink">
      <div className="book-host">
        <div className="book">
          <div className="book-pages" aria-hidden />
          <div className="book-face">
            <Cover src={series.coverUrl} priority={priority} />
          </div>
        </div>
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
              {series.fresh && (
                <>
                  <span aria-hidden>·</span>
                  <span className="text-ink">{d.series.newLabel}</span>
                </>
              )}
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

/** The grid used everywhere: two across on phones, four on desktop. */
export function CoverGrid({ items, empty, priority = false, cols = 4 }: { items: SeriesSummary[]; empty?: string; priority?: boolean; cols?: 4 | 6 }) {
  if (items.length === 0) {
    return empty ? <p className="t-caption py-10 text-center">{empty}</p> : null;
  }
  return (
    <ul className={`grid grid-cols-2 gap-3 md:gap-6 ${cols === 6 ? "md:grid-cols-6" : "md:grid-cols-4"}`}>
      {items.map((s, i) => (
        <li key={s.id}>
          <CoverCard series={s} priority={priority && i < 4} />
        </li>
      ))}
    </ul>
  );
}
