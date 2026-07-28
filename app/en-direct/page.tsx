import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "En direct",
  description:
    "Suivez les transmissions en direct d'Oustaz Niang Mbaye (H.A) — cours, khoutbas et conférences en temps réel.",
  openGraph: {
    title: "En direct | Abu Maryam TV",
    description: "Diffusion en direct — cours islamiques, khoutbas et conférences.",
    type: "video.other",
  },
};
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import VideoPlayer from "@/components/live/VideoPlayer";
import LiveSidebar from "@/components/live/LiveSidebar";
import { liveStatus } from "@/data/live";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function EnDirectPage() {
  return (
    <>
      <Navbar />
      <MobileHeader title="En direct" />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-6 md:py-8">
          <div className="flex flex-col md:grid md:grid-cols-[1fr_340px] gap-6">
            {/* Colonne principale */}
            <div>
              <VideoPlayer />

              {/* Infos sous le lecteur */}
              <div className="mt-5">
                <p className="arabic text-[#b58a3c] text-[18px] text-right mb-2">
                  {liveStatus.arabicVerse}
                </p>
                <h1 className="font-[var(--font-cormorant)] font-semibold text-[26px] md:text-[32px] text-[#232a20] leading-tight mb-4">
                  {liveStatus.title}
                </h1>

                {/* Avatar + info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <ImagePlaceholder className="w-full h-full" label="" />
                  </div>
                  <div>
                    <p className="font-[var(--font-hanken)] font-semibold text-[14px] text-[#232a20]">
                      {liveStatus.hostName}
                    </p>
                    <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483]">
                      En direct · commencé il y a 32 min
                    </p>
                  </div>
                </div>

                {/* Boutons action */}
                <div className="flex gap-3 mb-5">
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#d8d0bf] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors">
                    ↗ Partager
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-[#d8d0bf] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors">
                    🔔 Être notifié
                  </button>
                </div>

                <hr className="border-[#e2dac9] mb-4" />

                <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] leading-relaxed">
                  {liveStatus.description}
                </p>
              </div>
            </div>

            {/* Rail latéral */}
            <LiveSidebar />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
