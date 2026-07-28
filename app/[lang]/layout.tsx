import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { locales, isLocale, localeDir, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { DictionaryProvider } from "@/contexts/DictionaryContext";
import MiniPlayer from "@/components/player/MiniPlayer";
import PublicSearch from "@/components/layout/PublicSearch";
import PWARegister from "@/components/PWARegister";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const ogLocale = lang === "ar" ? "ar_SA" : "fr_FR";

  return {
    title: {
      default: "Abu Maryam TV — Qur'an & Sunna",
      template: "%s | Abu Maryam TV",
    },
    description:
      "Plateforme éducative islamique d'Oustaz Niang Mbaye (H.A) — cours, conférences, khoutbas et séminaires selon la compréhension des Salaf.",
    keywords: [
      "Islam", "Qur'an", "Sunna", "Tafsir", "Tawhid", "Oustaz Niang Mbaye",
      "cours islamiques", "khoutba", "da'wah", "Wolof", "Salaf",
    ],
    authors: [{ name: "Oustaz Niang Mbaye (H.A)" }],
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: "Abu Maryam TV",
      title: "Abu Maryam TV — Qur'an & Sunna",
      description:
        "Cours, conférences, khoutbas et séminaires d'Oustaz Niang Mbaye (H.A) — le savoir islamique authentique, accessible à tous.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Abu Maryam TV — Qur'an & Sunna",
    },
    manifest: "/manifest.json",
  };
}

export const viewport: Viewport = {
  themeColor: "#3c4a37",
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} dir={localeDir[lang as Locale]} className={fontVariables}>
      <body className="min-h-screen bg-[#efe9dc] text-[#232a20]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[200] focus:top-3 focus:left-3 focus:bg-[#3c4a37] focus:text-[#fbf9f3] focus:px-4 focus:py-2.5 focus:rounded-[8px] focus:font-[var(--font-hanken)] focus:text-[13.5px] focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#cda350] focus:ring-offset-2"
        >
          {dict.skipLink}
        </a>
        <DictionaryProvider dict={dict} lang={lang as Locale}>
          <SearchProvider>
            <PlayerProvider>
              {children}
              <MiniPlayer />
            </PlayerProvider>
            <PublicSearch />
          </SearchProvider>
        </DictionaryProvider>
        <PWARegister />
      </body>
    </html>
  );
}
