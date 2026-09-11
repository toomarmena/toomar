"use client";

import { useRef, useState } from "react";
import { addImage, deleteImage, presignImage, reorderImages } from "@/app/studio/actions";
import { prepareImage, putToR2, sortFilesNaturally } from "@/lib/image-client";
import { fill } from "@/lib/i18n";
import type { ComicLayout } from "@/lib/constants";
import type { EpisodeImage } from "@/lib/types";
import { useT } from "../lang-provider";
import { Button } from "../ui/button";

/** Upload, reorder and remove one layout's images for a comic episode. */
export function ImageEditor({ episodeId, initial, publicBase, layout = "vertical" }: { episodeId: string; initial: EpisodeImage[]; publicBase: string; layout?: ComicLayout }) {
  const [images, setImages] = useState(initial);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const d = useT();

  const onFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = sortFilesNaturally(Array.from(list));
    setError(null);
    setProgress({ done: 0, total: files.length });
    try {
      for (let i = 0; i < files.length; i++) {
        const pages = layout === "horizontal";
        const img = await prepareImage(files[i], pages ? 1600 : 1080, 0.86, undefined, pages);
        const { url, headers, key } = await presignImage(episodeId, img.contentType, layout);
        await putToR2(url, headers, img.blob);
        const id = await addImage(episodeId, key, img.width, img.height, img.blob.size, layout);
        setImages((prev) => [...prev, { id, url: `${publicBase}/${key}`, width: img.width, height: img.height }]);
        setProgress({ done: i + 1, total: files.length });
      }
    } catch (e) {
      setError(e instanceof Error && !e.message.includes("upload") ? e.message : d.studio.errors.upload);
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const move = async (index: number, delta: number) => {
    const next = [...images];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await reorderImages(episodeId, next.map((i) => i.id)).catch(() => setError(d.studio.errors.generic));
  };

  const remove = async (id: string) => {
    if (!confirm(d.studio.confirmDelete)) return;
    setImages((prev) => prev.filter((i) => i.id !== id));
    await deleteImage(id).catch(() => setError(d.studio.errors.generic));
  };

  const small = "t-link t-caption text-ink disabled:opacity-40 disabled:no-underline";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <Button variant="primary" disabled={!!progress} onClick={() => fileRef.current?.click()} className="h-10 px-5 text-[14px]">
          {progress ? fill(d.studio.uploading, progress) : d.studio.addImages}
        </Button>
        <span className="t-caption">{layout === "horizontal" ? d.studio.pagesHint : d.studio.imagesHint}</span>
      </div>
      {error && (
        <p role="alert" className="t-caption text-ink">
          {error}
        </p>
      )}
      {images.length > 0 && (
        <ol className="divide-y divide-hair border-y border-hair">
          {images.map((img, i) => (
            <li key={img.id} className="flex items-center gap-4 py-2.5">
              <span className="w-6 t-caption text-ink">{i + 1}</span>
              <div className="w-14 h-14 overflow-hidden bg-placeholder shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <span className="t-caption flex-1" dir="ltr">
                {img.width} × {img.height}
              </span>
              <div className="flex gap-4">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={small}>
                  {d.studio.moveUp}
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className={small}>
                  {d.studio.moveDown}
                </button>
                <button type="button" onClick={() => remove(img.id)} className={small}>
                  {d.studio.remove}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
