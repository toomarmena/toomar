"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FollowButton } from "../follow-button";
import { useLang, useT } from "../lang-provider";
import { anonId } from "./chrome";
import { recordEvent } from "@/app/reader-actions";
import { EPISODE_WORD, formatNumber, weekdayLabel, type RunStatus, type SeriesKind } from "@/lib/constants";
import { ShareRow } from "../share-row";
import { fill } from "@/lib/i18n";

/**
 * "يُتبع…": closes every episode. Records completion when it scrolls into
 * view and prefetches the start of the next episode.
 */
export function EndCard({
  kind,
  seriesId,
  episodeId,
  number,
  publishDay,
  runStatus,
  nextHref,
  nextPreview,
  seriesHref,
  seriesTitle,
  creatorName,
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
  nextHref: string | null;
  nextPreview: string[];
  seriesHref: string;
  seriesTitle: string;
  creatorName: string;
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

  return (
    <div ref={ref} className="mx-auto w-full max-w-[800px] flex flex-col items-center gap-4 px-5 py-10 border-t border-hair bg-surface">
      <span className="font-display text-[44px] leading-none text-ink">{d.reader.toBeContinued}</span>
      <span className="text-[13px] text-muted text-center">
        {nextHref
          ? fill(d.reader.nextReady, { what: word, n: formatNumber(number + 1, ui) })
          : runStatus === "completed"
            ? d.reader.storyEnded
            : runStatus === "hiatus"
              ? d.reader.storyPaused
              : fill(d.reader.nextOn, { what: word, n: formatNumber(number + 1, ui), day: weekdayLabel(publishDay, ui) })}
      </span>
      <div className="flex flex-col gap-2.5 w-full max-w-[420px] pt-1">
        {nextHref ? (
          <Link href={nextHref} className="flex items-center justify-center h-12 bg-blue text-white font-bold text-[15px] hover:bg-blue-deep">
            {d.reader.readNext}
          </Link>
        ) : null}
        <FollowButton seriesId={seriesId} initial={following} signedIn={signedIn} next={seriesHref} size="lg" />
        <Link href={seriesHref} className="flex items-center justify-center h-12 border-[1.5px] border-hair text-ink font-semibold text-[15px] hover:border-ink">
          {d.reader.backToSeries}
        </Link>
        <div className="flex justify-center pt-2">
          <ShareRow path={seriesHref.split("?")[0]} title={seriesTitle} creator={creatorName} compact />
        </div>
      </div>
    </div>
  );
}
