import { Listing } from "@/components/listing";

export const metadata = { title: "قصص مصوّرة" };

export default async function ComicsPage({ searchParams }: PageProps<"/comics">) {
  const { genre } = await searchParams;
  return <Listing kind="comic" genre={typeof genre === "string" ? genre : undefined} />;
}
