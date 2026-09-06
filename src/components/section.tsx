import Link from "next/link";
import type { ReactNode } from "react";

export function Section({
  title,
  lead,
  href,
  hrefLabel = "الكل",
  children,
}: {
  title: string;
  lead?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[28px] md:text-[34px] leading-tight">{title}</h2>
          {lead && <p className="text-sm text-ink-2">{lead}</p>}
        </div>
        {href && (
          <Link href={href} className="text-sm text-muted hover:text-ink shrink-0">
            {hrefLabel} ←
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
