import { ReaderPage } from "@/components/reader/reader-page";

export default async function ComicReaderRoute({ params, searchParams }: PageProps<"/comics/[slug]/[number]">) {
  const { slug, number } = await params;
  const { lang } = await searchParams;
  return <ReaderPage kind="comic" slug={slug} numberParam={number} langParam={typeof lang === "string" ? lang : undefined} />;
}
