import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import VideoPlayer from "@/components/live/VideoPlayer";
import LiveSidebar from "@/components/live/LiveSidebar";
import { liveStatus } from "@/data/live";
import Image from "next/image";
import { getDictionary } from "@/dictionaries";
import { formatStartedAgo } from "@/lib/format";
import { getLiveStatusTitle, getLiveStatusDescription } from "@/lib/content-i18n";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "ar") {
    return {
      title: "البث المباشر",
      description: "تابع البث المباشر للأستاذ نيانغ مباي (حفظه الله) — دروس وخطب ومحاضرات لحظة بلحظة.",
      openGraph: {
        title: "البث المباشر | Abu Maryam TV",
        description: "بث مباشر — دروس إسلامية وخطب ومحاضرات.",
        type: "video.other",
      },
    };
  }
  return {
    title: "En direct",
    description:
      "Suivez les transmissions en direct d'Oustaz Niang Mbaye (H.A) — cours, khoutbas et conférences en temps réel.",
    openGraph: {
      title: "En direct | Abu Maryam TV",
      description: "Diffusion en direct — cours islamiques, khoutbas et conférences.",
      type: "video.other",
    },
  };
}

export default async function EnDirectPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.nav.live} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-6 md:py-8">
          <div className="flex flex-col md:grid md:grid-cols-[1fr_340px] gap-6">
            {/* Colonne principale */}
            <div>
              <VideoPlayer dict={dict} lang={lang} />

              {/* Infos sous le lecteur */}
              <div className="mt-5">
                <p className="arabic text-[#b58a3c] text-[18px] text-right mb-2">
                  {liveStatus.arabicVerse}
                </p>
                <h1 className="font-[var(--font-cormorant)] font-semibold text-[26px] md:text-[32px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-4">
                  {getLiveStatusTitle(liveStatus, lang)}
                </h1>

                {/* Avatar + info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#e2dac9] dark:border-[#3a4132]">
                    <Image
                      src="/images/oustaz-niang-mbaye1.jpeg"
                      alt={liveStatus.hostName}
                      fill
                      sizes="40px"
                      className="object-cover"
                      style={{ filter: "saturate(0.78) sepia(0.08) contrast(1.02)" }}
                    />
                  </div>
                  <div>
                    <p className="font-[var(--font-hanken)] font-semibold text-[14px] text-[#232a20] dark:text-[#f2ede0]">
                      {liveStatus.hostName}
                    </p>
                    <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483] dark:text-[#8f8973]">
                      {formatStartedAgo(32, lang)}
                    </p>
                  </div>
                </div>

                {/* Boutons action */}
                <div className="flex gap-3 mb-5">
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#d8d0bf] dark:border-[#454c3c] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors">
                    ↗ {dict.common.share}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#d8d0bf] dark:border-[#454c3c] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors">
                    🔔 {dict.live.notify}
                  </button>
                </div>

                <hr className="border-[#e2dac9] dark:border-[#3a4132] mb-4" />

                <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed">
                  {getLiveStatusDescription(liveStatus, lang)}
                </p>
              </div>
            </div>

            {/* Rail latéral */}
            <LiveSidebar dict={dict} lang={lang} />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
