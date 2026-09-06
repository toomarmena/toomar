import { SOCIAL_KEYS, type SocialLinks as Links } from "@/lib/constants";

const LABEL: Record<(typeof SOCIAL_KEYS)[number], string> = { instagram: "Instagram", x: "X", facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", website: "Website" };

/** Text links only, separated by dots. Nothing renders when the creator has none. */
export function SocialLinks({ links }: { links: Links }) {
  const entries = SOCIAL_KEYS.filter((k) => links[k]);
  if (entries.length === 0) return null;
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 t-caption" dir="ltr">
      {entries.map((k) => (
        <li key={k}>
          <a href={links[k]} target="_blank" rel="noopener noreferrer me" className="t-link text-ink">
            {LABEL[k]}
          </a>
        </li>
      ))}
    </ul>
  );
}
