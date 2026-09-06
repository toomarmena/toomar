"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "./wordmark";
import { IconComic, IconHome, IconLibrary, IconNovel, IconSearch, IconUser } from "./icons";
import { useT } from "./lang-provider";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Shell({ children, signedIn, role }: { children: ReactNode; signedIn: boolean; role: "reader" | "creator" | "admin" | null }) {
  const pathname = usePathname();
  const d = useT();
  // Readers get the whole screen: no chrome around an episode.
  const reading = /^\/(comics|novels)\/[^/]+\/\d+/.test(pathname);
  if (reading) return <>{children}</>;

  const tabs = [
    { href: "/", label: d.nav.home, Icon: IconHome },
    { href: "/comics", label: d.nav.comics, Icon: IconComic },
    { href: "/novels", label: d.nav.novels, Icon: IconNovel },
    { href: "/library", label: d.nav.library, Icon: IconLibrary },
    { href: "/account", label: d.nav.account, Icon: IconUser },
  ];

  return (
    <>
      <header className="border-b border-hair bg-white">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between gap-6 px-4 py-3 md:px-12 md:py-5">
          <div className="flex items-center gap-8">
            <Wordmark />
            <nav className="hidden md:flex items-center gap-1 p-1 bg-surface border border-hair" aria-label={d.nav.home}>
              {tabs.slice(1, 3).map(({ href, label }) => {
                const active = isActive(pathname, href);
                return (
                  <Link key={href} href={href} className={`px-4 py-2 text-sm font-semibold ${active ? "bg-blue text-white" : "text-ink-2 hover:text-ink"}`}>
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <Link href="/search" className="flex items-center gap-2.5 w-[240px] px-4 py-2.5 bg-surface border border-hair text-muted text-sm">
              <IconSearch width={18} height={18} />
              <span>{d.nav.searchPlaceholder}</span>
            </Link>
            <Link href="/library" className="text-sm font-medium text-ink-2 hover:text-ink">
              {d.nav.library}
            </Link>
            {role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-ink-2 hover:text-ink">
                {d.nav.admin}
              </Link>
            )}
            <Link href="/account" className="text-sm font-medium text-ink-2 hover:text-ink">
              {signedIn ? d.nav.account : d.nav.signIn}
            </Link>
            <Link href="/studio" className="px-5 py-2.5 text-sm font-semibold border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white">
              {d.nav.publish}
            </Link>
          </div>
          <Link href="/search" className="md:hidden p-2 -me-2 text-ink" aria-label={d.nav.search}>
            <IconSearch width={22} height={22} />
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-[76px] md:pb-0">{children}</main>

      <footer className="hidden md:block border-t border-hair mt-16">
        <div className="mx-auto max-w-[1440px] px-12 py-8 flex items-center justify-between text-sm text-muted">
          <span className="font-display text-2xl text-ink">طومار</span>
          <span>{d.tagline}</span>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-hair pb-safe" aria-label={d.nav.home}>
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-1 pt-2 pb-2 text-[10.5px] font-medium ${active ? "text-blue" : "text-muted"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon width={22} height={22} strokeWidth={active ? 2.4 : 2} />
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
