"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconArrowLeft, IconBack, IconLibrary } from "../icons";
import { useLang, useT } from "../lang-provider";
import { recordEvent, saveProgress } from "@/app/reader-actions";

export function anonId() {
  try {
    const k = "toomar_anon";
    let v = localStorage.getItem(k);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

/**
 * Full-screen reading surface. The bars hide while scrolling down and
 * return on scroll up or tap, so the strip owns the screen.
 */
export function ReaderChrome({
  title,
  subtitle,
  backHref,
  prevHref,
  nextHref,
  seriesId,
  episodeId,
  number,
  contentLang,
  tone = "light",
  track = true,
  children,
}: {
  title: string;
  subtitle: string;
  backHref: string;
  prevHref: string | null;
  nextHref: string | null;
  seriesId: string;
  episodeId: string;
  number: number;
  contentLang: "ar" | "en";
  tone?: "light" | "paper";
  track?: boolean;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const d = useT();
  const ui = useLang();

  useEffect(() => {
    if (!track) return;
    recordEvent("open", seriesId, episodeId, anonId()).catch(() => {});
    saveProgress(seriesId, episodeId, number, contentLang).catch(() => {});
  }, [track, seriesId, episodeId, number, contentLang]);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY.current;
        if (y < 40) setVisible(true);
        else if (dy > 8) setVisible(false);
        else if (dy < -8) setVisible(true);
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onTap = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    setVisible((v) => !v);
  };

  const bar = `fixed inset-x-0 z-40 transition-transform duration-200 ${tone === "paper" ? "bg-[#FBFAF7]" : "bg-white"}`;
  const Prev = ui === "ar" ? IconBack : IconArrowLeft;
  const Next = ui === "ar" ? IconArrowLeft : IconBack;

  return (
    <div className={`min-h-screen ${tone === "paper" ? "bg-[#FBFAF7]" : "bg-white"}`} onClick={onTap}>
      <header className={`${bar} top-0 border-b border-hair ${visible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="mx-auto max-w-[800px] flex items-center justify-between gap-3 px-3 py-2.5">
          <Link href={backHref} className="flex items-center gap-2.5 min-w-0 text-ink" aria-label={d.reader.backToSeries}>
            <IconBack width={22} height={22} className="shrink-0" />
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{title}</span>
              <span className="text-[11px] text-muted truncate">{subtitle}</span>
            </span>
          </Link>
          <Link href="/library" className="p-2 text-ink" aria-label={d.nav.library}>
            <IconLibrary width={20} height={20} />
          </Link>
        </div>
      </header>

      <div className="pt-[58px] pb-[64px]">{children}</div>

      <nav className={`${bar} bottom-0 border-t border-hair pb-safe ${visible ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto max-w-[800px] flex items-center justify-between px-2 py-1.5 text-sm font-semibold">
          <Link href={prevHref ?? "#"} aria-disabled={!prevHref} className={`flex items-center gap-1.5 px-3 py-2 ${prevHref ? "text-ink" : "text-hair pointer-events-none"}`}>
            <Prev width={18} height={18} />
            {d.reader.prev}
          </Link>
          <Link href={backHref} className="px-3 py-2 text-muted text-xs">
            {d.reader.backToSeries}
          </Link>
          <Link href={nextHref ?? "#"} aria-disabled={!nextHref} className={`flex items-center gap-1.5 px-3 py-2 ${nextHref ? "text-ink" : "text-hair pointer-events-none"}`}>
            {d.reader.next}
            <Next width={18} height={18} />
          </Link>
        </div>
      </nav>
    </div>
  );
}
