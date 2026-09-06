"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DICT, type Dict, type Lang } from "@/lib/i18n";

const Ctx = createContext<Lang>("ar");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useLang(): Lang {
  return useContext(Ctx);
}

export function useT(): Dict {
  return DICT[useContext(Ctx)];
}
