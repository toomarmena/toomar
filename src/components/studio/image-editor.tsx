"use client";

import { useRef, useState } from "react";
import { addImage, deleteImage, presignImage, reorderImages } from "@/app/studio/actions";
import { prepareImage, putToR2, sortFilesNaturally } from "@/lib/image-client";
import { fill } from "@/lib/i18n";
import type { EpisodeImage } from "@/lib/types";
import { useT } from "../lang-provider";

/** Upload, reorder and remove the images of a comic episode. */
export function ImageEditor({ episodeId, initial, publicBase }: { episodeId: string; initial: EpisodeImage[]; publicBase: string }) {
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
        const img = await prepareImage(files[i], 1080);
        const { url, headers, key } = await presignImage(episodeId, img.contentType);
        await putToR2(url, headers, img.blob);
        const id = await addImage(episodeId, key, img.width, img.height, img.blob.size);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <button type="button" disabled={!!progress} onClick={() => fileRef.current?.click()} className="px-5 h-11 bg-blue text-white text-sm font-bold hover:bg-blue-deep disabled:opacity-60">
          {progress ? fill(d.studio.uploading, progress) : d.studio.addImages}
        </button>
        <span className="text-xs text-muted">{d.studio.imagesHint}</span>
      </div>
      {error && (
        <p role="alert" className="text-sm text-[#B3261E]">
          {error}
        </p>
      )}
      {images.length > 0 && (
        <ol className="flex flex-col gap-2">
          {images.map((img, i) => (
            <li key={img.id} className="flex items-center gap-3 p-2 bg-surface border border-hair">
              <span className="w-8 text-center font-display text-lg">{i + 1}</span>
              <div className="w-[72px] h-[72px] overflow-hidden bg-white border border-hair shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
              <span className="text-xs text-muted flex-1" dir="ltr">
                {img.width} × {img.height}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="h-9 px-3 text-xs font-semibold border border-hair bg-white disabled:opacity-40">
                  ↑ {d.studio.moveUp}
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="h-9 px-3 text-xs font-semibold border border-hair bg-white disabled:opacity-40">
                  ↓ {d.studio.moveDown}
                </button>
                <button type="button" onClick={() => remove(img.id)} className="h-9 px-3 text-xs font-semibold border border-hair bg-white text-[#B3261E]">
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
