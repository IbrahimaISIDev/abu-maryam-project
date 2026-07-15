import Link from "next/link";
import { seminar } from "@/data/events";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function SeminarBanner() {
  return (
    <div className="rounded-[8px] overflow-hidden bg-[#3c4a37] min-h-[300px] flex flex-col md:flex-row">
      {/* Texte — 58% */}
      <div className="flex-1 p-7 md:p-10 flex flex-col justify-center order-2 md:order-1">
        {/* Badge urgence */}
        <div className="mb-4">
          <span className="inline-block bg-[#8a2f29] text-[#fbf9f3] text-[10.5px] font-bold tracking-widest uppercase font-[var(--font-hanken)] px-3 py-1">
            PLACES LIMITÉES
          </span>
        </div>

        {/* Verset arabe */}
        <p className="arabic text-[#cda350] text-[18px] mb-3 text-right">
          {seminar.arabicVerse}
        </p>

        {/* Label */}
        <p className="font-[var(--font-hanken)] text-[12.5px] uppercase tracking-widest text-[#cda350] font-semibold mb-2">
          {seminar.label}
        </p>

        {/* Titre */}
        <h3 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[38px] text-[#fbf9f3] leading-tight mb-5">
          {seminar.title}
        </h3>

        {/* Dates */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">Dates</p>
            <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#e3c685]">
              08 → 15 Août 2026
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">Clôture</p>
            <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#e3c685]">
              20 Juillet 2026
            </p>
          </div>
        </div>

        {/* CTA + compteur */}
        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href="/inscription"
            className="bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-[#9e7832] transition-colors"
          >
            S&apos;inscrire maintenant
          </Link>
          <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483]">
            {seminar.remainingPlaces} places sur {seminar.totalPlaces}
          </p>
        </div>
      </div>

      {/* Photo — 42% */}
      <div className="md:w-[42%] min-h-[200px] md:min-h-0 order-1 md:order-2">
        <ImagePlaceholder className="w-full h-full min-h-[200px]" label="Photo du séminaire" />
      </div>
    </div>
  );
}
