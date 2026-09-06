import { getDict } from "@/lib/lang-server";
import { Listing } from "@/components/listing";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.nav.novels };
}

export default async function NovelsPage({ searchParams }: PageProps<"/novels">) {
  const { genre, status } = await searchParams;
  return <Listing kind="novel" genre={typeof genre === "string" ? genre : undefined} status={typeof status === "string" ? status : undefined} />;
}
