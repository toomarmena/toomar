import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { getDict } from "@/lib/lang-server";
import { getUser } from "@/lib/supabase/server";
import { updatePassword } from "../actions";

export async function generateMetadata() {
  const { d } = await getDict();
  return { title: d.account.newPassword };
}

/** Lands here from the recovery link, already signed in by the callback. */
export default async function ResetPage({ searchParams }: PageProps<"/account/reset">) {
  const { error } = await searchParams;
  const user = await getUser().catch(() => null);
  if (!user) redirect("/account/forgot");
  const { d } = await getDict();
  return (
    <div className="wrap pt-16 md:pt-24 section-end flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <Wordmark size="lg" />
        <p className="t-caption">{d.account.newPasswordLead}</p>
      </div>
      <form action={updatePassword} className="flex flex-col gap-3 w-full max-w-[360px]">
        <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder={d.account.newPassword} className="field" dir="ltr" />
        {error && (
          <p role="alert" className="t-caption text-ink">
            {d.account.errors.weak}
          </p>
        )}
        <Button type="submit" variant="primary" block>
          {d.account.save}
        </Button>
      </form>
    </div>
  );
}
