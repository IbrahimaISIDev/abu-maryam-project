"use client";

import { useState } from "react";
import Link from "@/components/ui/LocalizedLink";
import ContentCard from "@/components/ui/ContentCard";
import type { AgendaItem, Replay, Teaching } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { formatUntilDate, formatEventCta, formatLocation } from "@/lib/format";
import { getAgendaItemTitle } from "@/lib/content-i18n";
import { computeAgendaStatus } from "@/lib/activities";
import { buildYoutubeWatchUrl } from "@/lib/youtube";

const GRID_PREVIEW_LIMIT = 6;

export default function AgendaList({
  dict,
  lang,
  agendaItems,
  replays = [],
  teachings = [],
}: {
  dict: Dictionary["events"];
  lang: Locale;
  agendaItems: AgendaItem[];
  replays?: Replay[];
  teachings?: Teaching[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const filtered = agendaItems.filter((e) => {
    const status = computeAgendaStatus(e);
    return tab === "upcoming" ? status !== "past" : status === "past";
  });
  const sorted = dir === "asc" ? filtered : [...filtered].reverse();

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
          <button type="button"
            onClick={() => setTab("upcoming")}
            className={`px-4 py-2 rounded-full font-[var(--font-hanken)] text-[13px] font-medium transition-colors ${
              tab === "upcoming"
                ? "bg-[#3c4a37] text-[#fbf9f3]"
                : "text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a]"
            }`}
          >
            {dict.tabUpcoming}
          </button>
          <button type="button"
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

      {/* Tri */}
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-1.5 font-[var(--font-hanken)] text-[12px] font-medium text-[#6f7363] dark:text-[#8f8973] hover:text-[#3f463a] dark:hover:text-[#d8d4c4] transition-colors"
        >
          <span>
            {dir === "asc"
              ? lang === "ar" ? "الأقرب ← الأبعد" : "Plus proche → plus lointain"
              : lang === "ar" ? "الأبعد ← الأقرب" : "Plus lointain → plus proche"}
          </span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${dir === "desc" ? "rotate-180" : ""}`}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>

      {/* Liste */}
      <ul className="space-y-3">
        {sorted.map((item) => {
          const d = parseDate(item.dateStart);
          const eventTeachings = teachings.filter((t) => t.agendaItemId === item.id);
          const preview = eventTeachings.slice(0, GRID_PREVIEW_LIMIT);
          return (
            <li
              key={item.id}
              className={`bg-[#fbf9f3] dark:bg-[#20261b] border rounded-[13px] p-5 ${
                item.isFeatured ? "border-[#b58a3c]" : "border-[#e2dac9] dark:border-[#3a4132]"
              }`}
            >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
              {/* Bloc date */}
              <div className="text-center shrink-0 sm:w-[80px]">
                <p className="font-[var(--font-hanken)] text-[11px] font-semibold uppercase text-[#6f7363] dark:text-[#8f8973]">
                  {d.month}
                </p>
                <p className="font-[var(--font-cormorant)] font-semibold text-[38px] text-[#232a20] dark:text-[#f2ede0] leading-none">
                  {d.day}
                </p>
                <p className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] dark:text-[#8f8973]">
                  {d.year}
                </p>
              </div>

              {/* Séparateur vertical */}
              <div className="hidden sm:block w-px h-14 bg-[#e2dac9] dark:bg-[#3a4132] mx-5 shrink-0" />

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-hanken)] text-[11.5px] font-semibold uppercase tracking-widest text-[#7d5f26] dark:text-[#e3c685] mb-1">
                  {dict.typeLabels[item.type as keyof typeof dict.typeLabels] ?? item.type}
                </p>
                <h3 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] dark:text-[#f2ede0] leading-tight">
                  {getAgendaItemTitle(item.id, item.title, lang)}
                </h3>
                <p className="font-[var(--font-hanken)] text-[12.5px] text-[#6f7363] dark:text-[#8f8973] mt-1">
                  📍 {formatLocation(item.location, lang)}
                  {item.dateEnd && ` · ${formatUntilDate(parseDate(item.dateEnd).day, parseDate(item.dateEnd).month, lang)}`}
                </p>
                {eventTeachings.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 mt-2 font-[var(--font-hanken)] text-[11.5px] font-semibold text-[#b58a3c]">
                    🎬 {lang === "ar" ? `${eventTeachings.length} فيديو` : `${eventTeachings.length} vidéo${eventTeachings.length > 1 ? "s" : ""}`}
                  </span>
                )}
              </div>

              {/* Bouton action */}
              {item.ctaLabel && computeAgendaStatus(item) !== "past" && (
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

              {/* Lien replay — événements passés reliés à un replay YouTube */}
              {computeAgendaStatus(item) === "past" && item.replayId && (() => {
                const replay = replays.find((r) => r.id === item.replayId);
                if (!replay?.youtubeId) return null;
                return (
                  <div className="shrink-0">
                    <a
                      href={buildYoutubeWatchUrl(replay.youtubeId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block font-[var(--font-hanken)] font-semibold text-[13px] px-5 py-2.5 rounded-full border border-[#d8d0bf] dark:border-[#454c3c] text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
                    >
                      {dict.watchReplay}
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Vidéos rattachées à cet événement */}
            {preview.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[#e2dac9] dark:border-[#3a4132]">
                <p className="font-[var(--font-hanken)] text-[12px] font-semibold uppercase tracking-widest text-[#7d5f26] dark:text-[#e3c685] mb-3">
                  {lang === "ar" ? "فيديوهات هذا الحدث" : "Vidéos de cet événement"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                  {preview.map((t) => (
                    <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block">
                      <ContentCard teaching={t} lang={lang} />
                    </Link>
                  ))}
                  {eventTeachings.length > preview.length && (
                    <Link
                      href={`/bibliotheque?event=${item.id}`}
                      className="flex flex-col items-center justify-center gap-1.5 h-[148px] rounded-[9px] border border-dashed border-[#d8d0bf] dark:border-[#454c3c] text-[#7d5f26] dark:text-[#e3c685] hover:border-[#b58a3c] hover:bg-[rgba(181,138,60,0.05)] transition-colors"
                    >
                      <span className="font-[var(--font-cormorant)] font-semibold text-[28px] leading-none">
                        +{eventTeachings.length - preview.length}
                      </span>
                      <span className="font-[var(--font-hanken)] text-[12px] font-medium">
                        {lang === "ar" ? "عرض الكل ←" : "Voir tout →"}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
