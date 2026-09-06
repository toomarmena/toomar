"use client";

import { useState, useTransition } from "react";
import { setupStorage } from "@/app/admin/actions";
import { useT } from "../lang-provider";

export function StorageSetup() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const d = useT();
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            try {
              setResult(await setupStorage());
            } catch (e) {
              setError(e instanceof Error ? e.message : d.common.error);
            }
          })
        }
        className="self-start px-5 h-11 border-[1.5px] border-ink text-sm font-bold disabled:opacity-60"
      >
        {pending ? d.common.loading : d.admin.storageSetup}
      </button>
      {result && (
        <p className="text-xs text-[#0E7C4A]">
          {d.admin.storageOk} <span dir="ltr">{result}</span>
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-[#B3261E]" dir="ltr">
          {error}
        </p>
      )}
    </div>
  );
}
