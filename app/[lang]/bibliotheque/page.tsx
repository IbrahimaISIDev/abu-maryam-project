import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import BibliothequeCatalogue from "@/components/bibliotheque/BibliothequeCatalogue";
import { getAllTeachings, getAllSeries } from "@/lib/db/queries";
import { getDictionary } from "@/dictionaries";
import { buildLanguageAlternates, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const alternates = buildLanguageAlternates(lang, "/bibliotheque");
  const count = (await getAllTeachings()).length;
  if (lang === "ar") {
    return {
      title: "المكتبة",
      description: `${count} درسًا إسلاميًا للأستاذ نيانغ مباي (حفظه الله) — تفسير وتوحيد وخطب ومحاضرات وسلاسل دروس بالولوف والعربية.`,
      alternates,
      openGraph: {
        title: "مكتبة الدروس | Abu Maryam TV",
        description: "دروس إسلامية وخطب ومحاضرات — مصنّفة حسب الموضوع، لمتابعتها بالوتيرة التي تناسبك.",
      },
    };
  }
  return {
    title: "Bibliothèque",
    description:
      `${count} enseignements islamiques d'Oustaz Niang Mbaye (H.A) — tafsir, tawhid, khoutbas, conférences et séries de cours en wolof et en arabe.`,
    alternates,
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
  const [teachings, seriesList] = await Promise.all([getAllTeachings(), getAllSeries()]);

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.nav.library} />

      <main id="main-content" className="pb-20 md:pb-0">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <BibliothequeCatalogue dict={dict.library} lang={lang} teachings={teachings} seriesList={seriesList} />
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
