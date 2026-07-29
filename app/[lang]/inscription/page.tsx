import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SeminarRecap from "@/components/inscription/SeminarRecap";
import RegistrationForm from "@/components/inscription/RegistrationForm";
import { getDictionary } from "@/dictionaries";
import { buildLanguageAlternates, type Locale } from "@/lib/i18n";
import { getSeminar } from "@/lib/db/queries";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const alternates = buildLanguageAlternates(lang, "/inscription");
  if (lang === "ar") {
    return {
      title: "التسجيل في الندوة",
      description: "سجّل في الندوة القادمة للأستاذ نيانغ مباي (حفظه الله) — أماكن محدودة، استمارة إلكترونية آمنة.",
      alternates,
      openGraph: {
        title: "التسجيل | Abu Maryam TV",
        description: "احجز مكانك في الندوة — استمارة تسجيل إلكترونية.",
      },
    };
  }
  return {
    title: "Inscription au séminaire",
    description:
      "Inscrivez-vous au prochain séminaire d'Oustaz Niang Mbaye (H.A) — places limitées, formulaire en ligne sécurisé.",
    alternates,
    openGraph: {
      title: "Inscription | Abu Maryam TV",
      description: "Réservez votre place pour le séminaire — formulaire d'inscription en ligne.",
    },
  };
}

export default async function InscriptionPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const seminar = await getSeminar();

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.inscription.form.title} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
          <div className="flex flex-col md:grid md:grid-cols-[400px_1fr] gap-6 md:gap-8 items-start">
            {seminar && <SeminarRecap dict={dict.inscription.recap} lang={lang} seminar={seminar} />}
            <RegistrationForm dict={dict.inscription.form} lang={lang} />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
