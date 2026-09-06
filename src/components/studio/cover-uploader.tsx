"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { presignCover, setCover } from "@/app/studio/actions";
import { prepareImage, putToR2 } from "@/lib/image-client";
import { Cover } from "../cover";
import { useT } from "../lang-provider";

export function CoverUploader({ seriesId, coverUrl, title, tint }: { seriesId: string; coverUrl: string | null; title: string; tint: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const d = useT();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const img = await prepareImage(file, 600, 0.88, 2 / 3);
      const { url, headers, key } = await presignCover(seriesId, img.contentType);
      await putToR2(url, headers, img.blob);
      await setCover(seriesId, key);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message.includes("upload") ? d.studio.errors.upload : e instanceof Error ? e.message : d.studio.errors.generic);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3 w-[160px]">
      <Cover src={coverUrl} title={title} tint={tint} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="h-10 border-[1.5px] border-ink text-sm font-semibold text-ink hover:bg-ink hover:text-white disabled:opacity-60">
        {busy ? d.common.loading : d.studio.uploadCover}
      </button>
      <p className="text-[11px] text-muted leading-snug">{d.studio.coverHint}</p>
      {error && (
        <p role="alert" className="text-xs text-[#B3261E]">
          {error}
        </p>
      )}
    </div>
  );
}
