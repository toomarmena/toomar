"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { presignAvatar, setAvatar } from "@/app/studio/actions";
import { prepareImage, putToR2 } from "@/lib/image-client";
import { Avatar } from "../avatar";
import { useT } from "../lang-provider";

/** Square-crops the picture in the browser, then uploads it straight to R2. */
async function squareCrop(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  canvas.getContext("2d")!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, side, side);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  return new File([blob!], "avatar.png", { type: "image/png" });
}

export function AvatarUploader({ src, name }: { src: string | null; name: string }) {
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
      const img = await prepareImage(await squareCrop(file), 400, 0.88);
      const { url, headers, key } = await presignAvatar(img.contentType);
      await putToR2(url, headers, img.blob);
      await setAvatar(key);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message.includes("upload") ? d.studio.errors.upload : d.studio.errors.generic);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar src={src} name={name} size={88} />
      <div className="flex flex-col gap-1.5">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="h-10 px-4 border-[1.5px] border-ink text-sm font-semibold text-ink hover:bg-ink hover:text-white disabled:opacity-60">
          {busy ? d.common.loading : d.studio.profile.uploadAvatar}
        </button>
        <span className="text-[11px] text-muted">{d.studio.profile.avatarHint}</span>
        {error && (
          <span role="alert" className="text-xs text-[#B3261E]">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
