"use client";

import { useState, useTransition } from "react";
import { setupStorage } from "@/app/admin/actions";
import { useT } from "../lang-provider";
import { Button } from "../ui/button";

export function StorageSetup() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const d = useT();
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="secondary"
        disabled={pending}
        className="self-start h-10 px-5 text-[14px]"
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
      >
        {pending ? d.common.loading : d.admin.storageSetup}
      </Button>
      {result && (
        <p className="t-caption">
          {d.admin.storageOk} <span dir="ltr">{result}</span>
        </p>
      )}
      {error && (
        <p role="alert" className="t-caption text-ink" dir="ltr">
          {error}
        </p>
      )}
    </div>
  );
}
