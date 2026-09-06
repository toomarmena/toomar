import { getDict } from "@/lib/lang-server";
import { Listing } from "@/components/listing";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.nav.comics };
}

export default async function ComicsPage({ searchParams }: PageProps<"/comics">) {
  const { genre, status } = await searchParams;
  return <Listing kind="comic" genre={typeof genre === "string" ? genre : undefined} status={typeof status === "string" ? status : undefined} />;
}
