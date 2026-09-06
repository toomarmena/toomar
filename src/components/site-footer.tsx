"use client";

import { setUiLang } from "@/app/account/actions";
import { useLang, useT } from "./lang-provider";
import { ThemeToggle } from "./theme-toggle";

/** Hairline on top, micro-labels, the language switch and the theme button. On every screen. */
export function SiteFooter({ theme }: { theme: "light" | "dark" }) {
  const lang = useLang();
  const d = useT();
  return (
    <footer className="border-t border-hair mt-auto">
      <div className="wrap py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <span className="t-micro" dir="ltr">
          toomar · web comics · novels
        </span>
        <div className="flex items-center gap-6">
          <form action={setUiLang} className="flex items-center gap-4" aria-label={d.common.language}>
            {(["ar", "en"] as const).map((l) => (
              <button key={l} type="submit" name="lang" value={l} className={`text-[13px] border-b-2 pb-0.5 transition-colors ${l === lang ? "text-ink border-ink font-medium" : "text-muted border-transparent hover:text-ink"}`} aria-current={l === lang ? "true" : undefined}>
                {l === "ar" ? "العربية" : "English"}
              </button>
            ))}
          </form>
          <ThemeToggle initial={theme} />
        </div>
      </div>
    </footer>
  );
}
