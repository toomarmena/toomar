"use client";

import Link from "next/link";
import { Badge } from "./badge";
import { Cover } from "../cover";
import { VerifiedMark } from "../icons";
import { useLang, useT } from "../lang-provider";
import { EPISODE_WORD, formatNumber, weekdayLabel } from "@/lib/constants";
import { seriesHref } from "@/lib/links";
import type { SeriesSummary } from "@/lib/types";

/**
 * 2:3 cover with border + hard shadow, section badge top-right, Reem Kufi
 * title, creator with the verified check, latest episode and publish day.
 */
export function CoverCard({ series, priority = false, width }: { series: SeriesSummary; priority?: boolean; width?: number }) {
  const lang = useLang();
  const d = useT();
  const word = EPISODE_WORD[series.kind][lang];
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-2 md:gap-3 text-ink shrink-0" style={width ? { width } : undefined}>
      <div className="relative press shadow-hard">
        <Cover src={series.coverUrl} title={series.title} priority={priority} />
        <Badge className="absolute top-2 right-2 md:top-3.5 md:right-3.5">{series.kind === "comic" ? d.nav.comics : d.nav.novels}</Badge>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="t-series group-hover:text-blue line-clamp-2">{series.title}</span>
        <span className="flex flex-wrap items-center gap-1 text-[12px] md:text-[14px] text-ink-2">
          <span className="inline-flex items-center gap-1">
            {series.creator.name}
            {series.creator.verified && <VerifiedMark />}
          </span>
          {series.latestEpisode && (
            <>
              <span aria-hidden>·</span>
              <span>
                {word} {formatNumber(series.latestEpisode.number, lang)}
              </span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{weekdayLabel(series.publishDay, lang)}</span>
        </span>
      </div>
    </Link>
  );
}

/** Small schedule tile: 2:3 cover with border, title, latest episode. */
export function CoverTile({ series }: { series: SeriesSummary }) {
  const lang = useLang();
  const word = EPISODE_WORD[series.kind][lang];
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-1.5 md:gap-2 text-ink">
      <Cover src={series.coverUrl} title={series.title} />
      <span className="text-[12px] md:text-[14px] font-bold leading-snug group-hover:text-blue line-clamp-2">{series.title}</span>
      {series.latestEpisode && (
        <span className="text-[11px] md:text-[12px] text-muted -mt-1">
          {word} {formatNumber(series.latestEpisode.number, lang)}
        </span>
      )}
    </Link>
  );
}
