"use client";

import { useState, useEffect } from "react";
import Link from "@/components/ui/LocalizedLink";
import Image from "next/image";
import { seminar } from "@/data/events";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { formatPlacesFraction } from "@/lib/format";
import { getSeminarField } from "@/lib/content-i18n";

function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    function update() {
      setDiff(Math.max(0, new Date(targetDate).getTime() - Date.now()));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, started: diff === 0 };
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[52px]">
      <span className="font-[var(--font-cormorant)] font-semibold text-[34px] text-[#e3c685] leading-none tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="font-[var(--font-hanken)] text-[9px] uppercase tracking-widest text-[rgba(251,249,243,0.5)] mt-0.5">
        {label}
      </span>
    </div>
  );
}

export default function SeminarHero({ dict, lang }: { dict: Dictionary["events"]; lang: Locale }) {
  const { days, hours, minutes, seconds, started } = useCountdown(seminar.dateStart + "T00:00:00");

  return (
    <div className="rounded-[16px] overflow-hidden bg-[#3c4a37] flex flex-col md:flex-row">
      {/* Texte ~64% */}
      <div className="flex-1 p-7 md:p-10 flex flex-col justify-center">
        {/* Badge */}
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 border border-[rgba(138,47,41,0.6)] text-[#fbf9f3] bg-[rgba(138,47,41,0.25)] text-[10.5px] font-bold tracking-widest uppercase font-[var(--font-hanken)] px-3 py-1.5 rounded-[4px]">
            {dict.featuredBadge}
          </span>
        </div>

        {/* Verset */}
        <p className="arabic text-[#cda350] text-[20px] mb-3 text-right">
          {seminar.arabicVerse}
        </p>

        {/* Label */}
        <p className="font-[var(--font-hanken)] text-[12px] uppercase tracking-widest text-[#cda350] font-semibold mb-2">
          {getSeminarField("label", lang)}
        </p>

        {/* Titre */}
        <h1 className="font-[var(--font-cormorant)] font-semibold text-[30px] md:text-[42px] text-[#fbf9f3] leading-tight mb-4">
          {getSeminarField("title", lang)}
        </h1>

        <p className="font-[var(--font-hanken)] text-[14.5px] text-[rgba(251,249,243,0.8)] mb-5 max-w-[480px] leading-relaxed">
          {getSeminarField("description", lang)}
        </p>

        {/* Countdown */}
        {!started && (
          <div className="mb-6">
            <p className="font-[var(--font-hanken)] text-[10.5px] uppercase tracking-widest text-[rgba(251,249,243,0.5)] font-semibold mb-3">
              {dict.countdownLabel}
            </p>
            <div className="flex items-center gap-1" dir="ltr">
              <CountUnit value={days} label={dict.days} />
              <span className="font-[var(--font-cormorant)] text-[28px] text-[rgba(251,249,243,0.3)] mb-2">:</span>
              <CountUnit value={hours} label={dict.hours} />
              <span className="font-[var(--font-cormorant)] text-[28px] text-[rgba(251,249,243,0.3)] mb-2">:</span>
              <CountUnit value={minutes} label={dict.minutes} />
              <span className="font-[var(--font-cormorant)] text-[28px] text-[rgba(251,249,243,0.3)] mb-2">:</span>
              <CountUnit value={seconds} label={dict.seconds} />
            </div>
          </div>
        )}

        {/* Chips info */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              {dict.datesLabel}
            </p>
            <p dir="ltr" className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685] text-left">
              08 → 15 Août 2026
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              {dict.registerBeforeLabel}
            </p>
            <p dir="ltr" className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685] text-left">
              20 Juillet 2026
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              {dict.placesRemainingLabel}
            </p>
            <p dir="ltr" className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685] text-left">
              {formatPlacesFraction(seminar.remainingPlaces, seminar.totalPlaces)}
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              {dict.locationLabel}
            </p>
            <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685]">
              {seminar.location}
            </p>
          </div>
          <div className="border border-[rgba(227,198,133,0.4)] rounded-[6px] px-4 py-2">
            <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#9a9483] mb-0.5">
              {dict.priceLabel}
            </p>
            <p dir="ltr" className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#e3c685] text-left">
              {seminar.price}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <Link
            href="/inscription"
            className="inline-block bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[#9e7832] transition-colors"
          >
            {dict.registerCta}
          </Link>
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Séminaire Abu Maryam TV — Inscrivez-vous : https://abumaryam.tv/inscription")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[rgba(37,211,102,0.5)] text-[#25D366] font-[var(--font-hanken)] font-semibold text-[13.5px] px-5 py-3.5 rounded-full hover:bg-[rgba(37,211,102,0.1)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.103 1.514 5.817L.057 23.882l6.22-1.432A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.494-5.28-1.366l-.38-.225-3.692.85.895-3.576-.246-.394A9.931 9.931 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {dict.shareWhatsapp}
          </a>
        </div>
        <p className="mt-2 font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.55)]">
          {getSeminarField("targetAudience", lang)}
        </p>
      </div>

      {/* Photo ~36% */}
      <div className="relative md:w-[36%] min-h-[200px] md:min-h-0">
        <Image
          src="/images/seminaire-jeunes-filles.jpeg"
          alt="Flyer du séminaire — Devenez des femmes vouées à Allah"
          fill
          sizes="(min-width: 768px) 36vw, 100vw"
          className="object-contain p-3"
        />
      </div>
    </div>
  );
}
