"use client";

import Link from "next/link";
import { Cover } from "../cover";
import { VerifiedMark } from "../icons";
import { useLang } from "../lang-provider";
import { weekdayLabel } from "@/lib/constants";
import { seriesHref } from "@/lib/links";
import type { SeriesSummary } from "@/lib/types";

/**
 * The core of the site: a 2:3 cover, then the title (El Messiri 500),
 * one caption line (creator · weekday), then the Latin micro-label.
 * Nothing on the cover itself.
 */
export function CoverCard({ series, priority = false, compact = false }: { series: SeriesSummary; priority?: boolean; compact?: boolean }) {
  const lang = useLang();
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-2.5 text-ink">
      <div className="cover-hover">
        <Cover src={series.coverUrl} priority={priority} />
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
