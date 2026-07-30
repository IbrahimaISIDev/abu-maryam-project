import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import LiveBanner from "@/components/home/LiveBanner";
import AgendaList from "@/components/evenements/AgendaList";
import { getDictionary } from "@/dictionaries";
import { getAgendaItems, getReplays } from "@/lib/db/queries";
import { buildLanguageAlternates, type Locale } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const alternates = buildLanguageAlternates(lang, "/activites");
  if (lang === "ar") {
    return {
      title: "الأنشطة",
      description: "جدول أنشطة الأستاذ نيانغ مباي (حفظه الله) — القادمة والسابقة، مع روابط الإعادة.",
      alternates,
      openGraph: {
        title: "الأنشطة | Abu Maryam TV",
        description: "الأنشطة القادمة والسابقة — دروس وخطب ومحاضرات.",
      },
    };
  }
  return {
    title: "Activités",
    description:
      "Toutes les activités d'Oustaz Niang Mbaye (H.A) — à venir et passées, avec accès aux replays.",
    alternates,
    openGraph: {
      title: "Activités | Abu Maryam TV",
      description: "Activités à venir et passées — cours, khoutbas, conférences et replays.",
    },
  };
}

export default async function ActivitesPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const [agendaItems, replays] = await Promise.all([getAgendaItems(), getReplays()]);

  return (
    <>
      <LiveBanner dict={dict.home} lang={lang} />
      <Navbar />
      <MobileHeader title={dict.nav.activities} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
          <AgendaList dict={dict.events} lang={lang} agendaItems={agendaItems} replays={replays} />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
