import Link from "@/components/ui/LocalizedLink";
import { getLiveStatus, getSeminar } from "@/lib/db/queries";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { getLiveStatusTitle } from "@/lib/content-i18n";
import SeminarCountdown from "./SeminarCountdown";

export default async function LiveBanner({ dict, lang }: { dict: Dictionary["home"]; lang: Locale }) {
  const [liveStatus, seminar] = await Promise.all([getLiveStatus(), getSeminar()]);

  if (liveStatus.isLive) {
    return (
      <div className="bg-[#232a20] text-[#fbf9f3] border-b border-[#b58a3c]/40">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-2.5 flex items-center gap-3">
          <span className="relative flex shrink-0 h-3 w-3 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e74c3c] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c0392b]" />
          </span>
          <p className="font-[var(--font-hanken)] text-[12.5px] font-medium flex-1 truncate">
            <span className="font-bold text-[#ffd700] uppercase tracking-wider">🔴 EN DIRECT</span>
            {" — "}
            <span className="text-white">{getLiveStatusTitle(liveStatus, lang)}</span>
          </p>
          <Link
            href="/en-direct"
            className="shrink-0 font-[var(--font-hanken)] text-[12px] font-bold bg-[#b58a3c] text-white px-3.5 py-1 rounded-full hover:bg-[#c99b45] transition-colors shadow-sm"
          >
            {dict.liveBannerWatch || "Rejoindre le Direct"}
          </Link>
        </div>
      </div>
    );
  }

  // If offline, check if a seminar date exists for countdown
  if (seminar && seminar.dateStart) {
    const isFuture = new Date(seminar.dateStart).getTime() > Date.now();
    if (isFuture) {
      return (
        <div className="bg-[#182116] text-[#fbf9f3] border-b border-white/10">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-2 flex flex-wrap items-center justify-between gap-3">
            <SeminarCountdown targetDate={seminar.dateStart} title={seminar.labelShort || seminar.title} />
            <Link
              href="/evenements"
              className="font-[var(--font-hanken)] text-[11.5px] font-semibold text-[#b58a3c] hover:text-[#d4af37] transition-colors"
            >
              S'inscrire / En savoir plus →
            </Link>
          </div>
        </div>
      );
    }
  }

  return null;
}
