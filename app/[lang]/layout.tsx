import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { locales, isLocale, localeDir, buildLanguageAlternates, SITE_URL, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/dictionaries";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { DictionaryProvider } from "@/contexts/DictionaryContext";
import MiniPlayer from "@/components/player/MiniPlayer";
import PublicSearch from "@/components/layout/PublicSearch";
import PWARegister from "@/components/PWARegister";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { getAllTeachings, getAllSeries, getAgendaItems } from "@/lib/db/queries";

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

  const siteTitle = lang === "ar" ? "Abu Maryam TV — القرآن والسنة" : "Abu Maryam TV — Qur'an & Sunna";
  const description =
    lang === "ar"
      ? "منصة تعليمية إسلامية للأستاذ نيانغ مباي (حفظه الله) — دروس ومحاضرات وخطب وندوات وفق فهم السلف الصالح."
      : "Plateforme éducative islamique d'Oustaz Niang Mbaye (H.A) — cours, conférences, khoutbas et séminaires selon la compréhension des Salaf.";
  const keywords =
    lang === "ar"
      ? ["الإسلام", "القرآن", "السنة", "تفسير", "توحيد", "الأستاذ نيانغ مباي", "دروس إسلامية", "خطبة", "دعوة", "الولوف", "السلف"]
      : ["Islam", "Qur'an", "Sunna", "Tafsir", "Tawhid", "Oustaz Niang Mbaye", "cours islamiques", "khoutba", "da'wah", "Wolof", "Salaf"];
  const ogDescription =
    lang === "ar"
      ? "دروس ومحاضرات وخطب وندوات للأستاذ نيانغ مباي (حفظه الله) — العلم الشرعي الأصيل، في متناول الجميع."
      : "Cours, conférences, khoutbas et séminaires d'Oustaz Niang Mbaye (H.A) — le savoir islamique authentique, accessible à tous.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteTitle,
      template: "%s | Abu Maryam TV",
    },
    description,
    keywords,
    authors: [{ name: "Oustaz Niang Mbaye (H.A)" }],
    alternates: isLocale(lang)
      ? {
          ...buildLanguageAlternates(lang, ""),
          types: { "application/rss+xml": `${SITE_URL}/podcast.xml` },
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: "Abu Maryam TV",
      title: siteTitle,
      description: ogDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
    },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#3c4a37",
};

import QuestionFloatingButton from "@/components/questions/QuestionFloatingButton";

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
  const [teachings, seriesList, agendaItems] = await Promise.all([
    getAllTeachings(),
    getAllSeries(),
    getAgendaItems(),
  ]);

  return (
    <html lang={lang} dir={localeDir[lang as Locale]} className={fontVariables}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#efe9dc] dark:bg-[#1b211a] text-[#232a20] dark:text-[#f2ede0]">
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
              <QuestionFloatingButton />
              <PWAInstallBanner />
            </PlayerProvider>
            <PublicSearch teachings={teachings} seriesList={seriesList} agendaItems={agendaItems} />
          </SearchProvider>
        </DictionaryProvider>
        <PWARegister />
      </body>
    </html>
  );
}
