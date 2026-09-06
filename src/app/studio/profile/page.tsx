import { redirect } from "next/navigation";
import { AvatarUploader } from "@/components/studio/avatar-uploader";
import { ProfileForm } from "@/components/studio/profile-form";
import { getDict } from "@/lib/lang-server";
import { mediaUrl } from "@/lib/media";
import { cleanSocialLinks } from "@/lib/queries";
import { getProfile } from "@/lib/supabase/server";

export const metadata = { title: "ملفي العام" };

export default async function StudioProfilePage() {
  const profile = await getProfile().catch(() => null);
  if (!profile) redirect("/account?next=/studio/profile");
  const { d } = await getDict();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight">{d.studio.profile.title}</h1>
        <p className="text-sm text-ink-2">{d.studio.profile.lead}</p>
      </div>
      <AvatarUploader src={mediaUrl(profile.avatar_key)} name={profile.display_name} />
      <ProfileForm profile={{ display_name: profile.display_name, handle: profile.handle, bio: profile.bio, social_links: cleanSocialLinks(profile.social_links) }} />
    </div>
  );
}
