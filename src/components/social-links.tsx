import { IconFacebook, IconGlobe, IconInstagram, IconTiktok, IconX, IconYoutube } from "./icons";
import { SOCIAL_KEYS, type SocialKey, type SocialLinks as Links } from "@/lib/constants";

const ICONS: Record<SocialKey, (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  instagram: IconInstagram,
  x: IconX,
  facebook: IconFacebook,
  youtube: IconYoutube,
  tiktok: IconTiktok,
  website: IconGlobe,
};

const LABEL: Record<SocialKey, string> = { instagram: "Instagram", x: "X", facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", website: "Website" };

/** A row of icon links. Nothing renders when the creator has none. */
export function SocialLinks({ links }: { links: Links }) {
  const entries = SOCIAL_KEYS.filter((k) => links[k]);
  if (entries.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {entries.map((k) => {
        const Icon = ICONS[k];
        return (
          <li key={k}>
            <a
              href={links[k]}
              target="_blank"
              rel="noopener noreferrer me"
              title={LABEL[k]}
              aria-label={LABEL[k]}
              className="flex items-center justify-center w-10 h-10 border border-hair text-ink hover:border-ink hover:bg-surface"
            >
              <Icon width={18} height={18} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
