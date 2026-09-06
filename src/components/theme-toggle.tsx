"use client";

import { useState, useTransition } from "react";
import { setTheme } from "@/app/account/actions";
import { useT } from "./lang-provider";

const IconSun = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
const IconMoon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);

/** One small button: flips the theme at once, then remembers it in a cookie. */
export function ThemeToggle({ initial, className = "" }: { initial: "light" | "dark"; className?: string }) {
  const [theme, set] = useState(initial);
  const [, start] = useTransition();
  const d = useT();
  const next = theme === "dark" ? "light" : "dark";
  const flip = () => {
    document.documentElement.dataset.theme = next;
    set(next);
    start(() => setTheme(next));
  };
  return (
    <button type="button" onClick={flip} className={`text-ink-2 hover:text-blue transition-colors ${className}`} aria-label={theme === "dark" ? d.common.light : d.common.dark} title={theme === "dark" ? d.common.light : d.common.dark}>
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
