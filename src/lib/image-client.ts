"use client";

/**
 * Resizes an image in the browser before upload: long strips become
 * 1080px wide WebP, covers 600px wide. Keeps phones from downloading
 * 4 MB scans and keeps the reader smooth.
 */
export type Prepared = { blob: Blob; width: number; height: number; contentType: string };

const MAX_CANVAS_HEIGHT = 16000; // browsers refuse larger canvases; tall strips get split by the creator

export async function prepareImage(file: File, maxWidth: number, quality = 0.86): Promise<Prepared> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    if (height > MAX_CANVAS_HEIGHT) {
      throw new Error(`الصورة أطول من اللازم (${height}px). قسّمها إلى أجزاء أقصر.`);
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && blob.type === "image/webp") {
      return { blob, width, height, contentType: "image/webp" };
    }
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!jpeg) throw new Error("encode");
    return { blob: jpeg, width, height, contentType: "image/jpeg" };
  } finally {
    bitmap.close();
  }
}

export async function putToR2(url: string, headers: Record<string, string>, blob: Blob) {
  const res = await fetch(url, { method: "PUT", headers, body: blob });
  if (!res.ok) throw new Error(`upload failed: ${res.status}`);
}

/** Files sorted the way a person expects: 1, 2, 10 rather than 1, 10, 2. */
export function sortFilesNaturally(files: File[]) {
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
  return [...files].sort((a, b) => collator.compare(a.name, b.name));
}
