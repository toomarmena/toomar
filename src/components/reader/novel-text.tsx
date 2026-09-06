"use client";

import { useEffect, useState } from "react";
import { useT } from "../lang-provider";

const KEY = "toomar_reader_font";
const SIZES = [17, 19, 21, 23, 26];

function storedSize() {
  try {
    const v = Number(localStorage.getItem(KEY));
    if (localStorage.getItem(KEY) !== null && v >= 0 && v < SIZES.length) return v;
  } catch {}
  return 1;
}

/** Chapter text with comfortable Arabic typography and a remembered text size. */
export function NovelText({ title, paragraphs, lang }: { title: string; paragraphs: string[]; lang: "ar" | "en" }) {
  // The server renders the default size; the remembered one is applied right after hydration.
  const [idx, setIdx] = useState(1);
  const d = useT();

  useEffect(() => {
    const id = requestAnimationFrame(() => setIdx(storedSize()));
    return () => cancelAnimationFrame(id);
  }, []);

  const set = (n: number) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, n));
    setIdx(next);
    try {
      localStorage.setItem(KEY, String(next));
    } catch {}
  };

  return (
    <article className="mx-auto w-full max-w-[42rem] px-5 md:px-8 py-6 md:py-10" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-end gap-1 mb-6 text-sm" role="group" aria-label={d.reader.fontSize}>
        <button type="button" onClick={() => set(idx - 1)} disabled={idx === 0} className="w-10 h-10 border border-hair text-ink disabled:text-hair" aria-label={d.reader.smaller}>
          <span className="text-sm">A-</span>
        </button>
        <button type="button" onClick={() => set(idx + 1)} disabled={idx === SIZES.length - 1} className="w-10 h-10 border border-hair text-ink disabled:text-hair" aria-label={d.reader.larger}>
          <span className="text-lg">A+</span>
        </button>
      </div>
      <h1 className="font-display text-[32px] md:text-[40px] leading-tight mb-8 text-balance">{title}</h1>
      <div className="text-ink-2" style={{ fontSize: SIZES[idx], lineHeight: 2 }}>
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-[1.4em] text-justify [text-align-last:start]">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
