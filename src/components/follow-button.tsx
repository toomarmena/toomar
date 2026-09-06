"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/reader-actions";
import { useT } from "./lang-provider";
import { Button } from "./ui/button";

/** «تابع» as the secondary button; «تتابعها» once following. */
export function FollowButton({ seriesId, initial, signedIn, next, variant = "secondary", block = false }: { seriesId: string; initial: boolean; signedIn: boolean; next: string; variant?: "primary" | "secondary"; block?: boolean }) {
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

  return (
    <Button variant={following ? "secondary" : variant} block={block} onClick={onClick} disabled={pending} aria-pressed={following} className={following ? "border-ink" : ""}>
      {following ? d.series.following : variant === "primary" ? d.reader.remind : d.series.follow}
    </Button>
  );
}
