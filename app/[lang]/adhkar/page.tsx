import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import AdhkarContainer from "@/components/adhkar/AdhkarContainer";
import { getDictionary } from "@/dictionaries";
import { buildLanguageAlternates, type Locale } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const alternates = buildLanguageAlternates(lang, "/adhkar");
  if (lang === "ar") {
    return {
      title: "الأذكار اليومية",
      description: "أذكار الصباح والمساء وبعد الصلاة بالصوت والنص العربي والترجمة.",
      alternates,
    };
  }
  return {
    title: "Invocations Authentiques (Adhkar)",
    description:
      "Recueil des invocations authentiques du matin, du soir et d'après prière avec lecture audio et compteur interactif.",
    alternates,
  };
}

export default async function AdhkarPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isAr = lang === "ar";

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.bottomNav.adhkar} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-10 space-y-8">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-[#b58a3c]/30 bg-gradient-to-r from-[#1c2419] via-[#243021] to-[#1a2217] p-8 text-center text-white shadow-xl md:p-12">
            {isAr ? (
              <h1 className="arabic font-[var(--font-amiri)] text-3xl text-[#d4af37] md:text-4xl">
                أَذْكَارُ الْمُسْلِمِ
              </h1>
            ) : (
              <>
                <span className="arabic font-[var(--font-amiri)] text-3xl text-[#d4af37] md:text-4xl">
                  أَذْكَارُ الْمُسْلِمِ
                </span>
                <h1 className="mt-3 font-[var(--font-cormorant)] text-2xl font-bold tracking-wide text-white md:text-4xl">
                  Invocations Authentiques du Musulman
                </h1>
              </>
            )}
            <p className={`mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base ${isAr ? "arabic font-[var(--font-amiri)] text-base md:text-lg" : ""}`}>
              {isAr
                ? "الأذكار حصن المؤمن. داوم على ذكر الله في الصباح والمساء وبعد كل صلاة لتنير يومك."
                : "« Les invocations sont la forteresse du croyant. Pratiquez le Dhikr au matin, au soir et après chaque prière pour illuminer votre journée. »"}
            </p>
          </div>

          {/* Adhkar Interactive Component */}
          <AdhkarContainer lang={lang} />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
