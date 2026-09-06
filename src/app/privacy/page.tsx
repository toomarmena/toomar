import { LegalPage } from "@/components/legal-page";
import { getLang } from "@/lib/lang-server";
import { PRIVACY } from "@/lib/legal";

export async function generateMetadata() {
  return { title: PRIVACY[await getLang()].title };
}

export default async function PrivacyPage() {
  return <LegalPage doc={PRIVACY[await getLang()]} />;
}
