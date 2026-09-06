import Link from "next/link";
import { redirect } from "next/navigation";
import { Cover } from "@/components/cover";
import { VerifiedMark } from "@/components/icons";
import { PicksEditor } from "@/components/admin/picks-editor";
import { StorageSetup } from "@/components/admin/storage-setup";
import { ConfirmButton } from "@/components/studio/confirm-button";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { tintFor } from "@/lib/queries";
import { createClient, getProfile } from "@/lib/supabase/server";
import type { SeriesRow } from "@/lib/types";
import { AGE_RATING, RUN_STATUS } from "@/lib/constants";
import { approveSeries, hideSeries, rejectSeries, setVerified } from "./actions";

export const metadata = { title: "لوحة التحرير" };

type Row = SeriesRow & { profiles: { display_name: string; is_verified: boolean } | null; episodes: { count: number }[] };
type Person = { id: string; display_name: string; role: string; is_verified: boolean; created_at: string };

export default async function AdminPage() {
  const profile = await getProfile().catch(() => null);
  if (!profile) redirect("/account?next=/admin");
  const { d } = await getDict();
  if (profile.role !== "admin") {
    return <p className="mx-auto max-w-[1100px] px-4 md:px-12 pt-12 text-ink-2">{d.admin.notAdmin}</p>;
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
    <div className="mx-auto max-w-[1100px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-12">
      <h1 className="font-display text-[34px] leading-tight">{d.admin.title}</h1>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] leading-tight">
          {d.admin.pending} <span className="text-muted text-lg font-sans">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted border border-dashed border-hair">{d.admin.noPending}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((s) => (
              <li key={s.id} className="flex flex-col md:flex-row gap-4 p-4 bg-surface border border-hair">
                <div className="w-[80px] shrink-0">
                  <Cover src={mediaUrl(s.cover_key)} title={s.title_ar} tint={tintFor(s.id)} />
                </div>
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <span className="font-semibold text-lg">{s.title_ar}</span>
                  <span className="flex items-center gap-1.5 text-sm text-ink-2">
                    {s.profiles?.display_name}
                    {s.profiles?.is_verified && <VerifiedMark />}
                  </span>
                  <span className="text-xs text-muted">
                    {s.kind === "comic" ? d.studio.comic : d.studio.novel} · {RUN_STATUS.find((r) => r.key === s.run_status)?.ar} · {AGE_RATING.find((r) => r.key === s.age_rating)?.ar} · {s.episodes?.[0]?.count ?? 0} · {d.admin.submittedAt}{" "}
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString("ar-EG", { timeZone: "Africa/Cairo" }) : ""}
                  </span>
                  {s.description_ar && <p className="text-sm text-ink-2 line-clamp-3 whitespace-pre-line">{s.description_ar}</p>}
                  <Link href={`/preview/${s.id}/1?lang=${s.languages[0]}`} className="self-start text-sm font-semibold text-blue underline underline-offset-4">
                    {d.admin.preview}
                  </Link>
                </div>
                <div className="flex flex-col gap-2 md:w-[260px] shrink-0">
                  <form action={approveSeries.bind(null, s.id)}>
                    <button type="submit" className="w-full h-11 bg-[#0E7C4A] text-white text-sm font-bold">
                      {d.admin.approve}
                    </button>
                  </form>
                  <form action={rejectSeries.bind(null, s.id)} className="flex flex-col gap-2">
                    <textarea name="note" rows={2} placeholder={d.admin.rejectNote} className="w-full p-2 text-sm border border-hair bg-white" />
                    <button type="submit" className="w-full h-10 border-[1.5px] border-[#B3261E] text-[#B3261E] text-sm font-bold">
                      {d.admin.reject}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[28px] leading-tight">{d.admin.picks}</h2>
          <p className="text-sm text-ink-2">{d.admin.picksLead}</p>
        </div>
        <PicksEditor picks={picks.map(toItem)} candidates={approved.map(toItem)} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] leading-tight">{d.admin.creators}</h2>
        <ul className="divide-y divide-hair border-y border-hair">
          {((people ?? []) as Person[]).map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <span className="flex-1 flex items-center gap-1.5 font-semibold">
                {p.display_name}
                {p.is_verified && <VerifiedMark />}
              </span>
              <span className="text-xs text-muted">{d.account.role[p.role as "reader" | "creator" | "admin"]}</span>
              <form action={setVerified.bind(null, p.id, !p.is_verified)}>
                <button type="submit" className={`h-9 px-3 text-xs font-semibold border ${p.is_verified ? "border-hair text-ink-2" : "border-ink bg-ink text-white"}`}>
                  {p.is_verified ? d.admin.unverify : d.admin.verify}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[28px] leading-tight">
          {d.admin.approved} <span className="text-muted text-lg font-sans">({approved.length})</span>
        </h2>
        <ul className="divide-y divide-hair border-y border-hair">
          {approved.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-3">
              <Link href={`/${s.kind === "comic" ? "comics" : "novels"}/${s.slug}`} className="flex-1 min-w-0 flex flex-col">
                <span className="font-semibold truncate">{s.title_ar}</span>
                <span className="text-xs text-muted">
                  {s.profiles?.display_name} · {s.episodes?.[0]?.count ?? 0}
                </span>
              </Link>
              <form action={hideSeries.bind(null, s.id)} className="flex items-center gap-2">
                <input name="note" placeholder={d.admin.rejectNote} className="h-9 px-2 text-xs border border-hair bg-white w-[180px]" />
                <ConfirmButton message={d.admin.unpublishSeries + "؟"} className="h-9 px-3 text-xs font-semibold border border-hair text-[#B3261E]">
                  {d.admin.unpublishSeries}
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-[28px] leading-tight">{d.admin.storage}</h2>
        <StorageSetup />
      </section>
    </div>
  );
}
