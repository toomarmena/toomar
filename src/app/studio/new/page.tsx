import Link from "next/link";
import { SeriesForm } from "@/components/studio/series-form";
import { getDict } from "@/lib/lang-server";
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createSeries } from "../actions";

export const metadata = { title: "سلسلة جديدة" };

export default async function NewSeriesPage({ searchParams }: PageProps<"/studio/new">) {
  const { error } = await searchParams;
  const user = await getUser().catch(() => null);
  if (!user) redirect("/account?next=/studio/new");
  const { d } = await getDict();
  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-6">
      <Link href="/studio" className="text-sm text-muted hover:text-ink">
        ← {d.studio.title}
      </Link>
      <h1 className="font-display text-[34px] leading-tight">{d.studio.newSeries}</h1>
      <SeriesForm action={createSeries} error={typeof error === "string" ? error : undefined} />
    </div>
  );
}
