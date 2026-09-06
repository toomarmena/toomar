import type { Metadata } from "next";
import { SeriesPage } from "@/components/series-page";
import { getSeriesBySlug } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/novels/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSeriesBySlug(slug).catch(() => null);
  return s ? { title: s.title, description: s.descriptionAr ?? undefined } : {};
}

export default async function NovelSeriesPage({ params, searchParams }: PageProps<"/novels/[slug]">) {
  const { slug } = await params;
  const { lang } = await searchParams;
  return <SeriesPage kind="novel" slug={slug} langParam={typeof lang === "string" ? lang : undefined} />;
}
