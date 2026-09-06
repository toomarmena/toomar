"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { presignAvatar, setAvatar } from "@/app/studio/actions";
import { prepareImage, putToR2 } from "@/lib/image-client";
import { Avatar } from "../avatar";
import { useT } from "../lang-provider";
import { Button } from "../ui/button";

/** Square-crops the picture in the browser, then uploads it straight to R2. */
export function AvatarUploader({ src }: { src: string | null; name?: string }) {
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
      const img = await prepareImage(file, 400, 0.88, 1);
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
      <Avatar src={src} size={80} />
      <div className="flex flex-col gap-1.5">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()} className="h-10 px-4 text-[14px] self-start">
          {busy ? d.common.loading : d.studio.profile.uploadAvatar}
        </Button>
        <span className="t-caption">{d.studio.profile.avatarHint}</span>
        {error && (
          <span role="alert" className="t-caption text-ink">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
