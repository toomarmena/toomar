import { LegalPage } from "@/components/legal-page";
import { getLang } from "@/lib/lang-server";
import { TERMS } from "@/lib/legal";

export async function generateMetadata() {
  return { title: TERMS[await getLang()].title };
}

export default async function TermsPage() {
  return <LegalPage doc={TERMS[await getLang()]} />;
}
