"use client";

import { useActionState, useState } from "react";
import { signInWithGoogle, signInWithPassword, signUpWithPassword, type AuthState } from "@/app/account/actions";
import { useT } from "./lang-provider";

const input = "w-full h-12 px-4 border border-hair bg-white text-ink placeholder:text-muted focus:outline-none focus:border-ink";

export function AuthForm({ next, initialError }: { next: string; initialError?: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signInWithPassword, null);
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUpWithPassword, null);
  const d = useT();
  const state = mode === "in" ? inState : upState;
  const pending = mode === "in" ? inPending : upPending;
  const errorKey = state?.error ?? (initialError === "auth" ? "auth" : undefined);

  return (
    <div className="flex flex-col gap-5 w-full max-w-[420px]">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className="w-full h-12 flex items-center justify-center gap-3 border-[1.5px] border-ink font-semibold text-ink hover:bg-surface">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.3 13.4 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
            <path fill="#FBBC05" d="M10.4 28.8c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.8-6z" />
            <path fill="#34A853" d="M24 48c6.2 0 11.6-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.7-3.9-13.6-9.4l-7.8 6C6.5 42.6 14.6 48 24 48z" />
          </svg>
          {d.account.google}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex-1 h-px bg-hair" />
        {d.account.or}
        <span className="flex-1 h-px bg-hair" />
      </div>

      <form action={mode === "in" ? inAction : upAction} className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next} />
        {mode === "up" && <input name="name" type="text" autoComplete="name" placeholder={d.account.name} className={input} maxLength={60} />}
        <input name="email" type="email" required autoComplete="email" placeholder={d.account.email} className={input} dir="ltr" />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          placeholder={d.account.password}
          className={input}
          dir="ltr"
        />
        {errorKey && (
          <p role="alert" className="text-sm text-[#B3261E]">
            {d.account.errors[errorKey]}
          </p>
        )}
        <button type="submit" disabled={pending} className="h-12 bg-blue text-white font-bold hover:bg-blue-deep disabled:opacity-70">
          {pending ? d.common.loading : mode === "in" ? d.account.signIn : d.account.signUp}
        </button>
      </form>

      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink self-center">
        {mode === "in" ? d.account.noAccount : d.account.haveAccount}
      </button>
    </div>
  );
}
