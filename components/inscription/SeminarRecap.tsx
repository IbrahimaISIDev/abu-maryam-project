import { seminar } from "@/data/events";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { formatTrainingDays, formatClosingOn, formatLimitedPlaces } from "@/lib/format";
import { getSeminarField, getSeminarPerks } from "@/lib/content-i18n";

export default function SeminarRecap({
  dict,
  lang,
}: {
  dict: Dictionary["inscription"]["recap"];
  lang: Locale;
}) {
  return (
    <div className="bg-[#3c4a37] rounded-[13px] p-7 md:p-8 flex flex-col text-[#fbf9f3]">
      {/* Verset */}
      <p className="arabic text-[#cda350] text-[18px] text-right mb-4">
        {seminar.arabicVerse}
      </p>

      {/* Label */}
      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#cda350] font-semibold mb-1">
        {getSeminarField("labelShort", lang)}
      </p>

      {/* Titre */}
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[32px] leading-tight text-[#fbf9f3] mb-6">
        {getSeminarField("title", lang)}
      </h2>

      {/* Infos */}
      <ul className="space-y-3 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">📅</span>
          <div>
            <p dir="ltr" className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3] text-left">
              08 → 15 Août 2026
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              {formatTrainingDays(8, lang)}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">⏳</span>
          <div>
            <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3]">
              {formatClosingOn("20 juillet 2026", lang)}
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              {formatLimitedPlaces(seminar.remainingPlaces, lang)}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">📍</span>
          <div>
            <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3]">
              {seminar.location}
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              {dict.onsiteNote}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-[#cda350] text-[16px] mt-0.5">💰</span>
          <div>
            <p dir="ltr" className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#fbf9f3] text-left">
              {seminar.price}
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.6)]">
              {getSeminarField("priceNote", lang)}
            </p>
          </div>
        </li>
      </ul>

      <hr className="border-[rgba(251,249,243,0.15)] mb-5" />

      {/* Ce que vous recevrez */}
      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[rgba(251,249,243,0.55)] font-semibold mb-3">
        {dict.whatYouGet}
      </p>
      <ul className="space-y-2 mb-6">
        {getSeminarPerks(lang).map((perk, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span className="text-[#e3c685] font-bold text-[14px]">✓</span>
            <span className="font-[var(--font-hanken)] text-[13.5px] text-[rgba(251,249,243,0.85)]">
              {perk}
            </span>
          </li>
        ))}
      </ul>

      <hr className="border-[rgba(251,249,243,0.15)] mb-5" />

      {/* Contact */}
      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[rgba(251,249,243,0.55)] font-semibold mb-3">
        {dict.contact}
      </p>
      <ul className="space-y-2">
        <li className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.85)]">
          📞{" "}
          <span dir="ltr" className="inline-block">
            {seminar.contactPhone}
          </span>{" "}
          <span className="text-[rgba(251,249,243,0.55)]">({seminar.contactPhoneNote})</span>
        </li>
        <li className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.85)] break-all">
          ✉️ {seminar.contactEmail}
        </li>
      </ul>
    </div>
  );
}
