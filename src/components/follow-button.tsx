"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/reader-actions";
import { useT } from "./lang-provider";
import { IconCheck } from "./icons";

export function FollowButton({
  seriesId,
  initial,
  signedIn,
  next,
  size = "md",
}: {
  seriesId: string;
  initial: boolean;
  signedIn: boolean;
  next: string;
  size?: "md" | "lg";
}) {
  const [following, setFollowing] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const d = useT();

  const onClick = () => {
    if (!signedIn) {
      router.push(`/account?next=${encodeURIComponent(next)}`);
      return;
    }
    const optimistic = !following;
    setFollowing(optimistic);
    start(async () => {
      const result = await toggleFollow(seriesId);
      if (result === null) router.push(`/account?next=${encodeURIComponent(next)}`);
      else setFollowing(result);
    });
  };

  const pad = size === "lg" ? "h-12 px-6 text-[15px]" : "h-10 px-5 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={following}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-colors ${pad} ${
        following ? "bg-white text-ink border-[1.5px] border-ink" : "bg-blue text-white hover:bg-blue-deep"
      } disabled:opacity-70`}
    >
      {following && <IconCheck width={16} height={16} strokeWidth={3} />}
      {following ? d.series.following : d.series.follow}
    </button>
  );
}
