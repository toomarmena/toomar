import { CreatorGrid } from "@/components/creator-card";
import { SegmentedControl } from "@/components/ui/segmented";
import { getDict } from "@/lib/lang-server";
import { listCreators, type CreatorFilter } from "@/lib/queries";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.directory.title };
}

/** The directory: everyone with a published series, as artists, authors, or both. */
export default async function CreatorsPage({ searchParams }: PageProps<"/creators">) {
  const { kind } = await searchParams;
  const filter: CreatorFilter = kind === "artists" || kind === "authors" ? kind : "all";
  const { d } = await getDict();
  const items = await listCreators(filter);

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 pb-4 md:pb-5 border-b border-hair">
        <h1 className="t-h2">{d.directory.title}</h1>
        <SegmentedControl
          size="sm"
          active={filter}
          items={[
            { key: "all", label: d.directory.all, href: "/creators" },
            { key: "artists", label: d.directory.artists, href: "/creators?kind=artists" },
            { key: "authors", label: d.directory.authors, href: "/creators?kind=authors" },
          ]}
        />
      </div>
      <CreatorGrid items={items} empty={d.directory.empty} />
    </div>
  );
}
