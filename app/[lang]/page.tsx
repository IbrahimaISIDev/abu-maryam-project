import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import SeminarBanner from "@/components/home/SeminarBanner";
import TeachingsGrid from "@/components/home/TeachingsGrid";
import LiveReplays from "@/components/home/LiveReplays";
import ThemeGrid from "@/components/home/ThemeGrid";
import HomeCTA from "@/components/home/HomeCTA";
import ContinueListening from "@/components/home/ContinueListening";
import LiveBanner from "@/components/home/LiveBanner";
import { getDictionary } from "@/dictionaries";
import { getAllTeachings } from "@/lib/db/queries";
import type { Locale } from "@/lib/i18n";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const teachings = await getAllTeachings();

  return (
    <>
      <LiveBanner dict={dict.home} lang={lang} />
      <Navbar />
      <MobileHeader />

      <main id="main-content" className="pb-20 md:pb-0">
        <Hero dict={dict.home} />

        <div className="max-w-[1280px] mx-auto px-5 md:px-10 space-y-12 md:space-y-14 py-10 md:py-14">
          <SeminarBanner dict={dict.home} lang={lang} />
          <ContinueListening title={dict.home.continueListeningTitle} viewAll={dict.home.viewAll} lang={lang} teachings={teachings} />
          <TeachingsGrid dict={dict.home} lang={lang} />
          <LiveReplays dict={dict.home} lang={lang} liveLabel={dict.common.liveNow} />
          <ThemeGrid dict={dict.home} lang={lang} />
          <HomeCTA dict={dict.home} lang={lang} />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
