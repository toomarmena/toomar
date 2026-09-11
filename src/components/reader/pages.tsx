"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { formatNumber } from "@/lib/constants";
import { useLang, useT } from "../lang-provider";
import type { EpisodeImage } from "@/lib/types";

/**
 * Horizontal pages: one page fills the screen, swipe sideways for the next.
 * Arabic pages advance right to left, English ones left to right. The closing
 * card is the last panel, so the episode ends where the swiping ends.
 */
export function ComicPages({ images, dir, children }: { images: EpisodeImage[]; dir: "rtl" | "ltr"; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const ui = useLang();
  const d = useT();
  const total = images.length;
  // Panels are the pages plus the closing card.
  const last = total;
  // Right-to-left scrollers count their offset downward from zero.
  const sign = dir === "rtl" ? -1 : 1;

  const at = useCallback((i: number) => {
    indexRef.current = i;
    setIndex(i);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = el.clientWidth || 1;
        at(Math.round(Math.abs(el.scrollLeft) / w));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [at]);

  /** Always scrolls to a whole page, so a tapped arrow never lands between two. */
  const go = useCallback(
    (step: number) => {
      const el = scroller.current;
      if (!el) return;
      const next = Math.min(last, Math.max(0, indexRef.current + step));
      at(next);
      el.scrollTo({ left: sign * next * el.clientWidth, behavior: "smooth" });
    },
    [at, last, sign],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(dir === "rtl" ? 1 : -1);
      else if (e.key === "ArrowLeft") go(dir === "rtl" ? -1 : 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir, go]);

  const onEnd = index >= last;

  return (
    <>
      <div ref={scroller} dir={dir} className="flex h-[calc(100dvh-6rem-env(safe-area-inset-bottom))] overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory no-scrollbar bg-paper">
        {images.map((img, i) => (
          <div key={img.id} className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              width={img.width}
              height={img.height}
              alt=""
              // The page in view and the two after it are fetched; the rest wait.
              loading={i <= index + 2 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
              decoding="async"
              draggable={false}
              className="max-w-full max-h-full w-auto h-auto object-contain select-none"
            />
          </div>
        ))}
        <div className="w-full h-full shrink-0 snap-center snap-always overflow-y-auto">{children}</div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 h-10 pb-safe box-content bg-paper border-t border-hair flex items-center justify-center gap-8">
        <button type="button" onClick={() => go(-1)} disabled={index === 0} className="t-link t-caption text-ink disabled:opacity-40 disabled:no-underline" aria-label={d.reader.prev}>
          {d.common.back}
        </button>
        <span className="t-caption tabular-nums" aria-live="polite">
          {onEnd ? d.reader.toBeContinued : `${formatNumber(index + 1, ui)} / ${formatNumber(total, ui)}`}
        </span>
        <button type="button" onClick={() => go(1)} disabled={onEnd} className="t-link t-caption text-ink disabled:opacity-40 disabled:no-underline" aria-label={d.reader.next}>
          {d.common.fwd}
        </button>
      </div>
    </>
  );
}
