"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword, type AuthState } from "@/app/account/actions";
import { useT } from "./lang-provider";
import { Button } from "./ui/button";

/** Centered column, hairline inputs, one primary button. No card. */
export function AuthForm({ next, initialError }: { next: string; initialError?: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signInWithPassword, null);
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUpWithPassword, null);
  const d = useT();
  const state = mode === "in" ? inState : upState;
  const pending = mode === "in" ? inPending : upPending;
  const errorKey = state?.error ?? (initialError === "auth" ? "auth" : undefined);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[360px]">
      <form action={mode === "in" ? inAction : upAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        {mode === "up" && <input name="name" type="text" autoComplete="name" placeholder={d.account.name} className="field" maxLength={60} />}
        <input name="email" type="email" required autoComplete="email" placeholder={d.account.email} className="field" dir="ltr" />
        <input name="password" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder={d.account.password} className="field" dir="ltr" />
        {errorKey && (
          <p role="alert" className="t-caption text-ink">
            {d.account.errors[errorKey]}
          </p>
        )}
        <Button type="submit" variant="primary" block disabled={pending} className="mt-1">
          {pending ? d.common.loading : mode === "in" ? d.account.signIn : d.account.signUp}
        </Button>
      </form>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" block>
          {d.account.google}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-3">
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="t-link t-caption text-ink">
          {mode === "in" ? d.account.noAccount : d.account.haveAccount}
        </button>
        {mode === "in" && (
          <Link href="/account/forgot" className="t-link t-caption text-ink">
            {d.account.forgot}
          </Link>
        )}
      </div>
    </div>
  );
}
