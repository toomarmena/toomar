"use client";

import type { ReactNode } from "react";
import { ComicPages } from "./pages";
import { ComicStrip } from "./strip";
import { useReaderLayout } from "./layout-provider";
import type { EpisodeImage } from "@/lib/types";

/**
 * Shows the episode the way the reader asked for it. Falls back to whichever
 * set of images the creator actually uploaded.
 */
export function ComicView({ vertical, horizontal, dir, note, endCard }: { vertical: EpisodeImage[]; horizontal: EpisodeImage[]; dir: "rtl" | "ltr"; note: ReactNode; endCard: ReactNode }) {
  const { layout } = useReaderLayout();

  if (layout === "horizontal" && horizontal.length > 0) {
    return (
      <ComicPages images={horizontal} dir={dir}>
        {note}
        {endCard}
      </ComicPages>
    );
  }
  return (
    <>
      <ComicStrip images={vertical.length > 0 ? vertical : horizontal} />
      {note}
      {endCard}
    </>
  );
}
