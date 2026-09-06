"use client";

import { usePathname } from "next/navigation";
import { useT } from "../lang-provider";
import { SegmentedControl } from "../ui/segmented";

/** Text tabs for the creator's three pages. */
export function StudioNav() {
  const pathname = usePathname();
  const d = useT();
  const active = pathname.startsWith("/studio/profile") ? "profile" : pathname.startsWith("/studio/stats") ? "stats" : "series";
  return (
    <nav aria-label={d.studio.title} className="border-b border-hair">
      <SegmentedControl
        active={active}
        items={[
          { key: "series", label: d.studio.nav.series, href: "/studio" },
          { key: "profile", label: d.studio.nav.profile, href: "/studio/profile" },
          { key: "stats", label: d.studio.nav.stats, href: "/studio/stats" },
        ]}
      />
    </nav>
  );
}
