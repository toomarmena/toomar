import type { Metadata, Viewport } from "next";
import { El_Messiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/shell";
import { LangProvider } from "@/components/lang-provider";
import { getDict, getLang, getTheme } from "@/lib/lang-server";
import { getProfile } from "@/lib/supabase/server";

const display = El_Messiri({
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

export async function generateMetadata(): Promise<Metadata> {
  const { lang, d } = await getDict();
  const name = lang === "ar" ? "طومار" : "Toomar";
  return { title: { default: name, template: `%s · ${name}` }, description: d.meta.siteDescription };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [lang, theme, profile] = await Promise.all([getLang(), getTheme(), getProfile().catch(() => null)]);
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} data-theme={theme} className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider lang={lang}>
          <Shell signedIn={!!profile} role={profile?.role ?? null} theme={theme}>
            {children}
          </Shell>
        </LangProvider>
      </body>
    </html>
  );
}
