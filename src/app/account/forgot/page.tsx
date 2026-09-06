import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { getDict } from "@/lib/lang-server";
import { requestPasswordReset } from "../actions";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.account.forgot };
}

export default async function ForgotPage({ searchParams }: PageProps<"/account/forgot">) {
  const { sent } = await searchParams;
  const { d } = await getDict();
  return (
    <div className="wrap pt-16 md:pt-24 section-end flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Wordmark size="lg" />
        <p className="t-caption max-w-[40ch]">{sent ? d.account.resetSent : d.account.forgotLead}</p>
      </div>
      {!sent && (
        <form action={requestPasswordReset} className="flex flex-col gap-3 w-full max-w-[360px]">
          <input name="email" type="email" required autoComplete="email" placeholder={d.account.email} className="field" dir="ltr" />
          <Button type="submit" variant="primary" block>
            {d.account.sendReset}
          </Button>
        </form>
      )}
      <Link href="/account" className="t-link t-caption text-ink">
        {d.account.backToSignIn}
      </Link>
    </div>
  );
}
