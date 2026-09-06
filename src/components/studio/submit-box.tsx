"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitSeries, withdrawSeries } from "@/app/studio/actions";
import { useT } from "../lang-provider";
import { Button } from "../ui/button";

export function SubmitBox({ seriesId, status, note }: { seriesId: string; status: "draft" | "pending" | "approved" | "rejected"; note: string | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<"cover" | "episode" | null>(null);
  const router = useRouter();
  const d = useT();

  return (
    <div className="flex flex-col gap-3 py-4 border-y border-hair">
      <span className="t-caption text-ink">{d.studio.status[status]}</span>
      {status === "rejected" && note && (
        <p className="text-[15px] text-ink-2">
          <span className="t-caption">{d.studio.rejectedNote}:</span> {note}
        </p>
      )}
      {(status === "draft" || status === "rejected") && (
        <>
          <p className="t-caption">{d.studio.submitHint}</p>
          {error && (
            <p role="alert" className="t-caption text-ink">
              {d.studio.errors[error]}
            </p>
          )}
          <Button
            variant="primary"
            disabled={pending}
            className="self-start h-10 px-5 text-[14px]"
            onClick={() =>
              start(async () => {
                const r = await submitSeries(seriesId);
                if (r === "ok") {
                  setError(null);
                  router.refresh();
                } else setError(r);
              })
            }
          >
            {d.studio.submit}
          </Button>
        </>
      )}
      {status === "pending" && (
        <Button
          variant="secondary"
          disabled={pending}
          className="self-start h-10 px-5 text-[14px]"
          onClick={() =>
            start(async () => {
              await withdrawSeries(seriesId);
              router.refresh();
            })
          }
        >
          {d.studio.withdraw}
        </Button>
      )}
    </div>
  );
}
