"use client";

import { useEffect, useRef } from "react";
import type { EpisodeImage } from "@/lib/types";

const EAGER = 3; // images fetched immediately
const AHEAD = "300%"; // start fetching three screens before an image is reached

/**
 * One continuous column. Every image reserves its exact height up front
 * (width/height attributes) so the page never jumps, and images are
 * requested three screens ahead so scrolling never waits on the network.
 */
export function ComicStrip({ images }: { images: EpisodeImage[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img[loading='lazy']"));
    if (imgs.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const img = entry.target as HTMLImageElement;
          img.loading = "eager"; // flips a deferred lazy image into loading now
          io.unobserve(img);
        }
      },
      { rootMargin: `${AHEAD} 0px ${AHEAD} 0px` },
    );
    imgs.forEach((img) => io.observe(img));
    return () => io.disconnect();
  }, [images]);

  return (
    <div ref={root} className="mx-auto w-full max-w-[800px] bg-white">
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.id}
          src={img.url}
          width={img.width}
          height={img.height}
          alt=""
          loading={i < EAGER ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          decoding="async"
          draggable={false}
          className="block w-full h-auto select-none"
          style={{ aspectRatio: `${img.width} / ${img.height}` }}
        />
      ))}
    </div>
  );
}
