"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconBack, IconLibrary } from "../icons";
import { useT } from "../lang-provider";
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
 * Full-screen reading surface: a 56px top bar that hides while scrolling
 * down and returns on scroll up or tap. The strip owns the screen.
 */
export function ReaderChrome({
  title,
  subtitle,
  backHref,
  seriesId,
  episodeId,
  number,
  contentLang,
  track = true,
  children,
}: {
  title: string;
  subtitle: string;
  backHref: string;
  prevHref?: string | null;
  nextHref?: string | null;
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

  return (
    <div className="min-h-screen bg-paper" onClick={onTap}>
      <header className={`fixed inset-x-0 top-0 z-40 h-14 bg-paper border-b border-hair transition-transform duration-200 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="mx-auto max-w-[800px] h-full flex items-center justify-between gap-3 px-4">
          <Link href={backHref} className="flex items-center gap-3 min-w-0 text-ink" aria-label={d.reader.backToSeries}>
            <IconBack width={22} height={22} strokeWidth={1.75} className="shrink-0" />
            <span className="flex flex-col min-w-0">
              <span className="font-display text-[15px] leading-tight truncate">{title}</span>
              <span className="text-[11px] text-muted truncate">{subtitle}</span>
            </span>
          </Link>
          <Link href="/library" className="p-2 -me-2 text-ink-2 hover:text-blue transition-colors" aria-label={d.nav.library}>
            <IconLibrary width={20} height={20} strokeWidth={1.75} />
          </Link>
        </div>
      </header>

      <div className="pt-14">{children}</div>
    </div>
  );
}
