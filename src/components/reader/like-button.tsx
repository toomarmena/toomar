"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleReaction } from "@/app/reader-actions";
import { useT } from "../lang-provider";

/** «أعجبتني»: one quiet reaction, no public count. */
export function LikeButton({ episodeId, initial, signedIn, next }: { episodeId: string; initial: boolean; signedIn: boolean; next: string }) {
  const [liked, setLiked] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const d = useT();
  const onClick = () => {
    if (!signedIn) {
      router.push(`/account?next=${encodeURIComponent(next)}`);
      return;
    }
    setLiked((v) => !v);
    start(async () => {
      const r = await toggleReaction(episodeId);
      if (r === null) router.push(`/account?next=${encodeURIComponent(next)}`);
      else setLiked(r);
    });
  };
  return (
    <button type="button" onClick={onClick} disabled={pending} aria-pressed={liked} className={`t-link t-caption ${liked ? "text-blue" : "text-ink"}`}>
      {liked ? `♥ ${d.reactions.liked}` : `♡ ${d.reactions.like}`}
    </button>
  );
}
