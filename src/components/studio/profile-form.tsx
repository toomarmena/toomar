"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePublicProfile, type ProfileState } from "@/app/studio/actions";
import { SOCIAL_KEYS, type SocialLinks } from "@/lib/constants";
import { useT } from "../lang-provider";

const input = "w-full h-12 px-4 border border-hair bg-white text-ink focus:outline-none focus:border-ink font-normal";
const label = "flex flex-col gap-1.5 text-sm font-semibold";

export function ProfileForm({ profile }: { profile: { display_name: string; handle: string; bio: string | null; social_links: SocialLinks } }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updatePublicProfile, null);
  const d = useT();
  const err = state?.error;

  return (
    <form action={action} className="flex flex-col gap-5 max-w-[640px]">
      <label className={label}>
        {d.account.name}
        <input name="display_name" required maxLength={60} defaultValue={profile.display_name} className={input} />
      </label>
      <label className={label}>
        {d.studio.profile.handle}
        <span className="flex items-center border border-hair bg-white focus-within:border-ink" dir="ltr">
          <span className="px-3 text-sm text-muted select-none">toomar.vercel.app/creators/</span>
          <input
            name="handle"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={profile.handle}
            className="flex-1 h-12 pe-4 bg-transparent text-ink focus:outline-none font-normal"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </span>
        <span className="text-xs text-muted font-normal">{d.studio.profile.handleHint}</span>
      </label>
      <label className={label}>
        {d.account.bio}
        <textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={500} rows={4} className="w-full p-4 border border-hair bg-white text-ink focus:outline-none focus:border-ink font-normal" />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-semibold mb-1">{d.studio.profile.links}</legend>
        <span className="text-xs text-muted -mt-2">{d.studio.profile.linksHint}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_KEYS.map((k) => (
            <label key={k} className="flex flex-col gap-1 text-xs font-semibold text-ink-2">
              {d.studio.profile.social[k]}
              <input name={`social_${k}`} defaultValue={profile.social_links[k] ?? ""} maxLength={300} className={`${input} h-11`} dir="ltr" placeholder={k === "website" ? "https://" : "@"} />
            </label>
          ))}
        </div>
      </fieldset>

      {err && (
        <p role="alert" className="text-sm text-[#B3261E]">
          {err === "handleTaken" ? d.studio.profile.handleTaken : err === "handleBad" ? d.studio.profile.handleBad : err === "required" ? d.studio.errors.required : d.studio.errors.generic}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="px-7 h-12 bg-blue text-white font-bold hover:bg-blue-deep disabled:opacity-60">
          {pending ? d.common.loading : d.studio.save}
        </button>
        {state?.saved && <span className="text-sm text-[#0E7C4A]">{d.studio.saved}</span>}
        <Link href={`/creators/${profile.handle}`} className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
          {d.studio.profile.view}
        </Link>
      </div>
    </form>
  );
}
