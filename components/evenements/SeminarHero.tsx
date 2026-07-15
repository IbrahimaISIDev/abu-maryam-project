import Link from "next/link";
import { seminar } from "@/data/events";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function SeminarHero() {
  return (
    <div className="rounded-[16px] overflow-hidden bg-[#3c4a37] flex flex-col md:flex-row">
      {/* Texte ~64% */}
      <div className="flex-1 p-7 md:p-10 flex flex-col justify-center">
        {/* Badge */}
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 border border-[rgba(138,47,41,0.6)] text-[#fbf9f3] bg-[rgba(138,47,41,0.25)] text-[10.5px] font-bold tracking-widest uppercase font-[var(--font-hanken)] px-3 py-1.5 rounded-[4px]">
            À LA UNE · PLACES LIMITÉES
          </span>
        </div>

        {/* Verset */}
        <p className="arabic text-[#cda350] text-[20px] mb-3 text-right">
          {seminar.arabicVerse}
        </p>

        {/* Label */}
        <p className="font-[var(--font-hanken)] text-[12px] uppercase tracking-widest text-[#cda350] font-semibold mb-2">
          {seminar.label}
        </p>

        {/* Titre */}
        <h1 className="font-[var(--font-cormorant)] font-semibold text-[30px] md:text-[42px] text-[#fbf9f3] leading-tight mb-4">
          {seminar.title}
        </h1>

        <p className="font-[var(--font-hanken)] text-[14.5px] text-[rgba(251,249,243,0.8)] mb-6 max-w-[480px] leading-relaxed">
          {seminar.description}
        </p>

        {/* Chips info */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              Dates
            </p>
            <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685]">
              08 → 15 Août 2026
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              Inscription avant
            </p>
            <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685]">
              20 Juillet 2026
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              Places restantes
            </p>
            <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685]">
              {seminar.remainingPlaces} / {seminar.totalPlaces}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div>
          <Link
            href="/inscription"
            className="inline-block bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[#9e7832] transition-colors"
          >
            S&apos;inscrire au séminaire
          </Link>
          <p className="mt-2 font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.55)]">
            {seminar.targetAudience}
          </p>
        </div>
      </div>

      {/* Photo ~36% */}
      <div className="md:w-[36%] min-h-[200px] md:min-h-0">
        <ImagePlaceholder className="w-full h-full min-h-[200px]" label="Photo du séminaire" />
      </div>
    </div>
  );
}
