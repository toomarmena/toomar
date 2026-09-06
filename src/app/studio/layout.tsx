import { StudioNav } from "@/components/studio/studio-nav";
import { getUser } from "@/lib/supabase/server";

/** The creator's dashboard: a sidebar on desktop, tabs on phones. */
export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const user = await getUser().catch(() => null);
  if (!user) return <>{children}</>;
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-12 pt-4 md:pt-10 flex flex-col md:flex-row gap-6 md:gap-12">
      <StudioNav />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
