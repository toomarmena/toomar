"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "../lang-provider";
import { IconComic, IconUser } from "../icons";

const IconStats = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden {...p}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </svg>
);

export function StudioNav() {
  const pathname = usePathname();
  const d = useT();
  const items = [
    { href: "/studio", label: d.studio.nav.series, Icon: IconComic, active: pathname === "/studio" || /^\/studio\/(new|[0-9a-f-]{36})/.test(pathname) },
    { href: "/studio/profile", label: d.studio.nav.profile, Icon: IconUser, active: pathname.startsWith("/studio/profile") },
    { href: "/studio/stats", label: d.studio.nav.stats, Icon: IconStats, active: pathname.startsWith("/studio/stats") },
  ];
  return (
    <nav aria-label={d.studio.title} className="md:w-[200px] shrink-0">
      <ul className="flex md:flex-col gap-1 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar border-b border-hair md:border-0">
        {items.map(({ href, label, Icon, active }) => (
          <li key={href} className="shrink-0">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold border-b-2 md:border-b-0 md:border-s-2 ${
                active ? "border-blue text-ink md:bg-surface" : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              <Icon width={18} height={18} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
