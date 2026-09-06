"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FollowButton } from "../follow-button";
import { useLang, useT } from "../lang-provider";
import { Button } from "../ui/button";
import { anonId } from "./chrome";
import { recordEvent } from "@/app/reader-actions";
import { EPISODE_WORD, formatNumber, weekdayLabel, type RunStatus, type SeriesKind } from "@/lib/constants";
import { fill } from "@/lib/i18n";

/**
 * «يُتبع…» closes every episode on a quiet ground. Records completion
 * when it scrolls into view and prefetches the start of the next episode.
 */
export function EndCard({
  kind,
  seriesId,
  episodeId,
  number,
  publishDay,
  runStatus,
  prevHref,
  nextHref,
  nextPreview,
  seriesHref,
  creatorName,
  creatorHref,
  following,
  signedIn,
  track = true,
}: {
  kind: SeriesKind;
  seriesId: string;
  episodeId: string;
  number: number;
  publishDay: number;
  runStatus: RunStatus;
  prevHref: string | null;
  nextHref: string | null;
  nextPreview: string[];
  seriesHref: string;
  seriesTitle?: string;
  creatorName: string;
  creatorHref: string;
  following: boolean;
  signedIn: boolean;
  track?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const d = useT();
  const ui = useLang();
  const word = EPISODE_WORD[kind][ui];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (done || !entries.some((e) => e.isIntersecting)) return;
        done = true;
        if (track) recordEvent("complete", seriesId, episodeId, anonId()).catch(() => {});
        for (const url of nextPreview) {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.as = "image";
          link.href = url;
          document.head.appendChild(link);
        }
        io.disconnect();
      },
      { rootMargin: "0px 0px 200% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seriesId, episodeId, nextPreview, track]);

  const line = nextHref
    ? fill(d.reader.nextReady, { what: word, n: formatNumber(number + 1, ui) })
    : runStatus === "completed"
      ? d.reader.storyEnded
      : runStatus === "hiatus"
        ? d.reader.storyPaused
        : fill(d.reader.nextOn, { what: word, n: formatNumber(number + 1, ui), day: weekdayLabel(publishDay, ui) });

  return (
    <div ref={ref} className="bg-paper-2 border-t border-hair">
      <div className="mx-auto w-full max-w-[420px] flex flex-col items-center gap-4 px-5 py-12 text-center">
        <span className="font-display text-[40px] leading-none text-ink">{d.reader.toBeContinued}</span>
        <span className="t-caption">{line}</span>
        <div className="flex flex-col items-stretch gap-3 w-full pt-2">
          {nextHref ? (
            <>
              <Button href={nextHref} variant="primary" block>
                {d.reader.readNext}
              </Button>
              {!following && <FollowButton seriesId={seriesId} initial={following} signedIn={signedIn} next={seriesHref} block />}
            </>
          ) : (
            <FollowButton seriesId={seriesId} initial={following} signedIn={signedIn} next={seriesHref} variant="primary" block />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-1 t-caption">
          <Link href={creatorHref} className="t-link text-ink">
            {fill(d.reader.support, { name: creatorName })}
          </Link>
          {prevHref && (
            <Link href={prevHref} className="t-link text-ink">
              {d.reader.prev}
            </Link>
          )}
          <Link href={seriesHref} className="t-link text-ink">
            {d.reader.backToSeries}
          </Link>
        </div>
      </div>
    </div>
  );
}
