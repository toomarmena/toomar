import "server-only";
import { cookies } from "next/headers";
import { isLang, LANG_COOKIE, t, type Lang } from "./i18n";

/** The interface language for this request: cookie, else Arabic. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "ar";
}

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

export async function getTheme(): Promise<Theme> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  return v === "dark" ? "dark" : "light";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, d: t(lang) };
}
