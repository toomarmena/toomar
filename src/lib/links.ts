import type { SeriesKind } from "./constants";

/** Public address of a series. Usable from server and client code. */
export function seriesHref(s: { kind: SeriesKind; slug: string }) {
  return `/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}`;
}
