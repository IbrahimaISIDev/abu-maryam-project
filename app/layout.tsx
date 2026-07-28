import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk, Amiri } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/contexts/PlayerContext";
import MiniPlayer from "@/components/player/MiniPlayer";
import PWARegister from "@/components/PWARegister";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
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
    locale: "fr_FR",
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

export const viewport: Viewport = {
  themeColor: "#3c4a37",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${hanken.variable} ${amiri.variable}`}
    >
      <body className="min-h-screen bg-[#efe9dc] text-[#232a20]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[200] focus:top-3 focus:left-3 focus:bg-[#3c4a37] focus:text-[#fbf9f3] focus:px-4 focus:py-2.5 focus:rounded-[8px] focus:font-[var(--font-hanken)] focus:text-[13.5px] focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#cda350] focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>
        <PlayerProvider>
          {children}
          <MiniPlayer />
        </PlayerProvider>
        <PWARegister />
      </body>
    </html>
  );
}
