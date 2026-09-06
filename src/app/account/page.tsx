import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Avatar } from "@/components/avatar";
import { VerifiedMark } from "@/components/icons";
import { Wordmark } from "@/components/wordmark";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { getProfile } from "@/lib/supabase/server";
import { setUiLang, signOut } from "./actions";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.account.title };
}

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  const { lang, d } = await getDict();
  const profile = await getProfile().catch(() => null);

  if (!profile) {
    return (
      <div className="wrap pt-16 md:pt-24 section-end flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Wordmark size="lg" href="/" />
          <p className="t-caption">{sp.check ? d.account.checkInbox : d.account.welcome}</p>
        </div>
        <AuthForm next={next} initialError={typeof sp.error === "string" ? sp.error : undefined} />
      </div>
    );
  }

  const links = [
    { href: "/studio", label: d.nav.studio },
    { href: "/studio/profile", label: d.account.editProfile },
    { href: "/library", label: d.nav.library },
    ...(profile.role === "admin" ? [{ href: "/admin", label: d.nav.admin }] : []),
  ];

  return (
    <div className="wrap pt-10 md:pt-16 section-end flex flex-col gap-10 max-w-[720px]">
      <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-hair">
        <h1 className="t-h2">{d.account.title}</h1>
        <form action={signOut}>
          <button type="submit" className="t-link t-caption text-ink">
            {d.account.signOut}
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <Avatar src={mediaUrl(profile.avatar_key)} size={56} />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="t-series flex items-center gap-1.5">
            {profile.display_name}
            {profile.is_verified && <VerifiedMark size={12} />}
          </span>
          <span className="t-caption">
            {d.account.role[profile.role]} · <span dir="ltr">@{profile.handle}</span>
          </span>
        </div>
      </div>

      <ul className="divide-y divide-hair border-y border-hair">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between py-3.5 hover:text-blue transition-colors">
              <span>{l.label}</span>
              <span aria-hidden>{d.common.fwd}</span>
            </Link>
          </li>
        ))}
      </ul>

      <form action={setUiLang} className="flex items-center gap-6">
        <span className="t-caption">{d.account.uiLang}</span>
        <div className="flex gap-5">
          {(["ar", "en"] as const).map((l) => (
            <button key={l} type="submit" name="lang" value={l} className={`text-[13px] border-b-2 pb-0.5 transition-colors ${l === lang ? "text-ink border-ink font-medium" : "text-muted border-transparent hover:text-ink"}`}>
              {l === "ar" ? "العربية" : "English"}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
