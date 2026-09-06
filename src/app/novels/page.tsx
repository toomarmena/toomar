import { Listing } from "@/components/listing";

export const metadata = { title: "روايات" };

export default async function NovelsPage({ searchParams }: PageProps<"/novels">) {
  const { genre } = await searchParams;
  return <Listing kind="novel" genre={typeof genre === "string" ? genre : undefined} />;
}
