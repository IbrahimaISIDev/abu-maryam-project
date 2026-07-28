"use client";

import { useState } from "react";
import Link from "@/components/ui/LocalizedLink";
import { agendaItems } from "@/data/events";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { formatUntilDate, formatEventCta } from "@/lib/format";
import { getAgendaItemTitle } from "@/lib/content-i18n";

export default function AgendaList({ dict, lang }: { dict: Dictionary["events"]; lang: Locale }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const filtered = agendaItems.filter((e) =>
    tab === "upcoming" ? e.isUpcoming : !e.isUpcoming
  );

  const parseDate = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return { month: dict.monthsShort[m - 1], day, year: y };
  };

  return (
    <section>
      {/* Titre + toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0]">
          {dict.agendaTitle}
        </h2>
        <div className="flex gap-1 p-1 bg-[#e9e3d4] dark:bg-[#242b1e] rounded-full">
          <button
            onClick={() => setTab("upcoming")}
            className={`px-4 py-2 rounded-full font-[var(--font-hanken)] text-[13px] font-medium transition-colors ${
              tab === "upcoming"
                ? "bg-[#3c4a37] text-[#fbf9f3]"
                : "text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a]"
            }`}
          >
            {dict.tabUpcoming}
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-4 py-2 rounded-full font-[var(--font-hanken)] text-[13px] font-medium transition-colors ${
              tab === "past"
                ? "bg-[#3c4a37] text-[#fbf9f3]"
                : "text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a]"
            }`}
          >
            {dict.tabPast}
          </button>
        </div>
      </div>

      {/* Liste */}
      <ul className="space-y-3">
        {filtered.map((item) => {
          const d = parseDate(item.dateStart);
          return (
            <li
              key={item.id}
              className={`bg-[#fbf9f3] dark:bg-[#20261b] border rounded-[13px] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 p-5 ${
                item.isFeatured ? "border-[#b58a3c]" : "border-[#e2dac9] dark:border-[#3a4132]"
              }`}
            >
              {/* Bloc date */}
              <div className="text-center shrink-0 sm:w-[80px]">
                <p className="font-[var(--font-hanken)] text-[11px] font-semibold uppercase text-[#9a9483] dark:text-[#8f8973]">
                  {d.month}
                </p>
                <p className="font-[var(--font-cormorant)] font-semibold text-[38px] text-[#232a20] dark:text-[#f2ede0] leading-none">
                  {d.day}
                </p>
                <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] dark:text-[#8f8973]">
                  {d.year}
                </p>
              </div>

              {/* Séparateur vertical */}
              <div className="hidden sm:block w-px h-14 bg-[#e2dac9] dark:bg-[#3a4132] mx-5 shrink-0" />

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-hanken)] text-[11.5px] font-semibold uppercase tracking-widest text-[#b58a3c] dark:text-[#e3c685] mb-1">
                  {dict.typeLabels[item.type as keyof typeof dict.typeLabels] ?? item.type}
                </p>
                <h3 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] dark:text-[#f2ede0] leading-tight">
                  {getAgendaItemTitle(item.id, item.title, lang)}
                </h3>
                <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483] dark:text-[#8f8973] mt-1">
                  📍 {item.location}
                  {item.dateEnd && ` · ${formatUntilDate(parseDate(item.dateEnd).day, parseDate(item.dateEnd).month, lang)}`}
                </p>
              </div>

              {/* Bouton action */}
              {item.ctaLabel && item.isUpcoming && (
                <div className="shrink-0">
                  <Link
                    href={item.type === "séminaire" ? "/inscription" : "/en-direct"}
                    className={`inline-block font-[var(--font-hanken)] font-semibold text-[13px] px-5 py-2.5 rounded-full transition-colors ${
                      item.isFeatured
                        ? "bg-[#b58a3c] text-[#fbf9f3] hover:bg-[#9e7832]"
                        : "border border-[#d8d0bf] dark:border-[#454c3c] text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c]"
                    }`}
                  >
                    {formatEventCta(item.ctaLabel, lang)}
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
