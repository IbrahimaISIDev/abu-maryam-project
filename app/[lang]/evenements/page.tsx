import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SeminarHero from "@/components/evenements/SeminarHero";
import AgendaList from "@/components/evenements/AgendaList";
import { getDictionary } from "@/dictionaries";
import { getSeminar, getAgendaItems, getReplays, getAllTeachings } from "@/lib/db/queries";
import { buildLanguageAlternates, type Locale } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const alternates = buildLanguageAlternates(lang, "/evenements");
  if (lang === "ar") {
    return {
      title: "الفعاليات",
      description: "ندوات ومحاضرات وبرامج قادمة للأستاذ نيانغ مباي (حفظه الله) — التسجيل والجدول الكامل.",
      alternates,
      openGraph: {
        title: "الفعاليات | Abu Maryam TV",
        description: "جدول الندوات والمحاضرات — التواريخ والأماكن والتسجيل.",
      },
    };
  }
  return {
    title: "Événements",
    description:
      "Séminaires, conférences et programmes à venir d'Oustaz Niang Mbaye (H.A) — inscriptions et agenda complet.",
    alternates,
    openGraph: {
      title: "Événements | Abu Maryam TV",
      description: "Agenda des séminaires et conférences — dates, lieux et inscriptions.",
    },
  };
}

export default async function EvenementsPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const [seminar, agendaItems, replays, teachings] = await Promise.all([
    getSeminar(),
    getAgendaItems(),
    getReplays(),
    getAllTeachings(),
  ]);

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.nav.events} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8 space-y-12">
          {seminar && <SeminarHero dict={dict.events} lang={lang} seminar={seminar} />}
          <AgendaList dict={dict.events} lang={lang} agendaItems={agendaItems} replays={replays} teachings={teachings} />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
