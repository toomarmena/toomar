"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitSeries, withdrawSeries } from "@/app/studio/actions";
import { useT } from "../lang-provider";

export function SubmitBox({ seriesId, status, note }: { seriesId: string; status: "draft" | "pending" | "approved" | "rejected"; note: string | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<"cover" | "episode" | null>(null);
  const router = useRouter();
  const d = useT();

  const tone = { draft: "bg-surface", pending: "bg-[#FFF6D6]", approved: "bg-[#E8F5EC]", rejected: "bg-[#FDECEC]" }[status];

  return (
    <div className={`flex flex-col gap-3 p-4 border border-hair ${tone}`}>
      <span className="text-sm font-semibold">{d.studio.status[status]}</span>
      {status === "rejected" && note && (
        <p className="text-sm text-ink-2">
          <span className="text-muted">{d.studio.rejectedNote}:</span> {note}
        </p>
      )}
      {(status === "draft" || status === "rejected") && (
        <>
          <p className="text-xs text-muted">{d.studio.submitHint}</p>
          {error && (
            <p role="alert" className="text-sm text-[#B3261E]">
              {d.studio.errors[error]}
            </p>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await submitSeries(seriesId);
                if (r === "ok") {
                  setError(null);
                  router.refresh();
                } else setError(r);
              })
            }
            className="self-start px-5 h-11 bg-ink text-white text-sm font-bold disabled:opacity-60"
          >
            {d.studio.submit}
          </button>
        </>
      )}
      {status === "pending" && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await withdrawSeries(seriesId);
              router.refresh();
            })
          }
          className="self-start px-5 h-11 border-[1.5px] border-ink text-sm font-bold disabled:opacity-60"
        >
          {d.studio.withdraw}
        </button>
      )}
    </div>
  );
}
