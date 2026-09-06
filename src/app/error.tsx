"use client";

import { useEffect } from "react";
import { useT } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const d = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="wrap pt-20 md:pt-32 section-end flex flex-col items-start gap-6 max-w-[720px]">
      <h1 className="t-h1">{d.common.error}</h1>
      <p className="text-ink-2">{d.errorPage.lead}</p>
      <div className="flex items-center gap-6">
        <Button variant="primary" onClick={reset}>
          {d.errorPage.retry}
        </Button>
        <Button variant="link" href="/">
          {d.notFound.home}
        </Button>
      </div>
    </div>
  );
}
