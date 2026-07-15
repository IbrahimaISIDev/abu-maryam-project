import { seminar } from "@/data/events";

export default function SeminarRecap() {
  return (
    <div className="bg-[#3c4a37] rounded-[13px] p-7 md:p-8 flex flex-col text-[#fbf9f3]">
      {/* Verset */}
      <p className="arabic text-[#cda350] text-[18px] text-right mb-4">
        {seminar.arabicVerse}
      </p>

      {/* Label */}
      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#cda350] font-semibold mb-1">
        {seminar.labelShort}
      </p>

      {/* Titre */}
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[32px] leading-tight text-[#fbf9f3] mb-6">
        {seminar.title}
      </h2>

      {/* Infos */}
      <ul className="space-y-3 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">📅</span>
          <div>
            <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3]">
              08 → 15 Août 2026
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              8 jours de formation
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">⏳</span>
          <div>
            <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3]">
              Clôture le 20 juillet 2026
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              Places limitées · {seminar.remainingPlaces} restantes
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">📍</span>
          <div>
            <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3]">
              Présentiel &amp; en ligne
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              Suivez où que vous soyez
            </p>
          </div>
        </li>
      </ul>

      <hr className="border-[rgba(251,249,243,0.15)] mb-5" />

      {/* Ce que vous recevrez */}
      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[rgba(251,249,243,0.55)] font-semibold mb-3">
        Ce que vous recevrez
      </p>
      <ul className="space-y-2">
        {seminar.perks.map((perk, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span className="text-[#e3c685] font-bold text-[14px]">✓</span>
            <span className="font-[var(--font-hanken)] text-[13.5px] text-[rgba(251,249,243,0.85)]">
              {perk}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
