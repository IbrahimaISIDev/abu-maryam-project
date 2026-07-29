import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import BibliothequeCatalogue from "@/components/bibliotheque/BibliothequeCatalogue";
import { teachings } from "@/data/teachings";
import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "ar") {
    return {
      title: "المكتبة",
      description: `${teachings.length} درسًا إسلاميًا للأستاذ نيانغ مباي (حفظه الله) — تفسير وتوحيد وخطب ومحاضرات وسلاسل دروس بالولوف والعربية.`,
      openGraph: {
        title: "مكتبة الدروس | Abu Maryam TV",
        description: "دروس إسلامية وخطب ومحاضرات — مصنّفة حسب الموضوع، لمتابعتها بالوتيرة التي تناسبك.",
      },
    };
  }
  return {
    title: "Bibliothèque",
    description:
      `${teachings.length} enseignements islamiques d'Oustaz Niang Mbaye (H.A) — tafsir, tawhid, khoutbas, conférences et séries de cours en wolof et en arabe.`,
    openGraph: {
      title: "Bibliothèque des enseignements | Abu Maryam TV",
      description:
        "Cours islamiques, khoutbas et conférences — classés par thème, à écouter à votre rythme.",
    },
  };
}

export default async function BibliothequePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.nav.library} />

      <main id="main-content" className="pb-20 md:pb-0">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <BibliothequeCatalogue dict={dict.library} lang={lang} />
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
