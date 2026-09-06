import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { VerifiedMark } from "@/components/icons";
import { getDict } from "@/lib/lang-server";
import { getProfile } from "@/lib/supabase/server";
import { Avatar } from "@/components/avatar";
import { mediaUrl } from "@/lib/media";
import { setUiLang, signOut } from "./actions";

export const metadata = { title: "حسابي" };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  const { lang, d } = await getDict();
  const profile = await getProfile().catch(() => null);

  if (!profile) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-8 md:pt-16 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-display text-[44px] leading-none">طومار</span>
          <p className="text-ink-2">{sp.check ? "تحقّق من بريدك لتأكيد الحساب." : d.account.welcome}</p>
        </div>
        <AuthForm next={next} initialError={typeof sp.error === "string" ? sp.error : undefined} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-12 pt-6 md:pt-12 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[34px] leading-tight">{d.account.title}</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
            {d.account.signOut}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 p-4 bg-surface border border-hair">
        <Avatar src={mediaUrl(profile.avatar_key)} name={profile.display_name} size={56} />
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="font-semibold flex items-center gap-1.5">
            {profile.display_name}
            {profile.is_verified && <VerifiedMark />}
          </span>
          <span className="text-xs text-muted">
            {d.account.role[profile.role]} · <span dir="ltr">@{profile.handle}</span>
          </span>
        </div>
        <Link href="/studio/profile" className="text-sm font-semibold text-blue underline underline-offset-4 shrink-0">
          {d.account.editProfile}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/studio" className="px-5 py-2.5 text-sm font-semibold border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white">
          {d.nav.studio}
        </Link>
        <Link href="/library" className="px-5 py-2.5 text-sm font-semibold border border-hair text-ink hover:border-ink">
          {d.nav.library}
        </Link>
        {profile.role === "admin" && (
          <Link href="/admin" className="px-5 py-2.5 text-sm font-semibold bg-yellow text-ink">
            {d.nav.admin}
          </Link>
        )}
      </div>

      <form action={setUiLang} className="flex items-center gap-3 text-sm">
        <span className="font-semibold">{d.account.uiLang}</span>
        <div className="flex border border-hair">
          {(["ar", "en"] as const).map((l) => (
            <button key={l} type="submit" name="lang" value={l} className={`px-4 py-2 font-semibold ${l === lang ? "bg-ink text-white" : "text-ink-2 hover:text-ink"}`}>
              {l === "ar" ? "العربية" : "English"}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
