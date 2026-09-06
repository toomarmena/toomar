import Link from "next/link";
import { redirect } from "next/navigation";
import { SeriesForm } from "@/components/studio/series-form";
import { getDict } from "@/lib/lang-server";
import { getUser } from "@/lib/supabase/server";
import { createSeries } from "../actions";

export const metadata = { title: "سلسلة جديدة" };

export default async function NewSeriesPage({ searchParams }: PageProps<"/studio/new">) {
  const { error } = await searchParams;
  const user = await getUser().catch(() => null);
  if (!user) redirect("/account?next=/studio/new");
  const { d } = await getDict();
  return (
    <div className="flex flex-col gap-6">
      <Link href="/studio" className="t-link t-caption text-ink self-start">
        → {d.studio.nav.series}
      </Link>
      <h1 className="t-h2">{d.studio.newSeries}</h1>
      <SeriesForm action={createSeries} error={typeof error === "string" ? error : undefined} />
    </div>
  );
}
