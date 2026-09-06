"use client";

import Link from "next/link";

export type Segment = { key: string; label: string; href?: string; onSelect?: () => void };

/** One 2px border around the group; the active segment is ink with white text. */
export function SegmentedControl({ items, active, size = "md", shadow = false, label }: { items: Segment[]; active: string; size?: "sm" | "md"; shadow?: boolean; label?: string }) {
  const pad = size === "sm" ? "px-3 h-9 text-[13px]" : "px-5 h-10 text-sm";
  return (
    <div role="group" aria-label={label} className={`inline-flex frame bg-paper ${shadow ? "shadow-hard" : ""}`}>
      {items.map((it) => {
        const isActive = it.key === active;
        const cls = `inline-flex items-center justify-center font-bold ${pad} ${isActive ? "bg-ink text-white" : "text-ink hover:bg-surface"}`;
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
