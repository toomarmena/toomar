import Link from "next/link";
import type { ReactNode } from "react";

/** Weekday and genre chips: plain text in a hairline, 32px tall. Active = ink text with a 2px ink underline. */
export function Chip({ active = false, href, onClick, children, role, ariaSelected }: { active?: boolean; href?: string; onClick?: () => void; children: ReactNode; role?: string; ariaSelected?: boolean }) {
  const cls = `shrink-0 inline-flex items-center h-8 px-3.5 text-[13px] border border-hair border-b-2 transition-colors ${
    active ? "text-ink border-b-ink font-medium" : "text-ink-2 border-b-hair hover:text-ink"
  }`;
  if (href) {
    return (
      <Link href={href} className={cls} aria-current={active ? "page" : undefined}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} role={role} aria-selected={ariaSelected} aria-pressed={role ? undefined : active}>
      {children}
    </button>
  );
}
