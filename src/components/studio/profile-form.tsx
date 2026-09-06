"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePublicProfile, type ProfileState } from "@/app/studio/actions";
import { SOCIAL_KEYS, type SocialLinks } from "@/lib/constants";
import { useT } from "../lang-provider";
import { Button } from "../ui/button";

const label = "flex flex-col gap-1.5 t-caption text-ink";

export function ProfileForm({ profile }: { profile: { display_name: string; handle: string; bio: string | null; social_links: SocialLinks } }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updatePublicProfile, null);
  const d = useT();
  const err = state?.error;

  return (
    <form action={action} className="flex flex-col gap-5 max-w-[560px]">
      <label className={label}>
        {d.account.name}
        <input name="display_name" required maxLength={60} defaultValue={profile.display_name} className="field text-[15px]" />
      </label>
      <label className={label}>
        {d.studio.profile.handle}
        <span className="flex items-center border border-hair focus-within:border-blue" dir="ltr">
          <span className="px-3 t-caption select-none">toomar.vercel.app/creators/</span>
          <input
            name="handle"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={profile.handle}
            className="flex-1 h-12 pe-4 bg-transparent text-ink focus:outline-none text-[15px]"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </span>
        <span className="t-caption">{d.studio.profile.handleHint}</span>
      </label>
      <label className={label}>
        {d.account.bio}
        <textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={500} rows={4} className="field text-[15px]" />
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="t-caption text-ink mb-1">{d.studio.profile.links}</legend>
        <span className="t-caption -mt-2">{d.studio.profile.linksHint}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_KEYS.map((k) => (
            <label key={k} className={label}>
              {d.studio.profile.social[k]}
              <input name={`social_${k}`} defaultValue={profile.social_links[k] ?? ""} maxLength={300} className="field h-11 text-[15px]" dir="ltr" placeholder={k === "website" ? "https://" : "@"} />
            </label>
          ))}
        </div>
      </fieldset>

      {err && (
        <p role="alert" className="t-caption text-ink">
          {err === "handleTaken" ? d.studio.profile.handleTaken : err === "handleBad" ? d.studio.profile.handleBad : err === "required" ? d.studio.errors.required : d.studio.errors.generic}
        </p>
      )}
      <div className="flex items-center gap-6">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? d.common.loading : d.studio.save}
        </Button>
        {state?.saved && <span className="t-caption">{d.studio.saved}</span>}
        <Link href={`/creators/${profile.handle}`} className="t-link t-caption text-ink">
          {d.studio.profile.view}
        </Link>
      </div>
    </form>
  );
}
