import { StudioNav } from "@/components/studio/studio-nav";
import { getUser } from "@/lib/supabase/server";

/** The creator's dashboard: utilitarian, text tabs on top. */
export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const user = await getUser().catch(() => null);
  if (!user) return <>{children}</>;
  return (
    <div className="wrap pt-6 md:pt-10 section-end flex flex-col gap-8 md:gap-10 max-w-[960px]">
      <StudioNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
