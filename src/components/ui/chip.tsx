import Link from "next/link";
import type { ReactNode } from "react";

/** Weekday and genre chips. Active = ink fill. */
export function Chip({ active = false, href, onClick, children, role, ariaSelected }: { active?: boolean; href?: string; onClick?: () => void; children: ReactNode; role?: string; ariaSelected?: boolean }) {
  const cls = `shrink-0 inline-flex items-center px-3.5 h-9 md:h-11 md:px-5 text-[13px] md:text-[15px] frame ${active ? "bg-ink text-white font-bold" : "bg-paper text-ink font-semibold hover:bg-surface"}`;
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
