"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ComicLayout } from "@/lib/constants";

export const LAYOUT_COOKIE = "reader_layout";

type Ctx = { layout: ComicLayout; setLayout: (l: ComicLayout) => void; available: ComicLayout[] };

const Reader = createContext<Ctx>({ layout: "vertical", setLayout: () => {}, available: ["vertical"] });

/**
 * Holds the reader's choice between the vertical strip and horizontal pages.
 * The server reads the cookie for the first paint, so the page never flips
 * after loading; the toggle is instant and writes the cookie back.
 */
export function ReaderLayoutProvider({ initial, available, children }: { initial: ComicLayout; available: ComicLayout[]; children: ReactNode }) {
  const [layout, set] = useState<ComicLayout>(initial);
  const setLayout = (l: ComicLayout) => {
    set(l);
    try {
      document.cookie = `${LAYOUT_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* private mode: the choice lasts for this page only */
    }
  };
  return <Reader.Provider value={{ layout, setLayout, available }}>{children}</Reader.Provider>;
}

export function useReaderLayout() {
  return useContext(Reader);
}
