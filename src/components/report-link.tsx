"use client";

import { useState, useTransition } from "react";
import { submitReport } from "@/app/reader-actions";
import { useT } from "./lang-provider";

/** A small «إبلاغ» link that unfolds into a one-line form. */
export function ReportLink({ seriesId, episodeId = null }: { seriesId: string; episodeId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "signin" | "short">("idle");
  const [pending, start] = useTransition();
  const d = useT();

  if (state === "ok") return <span className="t-caption">{d.report.sent}</span>;
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="t-link t-caption text-muted">
        {d.report.link}
      </button>
    );
  }
  return (
    <form
      className="flex flex-col gap-2 w-full max-w-[360px]"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setState(await submitReport(seriesId, episodeId, reason)));
      }}
    >
      <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder={d.report.placeholder} className="field h-11 text-[14px]" autoFocus />
      {state === "signin" && <span className="t-caption">{d.report.signIn}</span>}
      {state === "short" && <span className="t-caption">{d.report.short}</span>}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="t-link t-caption text-ink">
          {d.report.send}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="t-link t-caption text-muted">
          {d.common.cancel}
        </button>
      </div>
    </form>
  );
}
