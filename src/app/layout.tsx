import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Reem_Kufi } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { LangProvider } from "@/components/lang-provider";
import { getLang } from "@/lib/lang-server";
import { getProfile } from "@/lib/supabase/server";

const display = Reem_Kufi({
  variable: "--font-display",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = IBM_Plex_Sans_Arabic({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "طومار", template: "%s · طومار" },
  description: "منصة عربية للقصص المصوّرة والروايات، تصدر في حلقات أسبوعية.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  const profile = await getProfile().catch(() => null);
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider lang={lang}>
          <Shell signedIn={!!profile} role={profile?.role ?? null}>
            {children}
          </Shell>
        </LangProvider>
      </body>
    </html>
  );
}
