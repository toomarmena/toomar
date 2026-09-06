"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import { IconComic, IconHome, IconLibrary, IconNovel, IconSearch, IconUser } from "./icons";
import { useT } from "./lang-provider";
import { SiteFooter } from "./site-footer";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { SegmentedControl } from "./ui/segmented";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Shell({ children, signedIn, role, theme }: { children: ReactNode; signedIn: boolean; role: "reader" | "creator" | "admin" | null; theme: "light" | "dark" }) {
  const pathname = usePathname();
  const d = useT();
  // Readers get the whole screen: no chrome around an episode.
  const reading = /^\/(comics|novels|preview)\/[^/]+\/\d+/.test(pathname);
  if (reading) return <>{children}</>;

  const tabs = [
    { href: "/", label: d.nav.home, Icon: IconHome },
    { href: "/comics", label: d.nav.comics, Icon: IconComic },
    { href: "/novels", label: d.nav.novels, Icon: IconNovel },
    { href: "/library", label: d.nav.library, Icon: IconLibrary },
    { href: "/account", label: d.nav.account, Icon: IconUser },
  ];
  const section = pathname.startsWith("/novels") ? "novels" : pathname.startsWith("/comics") ? "comics" : "";

  return (
    <>
      {/* DesktopNav: 64px, hairline under it. The section tabs sit next to the wordmark. */}
      <header className="border-b border-hair bg-paper">
        <div className="wrap h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-10 md:gap-12">
            <Wordmark />
            <div className="hidden md:block">
              <SegmentedControl
                label={d.nav.home}
                active={section}
                items={[
                  { key: "comics", label: d.nav.comics, href: "/comics" },
                  { key: "novels", label: d.nav.novels, href: "/novels" },
                ]}
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/search" className="text-ink-2 hover:text-blue transition-colors" aria-label={d.nav.search}>
              <IconSearch width={20} height={20} strokeWidth={1.75} />
            </Link>
            <ThemeToggle initial={theme} />
            {role === "admin" && (
              <Link href="/admin" className="t-link text-[14px]">
                {d.nav.admin}
              </Link>
            )}
            <Link href="/studio" className="t-link text-[14px]">
              {d.home.haveStory}
            </Link>
            <Button href="/account" variant="secondary" className="h-10 px-5 text-[14px]">
              {signedIn ? d.nav.account : d.nav.enter}
            </Button>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle initial={theme} />
            <Link href="/search" className="text-ink-2" aria-label={d.nav.search}>
              <IconSearch width={22} height={22} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <div className="pb-[76px] md:pb-0">
        <SiteFooter theme={theme} />
      </div>

      {/* MobileTabBar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-hair pb-safe" aria-label={d.nav.home}>
        <ul className="grid grid-cols-5 px-1.5 pt-2.5 pb-2">
          {tabs.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link href={href} className={`flex flex-col items-center gap-1 text-[10.5px] ${active ? "text-blue font-bold" : "text-ink-2 font-medium"}`} aria-current={active ? "page" : undefined}>
                  <Icon width={22} height={22} strokeWidth={1.75} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
