import type { ReactNode } from "react";

/** White, 2px border, 12px bold. `tone="new"` is the yellow «جديد». */
export function Badge({ children, tone = "plain", className = "" }: { children: ReactNode; tone?: "plain" | "new"; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] md:text-[12px] font-bold leading-tight frame ${tone === "new" ? "bg-yellow" : "bg-paper"} text-ink ${className}`}>
      {children}
    </span>
  );
}
