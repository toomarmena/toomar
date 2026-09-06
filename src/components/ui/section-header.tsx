import Link from "next/link";

/** Reem Kufi title on one side, a muted note or link on the other. */
export function SectionHeader({ title, note, href, as: Tag = "h2" }: { title: string; note?: string; href?: string; as?: "h1" | "h2" }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <Tag className="t-h2">{title}</Tag>
      {note &&
        (href ? (
          <Link href={href} className="t-note hover:text-ink shrink-0">
            {note} ←
          </Link>
        ) : (
          <span className="t-note shrink-0">{note}</span>
        ))}
    </div>
  );
}
