import type { Metadata } from "next";
import { SeriesPage } from "@/components/series-page";
import { getSeriesBySlug } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/comics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSeriesBySlug(slug).catch(() => null);
  if (!s) return {};
  const description = s.descriptionAr ?? s.descriptionEn ?? undefined;
  return {
    title: s.title,
    description,
    openGraph: { title: s.title, description, type: "website", images: s.coverUrl ? [{ url: s.coverUrl, width: 600, height: 900 }] : undefined },
    twitter: { card: "summary", title: s.title, description },
  };
}

export default async function ComicSeriesPage({ params, searchParams }: PageProps<"/comics/[slug]">) {
  const { slug } = await params;
  const { lang } = await searchParams;
  return <SeriesPage kind="comic" slug={slug} langParam={typeof lang === "string" ? lang : undefined} />;
}
