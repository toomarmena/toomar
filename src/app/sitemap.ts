import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

const SITE = "https://toomar.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: series }, { data: creators }] = await Promise.all([
    supabase.from("series_cards").select("slug, kind, approved_at, latest_published_at"),
    supabase.from("creator_cards").select("handle, latest_approved_at"),
  ]);
  const fixed: MetadataRoute.Sitemap = ["/", "/comics", "/novels", "/creators", "/privacy", "/terms"].map((p) => ({ url: `${SITE}${p}`, changeFrequency: "daily", priority: p === "/" ? 1 : 0.7 }));
  const seriesUrls: MetadataRoute.Sitemap = (series ?? []).map((s) => ({
    url: `${SITE}/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}`,
    lastModified: s.latest_published_at ?? s.approved_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const creatorUrls: MetadataRoute.Sitemap = (creators ?? []).map((c) => ({ url: `${SITE}/creators/${c.handle}`, lastModified: c.latest_approved_at ?? undefined, changeFrequency: "weekly", priority: 0.5 }));
  return [...fixed, ...seriesUrls, ...creatorUrls];
}
