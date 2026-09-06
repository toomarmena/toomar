"use client";

import { useState } from "react";
import { useT } from "./lang-provider";
import { fill } from "@/lib/i18n";

/** One quiet text link: the phone's share sheet where it exists, otherwise copies the address. */
export function ShareLink({ path, title, creator, className = "" }: { path: string; title: string; creator: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const d = useT();

  const share = async () => {
    const url = `${window.location.origin}${path}`;
    const text = fill(d.share.text, { title, creator });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(d.share.copy, url);
    }
  };

  return (
    <button type="button" onClick={share} className={`t-link t-caption text-ink ${className}`} aria-live="polite">
      {copied ? d.share.copied : d.share.share}
    </button>
  );
}
