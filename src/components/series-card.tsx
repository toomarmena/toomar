import Link from "next/link";
import { Cover } from "./cover";
import { VerifiedMark } from "./icons";
import { genreLabel } from "@/lib/constants";
import type { SeriesSummary } from "@/lib/types";

export function seriesHref(s: Pick<SeriesSummary, "kind" | "slug">) {
  return `/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}`;
}

export function SeriesCard({ series, priority = false }: { series: SeriesSummary; priority?: boolean }) {
  const kindColor = series.kind === "comic" ? "text-blue" : "text-violet";
  return (
    <Link href={seriesHref(series)} className="group flex flex-col gap-2.5 text-ink">
      <Cover src={series.coverUrl} title={series.title} tint={series.tint} priority={priority} />
      <div className="flex flex-col gap-1">
        <span className={`text-[11px] font-semibold tracking-[0.06em] ${kindColor}`}>{genreLabel(series.genre)}</span>
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
export function SeriesRail({ items, priorityFirst = false }: { items: SeriesSummary[]; priorityFirst?: boolean }) {
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
