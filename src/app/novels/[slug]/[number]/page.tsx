import { ReaderPage } from "@/components/reader/reader-page";

export default async function NovelReaderRoute({ params, searchParams }: PageProps<"/novels/[slug]/[number]">) {
  const { slug, number } = await params;
  const { lang } = await searchParams;
  return <ReaderPage kind="novel" slug={slug} numberParam={number} langParam={typeof lang === "string" ? lang : undefined} />;
}
