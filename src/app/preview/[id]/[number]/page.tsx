import { ReaderPage } from "@/components/reader/reader-page";

/** The creator's and editor's view of an episode before it is public. */
export default async function PreviewRoute({ params, searchParams }: PageProps<"/preview/[id]/[number]">) {
  const { id, number } = await params;
  const { lang } = await searchParams;
  return <ReaderPage preview={id} slug="" kind="comic" numberParam={number} langParam={typeof lang === "string" ? lang : undefined} />;
}
