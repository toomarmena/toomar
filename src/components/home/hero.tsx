import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@/components/icons";
import { EPISODE_WORD, formatNumber } from "@/lib/constants";
import type { Dict, Lang } from "@/lib/i18n";
import { seriesHref } from "@/lib/links";
import type { SeriesSummary } from "@/lib/types";
import Link from "next/link";

/**
 * Poster hero: the headline is the picture. A 2:3 cover bleeds off the
 * left edge, tilted, with the ink border and a hard shadow.
 */
export function Hero({ featured, lang, d }: { featured: SeriesSummary | null; lang: Lang; d: Dict }) {
  const word = featured ? EPISODE_WORD[featured.kind][lang] : "";
  const cover = (
    <div className="absolute left-[-46px] top-8 w-[150px] md:left-[-40px] md:top-10 md:w-[380px] rotate-[-7deg] md:rotate-[-5deg] frame bg-coral shadow-[6px_6px_0_#111111] md:shadow-[10px_10px_0_#111111] cover-2-3">
      {featured?.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={featured.coverUrl} alt="" loading="eager" fetchPriority="high" decoding="async" />
      ) : (
        <span className="cover-letter absolute inset-0 flex items-center justify-center font-display text-ink leading-none" aria-hidden>
          {(featured?.title ?? "طومار").trim().charAt(0)}
        </span>
      )}
      {featured?.latestEpisode && (
        <Badge className="absolute right-2 top-2 md:right-4 md:top-4">
          {word} {formatNumber(featured.latestEpisode.number, lang)}
        </Badge>
      )}
      {featured && (
        <span className="hidden md:block absolute right-4 bottom-4 left-4 font-display text-[26px] leading-[1.1] text-white [text-shadow:2px_2px_0_#111111] text-balance">{featured.title}</span>
      )}
    </div>
  );

  return (
    <section className="relative overflow-hidden border-b-2 border-ink px-5 pt-10 pb-10 md:px-16 md:pt-16 md:pb-14">
      {featured ? (
        <Link href={seriesHref(featured)} aria-label={featured.title} className="contents">
          {cover}
        </Link>
      ) : (
        cover
      )}
      <div className="relative flex flex-col gap-4 md:gap-[22px] max-w-[250px] md:max-w-[900px] md:ps-0 md:pe-0 md:ml-[340px] lg:ml-0">
        <span className="t-label text-[11px] md:text-[13px]">{d.home.eyebrow}</span>
        <h1 className="t-h1 text-balance">
          {d.home.h1a}
          <br />
          {d.home.h1b}
        </h1>
        <p className="m-0 text-[14px] md:text-[22px] leading-[1.6] text-ink-2 max-w-[520px]">{d.home.lede}</p>
        <div className="flex flex-wrap items-center gap-5 md:gap-[22px] pt-2 md:pt-2.5">
          <Button href="/comics" variant="primary" size="lg" className="max-md:h-12 max-md:px-5">
            {d.home.start}
            <IconArrowLeft width={20} height={20} strokeWidth={2.6} className={`hidden md:block ${lang === "en" ? "-scale-x-100" : ""}`} />
          </Button>
          <Button href="/studio" variant="link">
            {d.home.haveStory}
          </Button>
        </div>
      </div>
    </section>
  );
}
