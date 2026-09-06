import Link from "next/link";
import { redirect } from "next/navigation";
import { Cover } from "@/components/cover";
import { VerifiedMark } from "@/components/icons";
import { PicksEditor } from "@/components/admin/picks-editor";
import { StorageSetup } from "@/components/admin/storage-setup";
import { ConfirmButton } from "@/components/studio/confirm-button";
import { Button } from "@/components/ui/button";
import { AGE_RATING, RUN_STATUS } from "@/lib/constants";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { SeriesRow } from "@/lib/types";
import { approveSeries, hideSeries, rejectSeries, setVerified, transferSeries } from "./actions";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.admin.title };
}

type Row = SeriesRow & { profiles: { display_name: string; is_verified: boolean } | null; episodes: { count: number }[] };
type Person = { id: string; display_name: string; role: string; is_verified: boolean; created_at: string };

const h2 = "t-h2 pb-4 border-b border-hair";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const { transfer } = await searchParams;
  const profile = await getProfile().catch(() => null);
  if (!profile) redirect("/account?next=/admin");
  const { d } = await getDict();
  if (profile.role !== "admin") {
    return <p className="wrap pt-16 text-ink-2">{d.admin.notAdmin}</p>;
  }

  const supabase = await createClient();
  const [{ data: pendingData }, { data: approvedData }, { data: people }] = await Promise.all([
    supabase.from("series").select("*, profiles!series_creator_id_fkey(display_name, is_verified), episodes(count)").eq("status", "pending").order("submitted_at", { ascending: true }),
    supabase.from("series").select("*, profiles!series_creator_id_fkey(display_name, is_verified), episodes(count)").eq("status", "approved").order("approved_at", { ascending: false }),
    supabase.from("profiles").select("id, display_name, role, is_verified, created_at").in("role", ["creator", "admin"]).order("created_at", { ascending: false }),
  ]);
  const pending = (pendingData ?? []) as Row[];
  const approved = (approvedData ?? []) as Row[];
  const picks = approved.filter((s) => s.featured_rank !== null).sort((a, b) => a.featured_rank! - b.featured_rank!);
  const toItem = (s: Row) => ({ id: s.id, title: s.title_ar, creator: s.profiles?.display_name ?? "" });

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-12 md:gap-16 max-w-[960px]">
      <h1 className="t-h1">{d.admin.title}</h1>
      {transfer && <p className="t-caption text-ink">{transfer === "ok" ? d.admin.transferDone : d.admin.transferNoUser}</p>}

      <section className="flex flex-col gap-4">
        <h2 className={h2}>
          {d.admin.pending} <span className="t-caption">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="t-caption py-6">{d.admin.noPending}</p>
        ) : (
          <ul className="divide-y divide-hair">
            {pending.map((s) => (
              <li key={s.id} className="flex flex-col md:flex-row gap-5 py-6">
                <div className="w-20 shrink-0">
                  <Cover src={mediaUrl(s.cover_key)} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <span className="t-series">{s.title_ar}</span>
                  <span className="t-caption flex items-center gap-1">
                    {s.profiles?.display_name}
                    {s.profiles?.is_verified && <VerifiedMark size={12} />}
                  </span>
                  <span className="t-caption">
                    {s.kind === "comic" ? d.studio.comic : d.studio.novel} · {RUN_STATUS.find((r) => r.key === s.run_status)?.ar} · {AGE_RATING.find((r) => r.key === s.age_rating)?.ar} · {s.episodes?.[0]?.count ?? 0} · {d.admin.submittedAt}{" "}
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo" }) : ""}
                  </span>
                  {s.description_ar && <p className="text-[15px] text-ink-2 line-clamp-3 whitespace-pre-line">{s.description_ar}</p>}
                  <Link href={`/preview/${s.id}/1?lang=${s.languages[0]}`} className="t-link t-caption text-ink self-start">
                    {d.admin.preview}
                  </Link>
                </div>
                <div className="flex flex-col gap-3 md:w-[260px] shrink-0">
                  <form action={approveSeries.bind(null, s.id)}>
                    <Button type="submit" variant="primary" block className="h-11 text-[14px]">
                      {d.admin.approve}
                    </Button>
                  </form>
                  <form action={rejectSeries.bind(null, s.id)} className="flex flex-col gap-2">
                    <textarea name="note" rows={2} placeholder={d.admin.rejectNote} className="field text-[14px]" />
                    <Button type="submit" variant="secondary" block className="h-10 text-[14px]">
                      {d.admin.reject}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 pb-4 border-b border-hair">
          <h2 className="t-h2">{d.admin.picks}</h2>
          <p className="t-caption">{d.admin.picksLead}</p>
        </div>
        <PicksEditor picks={picks.map(toItem)} candidates={approved.map(toItem)} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>{d.admin.creators}</h2>
        <ul className="divide-y divide-hair">
          {((people ?? []) as Person[]).map((p) => (
            <li key={p.id} className="flex items-center gap-4 py-3">
              <span className="flex-1 flex items-center gap-1.5 text-[15px]">
                {p.display_name}
                {p.is_verified && <VerifiedMark size={12} />}
              </span>
              <span className="t-caption">{d.account.role[p.role as "reader" | "creator" | "admin"]}</span>
              <form action={setVerified.bind(null, p.id, !p.is_verified)}>
                <button type="submit" className="t-link t-caption text-ink">
                  {p.is_verified ? d.admin.unverify : d.admin.verify}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>
          {d.admin.approved} <span className="t-caption">({approved.length})</span>
        </h2>
        <ul className="divide-y divide-hair">
          {approved.map((s) => (
            <li key={s.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 py-4">
              <Link href={`/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}`} className="flex-1 min-w-0 flex flex-col hover:text-blue transition-colors">
                <span className="text-[15px] truncate">{s.title_ar}</span>
                <span className="t-caption">
                  {s.profiles?.display_name} · {s.episodes?.[0]?.count ?? 0}
                </span>
              </Link>
              <form action={transferSeries.bind(null, s.id)} className="flex items-center gap-3">
                <input name="email" type="email" placeholder={d.admin.transferEmail} className="field h-9 text-[13px] w-[200px]" dir="ltr" />
                <ConfirmButton message={d.admin.transfer + "؟"} className="t-link t-caption text-ink shrink-0">
                  {d.admin.transfer}
                </ConfirmButton>
              </form>
              <form action={hideSeries.bind(null, s.id)} className="flex items-center gap-3">
                <input name="note" placeholder={d.admin.rejectNote} className="field h-9 text-[13px] w-[180px]" />
                <ConfirmButton message={d.admin.unpublishSeries + "؟"} className="t-link t-caption text-ink shrink-0">
                  {d.admin.unpublishSeries}
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={h2}>{d.admin.storage}</h2>
        <StorageSetup />
      </section>
    </div>
  );
}
