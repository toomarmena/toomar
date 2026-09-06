import Link from "next/link";
import { Avatar } from "./avatar";
import { VerifiedMark } from "./icons";
import { creatorHref } from "@/lib/links";
import type { CreatorCard as Card } from "@/lib/types";

/** Directory card: square picture, name with the check, first line of the bio, the Latin role label. */
export function CreatorCard({ creator }: { creator: Card }) {
  const role = [creator.hasComics && "artist", creator.hasNovels && "author"].filter(Boolean).join(" · ");
  const firstLine = creator.bio?.split(/\n/)[0]?.trim() || null;
  return (
    <Link href={creatorHref(creator)} className="group flex flex-col gap-3 text-ink">
      <div className="cover-hover aspect-square w-full">
        {creator.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.avatarUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover bg-placeholder" />
        ) : (
          <div className="w-full h-full bg-placeholder" />
        )}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="t-series flex items-center gap-1.5 group-hover:text-blue transition-colors">
          <span className="truncate">{creator.name}</span>
          {creator.verified && <VerifiedMark size={12} />}
        </span>
        {firstLine && <span className="t-caption line-clamp-1">{firstLine}</span>}
        <span className="t-micro" dir="ltr">
          {role}
        </span>
      </div>
    </Link>
  );
}

export function CreatorGrid({ items, empty }: { items: Card[]; empty: string }) {
  if (items.length === 0) return <p className="t-caption py-10 text-center">{empty}</p>;
  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {items.map((c) => (
        <li key={c.id}>
          <CreatorCard creator={c} />
        </li>
      ))}
    </ul>
  );
}

// Avatar is re-exported for pages that show a small creator row next to results.
export { Avatar };
