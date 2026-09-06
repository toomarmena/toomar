"use client";

import Link from "next/link";
import { Cover } from "./cover";
import { VerifiedMark } from "./icons";
import { useLang } from "./lang-provider";
import { genreLabel } from "@/lib/constants";
import type { SeriesSummary } from "@/lib/types";

export function seriesHref(s: Pick<SeriesSummary, "kind" | "slug">) {
  return `/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}`;
}

export function SeriesCard({ series, priority = false }: { series: SeriesSummary; priority?: boolean }) {
  const lang = useLang();
  const kindColor = series.kind === "comic" ? "text-blue" : "text-violet";
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-2.5 text-ink">
      <Cover src={series.coverUrl} title={series.title} tint={series.tint} priority={priority} />
      <div className="flex flex-col gap-1">
        <span className={`text-[11px] font-semibold tracking-[0.06em] ${kindColor}`}>{genreLabel(series.genre, lang)}</span>
        <span className="text-[15px] md:text-base font-semibold leading-snug group-hover:text-blue line-clamp-2">{series.title}</span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
          {series.creator.name}
          {series.creator.verified && <VerifiedMark />}
        </span>
      </div>
    </Link>
  );
}

/** A row that scrolls sideways on phones and becomes a grid on wider screens. */
export function SeriesRail({ items, priorityFirst = false, empty }: { items: SeriesSummary[]; priorityFirst?: boolean; empty?: string }) {
  if (items.length === 0 && empty) {
    return <p className="py-8 text-center text-sm text-muted border border-dashed border-hair">{empty}</p>;
  }
  return (
    <ul className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-5 md:overflow-visible">
      {items.map((s, i) => (
        <li key={s.id} className="w-[42vw] max-w-[190px] shrink-0 snap-start md:w-auto md:max-w-none">
          <SeriesCard series={s} priority={priorityFirst && i < 2} />
        </li>
      ))}
    </ul>
  );
}

/** A full grid for listing pages. */
export function SeriesGrid({ items, empty }: { items: SeriesSummary[]; empty: string }) {
  if (items.length === 0) {
    return <p className="py-12 text-center text-sm text-muted border border-dashed border-hair">{empty}</p>;
  }
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {items.map((s, i) => (
        <li key={s.id}>
          <SeriesCard series={s} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}
