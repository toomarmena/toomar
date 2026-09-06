"use client";

import { useState } from "react";
import { IconFacebook, IconLink, IconShare, IconWhatsapp, IconX } from "./icons";
import { useT } from "./lang-provider";
import { fill } from "@/lib/i18n";

/**
 * Copy link, WhatsApp, X, Facebook, and the phone's own share sheet when
 * the browser offers one. `path` is site-relative; the origin is read at click time.
 */
export function ShareRow({ path, title, creator, compact = false }: { path: string; title: string; creator: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const d = useT();
  const text = fill(d.share.text, { title, creator });
  const url = () => `${window.location.origin}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(d.share.copy, url());
    }
  };
  // Phones get their own share sheet; desktops without one fall back to copying.
  const native = async () => {
    if (typeof navigator.share !== "function") return copy();
    try {
      await navigator.share({ title, text, url: url() });
    } catch {
      /* dismissed */
    }
  };
  const open = (href: string) => window.open(href, "_blank", "noopener,noreferrer");
  const enc = encodeURIComponent;

  const btn = `inline-flex items-center justify-center gap-1.5 h-10 border border-hair text-ink hover:border-ink hover:bg-surface text-xs font-semibold ${compact ? "w-10" : "px-3"}`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={native} className={`${btn} md:hidden`} aria-label={d.share.share}>
        <IconShare width={16} height={16} />
        {!compact && d.share.share}
      </button>
      <button type="button" onClick={copy} className={btn} aria-label={d.share.copy} aria-live="polite">
        <IconLink width={16} height={16} />
        {!compact && (copied ? d.share.copied : d.share.copy)}
      </button>
      <button type="button" onClick={() => open(`https://wa.me/?text=${enc(`${text}\n${url()}`)}`)} className={btn} aria-label={d.share.whatsapp}>
        <IconWhatsapp width={16} height={16} />
        {!compact && d.share.whatsapp}
      </button>
      <button type="button" onClick={() => open(`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url())}`)} className={btn} aria-label={d.share.x}>
        <IconX width={16} height={16} />
        {!compact && d.share.x}
      </button>
      <button type="button" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url())}`)} className={btn} aria-label={d.share.facebook}>
        <IconFacebook width={16} height={16} />
        {!compact && d.share.facebook}
      </button>
      {copied && compact && <span className="text-xs text-[#0E7C4A]">{d.share.copied}</span>}
    </div>
  );
}
