"use client";

import Link from "next/link";
import { useT } from "../lang-provider";

/** h2 on the right, a muted caption or text link on the left, one hairline under both. */
export function SectionHeader({ title, note, href, as: Tag = "h2" }: { title: string; note?: string; href?: string; as?: "h1" | "h2" }) {
  const d = useT();
  return (
    <div className="flex items-baseline justify-between gap-4 pb-4 md:pb-5 border-b border-hair">
      <Tag className="t-h2">{title}</Tag>
      {note &&
        (href ? (
          <Link href={href} className="t-link t-caption text-ink shrink-0">
            {note} {d.common.fwd}
          </Link>
        ) : (
          <span className="t-caption shrink-0">{note}</span>
        ))}
    </div>
  );
}
