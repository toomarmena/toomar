"use client";

import Link from "next/link";

export type Segment = { key: string; label: string; href?: string; onSelect?: () => void };

/** Text tabs side by side: muted, the active one ink with a 2px ink underline. No box. */
export function SegmentedControl({ items, active, label, size = "md" }: { items: Segment[]; active: string; label?: string; size?: "sm" | "md" }) {
  const text = size === "sm" ? "text-[13px]" : "text-[15px]";
  return (
    <div role="group" aria-label={label} className={`inline-flex items-center gap-5 md:gap-6 ${text}`}>
      {items.map((it) => {
        const isActive = it.key === active;
        const cls = `inline-flex items-center h-10 border-b-2 transition-colors ${isActive ? "text-ink border-ink font-bold" : "text-muted border-transparent hover:text-ink font-medium"}`;
        if (it.href) {
          return (
            <Link key={it.key} href={it.href} className={cls} aria-current={isActive ? "true" : undefined}>
              {it.label}
            </Link>
          );
        }
        return (
          <button key={it.key} type="button" onClick={it.onSelect} className={cls} aria-pressed={isActive}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
