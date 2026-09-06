"use client";

import { useEffect, useState } from "react";
import { useT } from "../lang-provider";

const KEY = "toomar_reader_font";
const SIZES = [16, 18, 20, 22, 25];

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
    <article className="mx-auto w-full max-w-[42rem] px-5 md:px-8 py-8 md:py-12" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-end gap-4 mb-8 t-caption" role="group" aria-label={d.reader.fontSize}>
        <button type="button" onClick={() => set(idx - 1)} disabled={idx === 0} className="t-link text-ink disabled:opacity-40 disabled:no-underline" aria-label={d.reader.smaller}>
          A-
        </button>
        <button type="button" onClick={() => set(idx + 1)} disabled={idx === SIZES.length - 1} className="t-link text-ink disabled:opacity-40 disabled:no-underline" aria-label={d.reader.larger}>
          A+
        </button>
      </div>
      <h1 className="font-display text-[28px] md:text-[36px] leading-[1.25] mb-8 text-balance">{title}</h1>
      <div className="text-ink" style={{ fontSize: SIZES[idx], lineHeight: 1.9 }}>
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-[1.3em]">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
