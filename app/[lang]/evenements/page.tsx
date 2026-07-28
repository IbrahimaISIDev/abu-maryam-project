import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Événements",
  description:
    "Séminaires, conférences et programmes à venir d'Oustaz Niang Mbaye (H.A) — inscriptions et agenda complet.",
  openGraph: {
    title: "Événements | Abu Maryam TV",
    description: "Agenda des séminaires et conférences — dates, lieux et inscriptions.",
  },
};
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SeminarHero from "@/components/evenements/SeminarHero";
import AgendaList from "@/components/evenements/AgendaList";
import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";

export default async function EvenementsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.nav.events} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8 space-y-12">
          <SeminarHero dict={dict.events} lang={lang} />
          <AgendaList dict={dict.events} lang={lang} />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
