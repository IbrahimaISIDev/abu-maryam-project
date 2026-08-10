"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "@/components/ui/LocalizedLink";
import FilterPanel from "./FilterPanel";
import SeriesCard from "./SeriesCard";
import ContentCard from "@/components/ui/ContentCard";
import { useProgress } from "@/hooks/useProgress";
import type { ContentType, Theme, Language, Teaching, Series, AgendaItem } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import {
  formatLibraryCountSummary,
  formatTabCourses,
  formatTabSeries,
  formatSortLabel,
  formatResultsCount,
  formatMobileAll,
  formatPaginationPageLabel,
} from "@/lib/format";
import { getTeachingTitle, getAgendaItemTitle } from "@/lib/content-i18n";

const PAGE_SIZE = 9;
const ALL_THEMES = ["tafsir", "tawhid", "akhlaq", "salat", "famille", "sunna", "sahaba", "khoutba", "conférence", "rappel"] as const;
const ALL_LANGUAGES = ["wolof", "arabe"] as const;

type Tab = "cours" | "series";

export default function BibliothequeCatalogue({
  dict,
  lang,
  teachings,
  seriesList,
  agendaItems,
}: {
  dict: Dictionary["library"];
  lang: Locale;
  teachings: Teaching[];
  seriesList: Series[];
  agendaItems: AgendaItem[];
}) {
  const { getProgress } = useProgress();
  const CATALOGUE_TOTAL = teachings.length;
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const sortOptions = [
    { value: "recent", label: dict.sortRecent },
    { value: "oldest", label: dict.sortOldest },
  ];
  const videoAudioLabel = {
    video: lang === "ar" ? "▶ فيديو" : "▶ Vidéo",
    audio: lang === "ar" ? "♪ صوت" : "♪ Audio",
  };

  const [tab, setTab] = useState<Tab>(() => (searchParams.get("tab") === "series" ? "series" : "cours"));
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [sort, setSort] = useState(() => (searchParams.get("sort") === "oldest" ? "oldest" : "recent"));
  const [selectedType, setSelectedType] = useState<ContentType | "all">(() => {
    const t = searchParams.get("type");
    return t === "video" || t === "audio" ? t : "all";
  });
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>(() => {
    const raw = searchParams.get("themes")?.split(",") ?? [];
    return raw.filter((t): t is Theme => (ALL_THEMES as readonly string[]).includes(t));
  });
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(() => {
    const raw = searchParams.get("langs")?.split(",") ?? [];
    return raw.filter((l): l is Language => (ALL_LANGUAGES as readonly string[]).includes(l));
  });
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(() => searchParams.get("event"));
  const [transitioning, setTransitioning] = useState(false);

  const selectedEventItem = selectedEvent ? agendaItems.find((a) => a.id === selectedEvent) ?? null : null;

  // Garde l'URL synchronisée avec les filtres — permet de partager ou recharger une recherche précise
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== "cours") params.set("tab", tab);
    if (query.trim()) params.set("q", query.trim());
    if (sort !== "recent") params.set("sort", sort);
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedThemes.length) params.set("themes", selectedThemes.join(","));
    if (selectedLanguages.length) params.set("langs", selectedLanguages.join(","));
    if (selectedEvent) params.set("event", selectedEvent);
    if (page !== 1) params.set("page", String(page));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [tab, query, sort, selectedType, selectedThemes, selectedLanguages, selectedEvent, page, pathname]);

  function goToPage(p: number) {
    setTransitioning(true);
    setTimeout(() => { setPage(p); setTransitioning(false); }, 180);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFilters() {
    setQuery("");
    setSort("recent");
    setSelectedType("all");
    setSelectedThemes([]);
    setSelectedLanguages([]);
    setSelectedEvent(null);
    setPage(1);
  }

  const toggleTheme = (t: Theme) =>
    setSelectedThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const toggleLang = (l: Language) =>
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  const filtered = useMemo(() => {
    let list = teachings;
    if (selectedType !== "all") list = list.filter((t) => t.type === selectedType);
    if (selectedThemes.length) list = list.filter((t) => selectedThemes.includes(t.theme as Theme));
    if (selectedLanguages.length) list = list.filter((t) => selectedLanguages.includes(t.language as Language));
    if (selectedEvent) list = list.filter((t) => t.agendaItemId === selectedEvent);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || getTeachingTitle(t, lang).toLowerCase().includes(q)
      );
    }
    if (sort === "oldest") return [...list].reverse();
    return list;
  }, [teachings, selectedType, selectedThemes, selectedLanguages, selectedEvent, query, sort, lang]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    total: teachings.length,
    video: teachings.filter((t) => t.type === "video").length,
    audio: teachings.filter((t) => t.type === "audio").length,
  };

  const themeCounts = useMemo(() => {
    const map: Partial<Record<Theme, number>> = {};
    for (const t of teachings) map[t.theme] = (map[t.theme] ?? 0) + 1;
    return map;
  }, [teachings]);

  const eventOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of teachings) {
      if (!t.agendaItemId) continue;
      counts.set(t.agendaItemId, (counts.get(t.agendaItemId) ?? 0) + 1);
    }
    return agendaItems
      .filter((a) => counts.has(a.id))
      .map((a) => ({ id: a.id, label: getAgendaItemTitle(a.id, a.title, lang), count: counts.get(a.id)! }))
      .sort((a, b) => b.count - a.count);
  }, [teachings, agendaItems, lang]);

  return (
    <>
      {/* Bandeau entête */}
      <div className="bg-[#e9e3d4] dark:bg-[#242b1e] px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-[1280px] mx-auto">
          <p className="arabic text-[#b58a3c] dark:text-[#e3c685] text-[18px] mb-2 text-right">
            خزانة العلم
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[30px] md:text-[42px] text-[#232a20] dark:text-[#f2ede0] mb-1.5">
            {dict.title}
          </h1>
          <p className="font-[var(--font-hanken)] text-[14px] text-[#6f7363] dark:text-[#b7b2a0] mb-6">
            {formatLibraryCountSummary(CATALOGUE_TOTAL, lang)}
          </p>

          {/* Onglets Cours / Séries */}
          <div className="flex items-center gap-1 bg-[#ddd8cc] dark:bg-[#2b3326] rounded-full p-1 w-fit mb-6">
            {(["cours", "series"] as Tab[]).map((t) => (
              <button type="button"
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full font-[var(--font-hanken)] text-[13.5px] font-semibold transition-colors ${
                  tab === t
                    ? "bg-[#fbf9f3] dark:bg-[#20261b] text-[#232a20] dark:text-[#f2ede0] shadow-sm"
                    : "text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3f463a] dark:hover:text-[#d8d4c4]"
                }`}
              >
                {t === "cours" ? formatTabCourses(CATALOGUE_TOTAL, lang) : formatTabSeries(seriesList.length, lang)}
              </button>
            ))}
          </div>

          {/* Recherche + tri — visible uniquement sur l'onglet Cours */}
          {tab === "cours" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6f7363] dark:text-[#8f8973]"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder={dict.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-[#fbf9f3] dark:bg-[#20261b] border border-[#d8d0bf] dark:border-[#454c3c] rounded-full text-[14px] font-[var(--font-hanken)] text-[#232a20] dark:text-[#f2ede0] placeholder:text-[#6f7363] dark:placeholder:text-[#8f8973] focus:outline-none focus:border-[#b58a3c] focus:ring-1 focus:ring-[#b58a3c]"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-3 bg-[#fbf9f3] dark:bg-[#20261b] border border-[#d8d0bf] dark:border-[#454c3c] rounded-full text-[14px] font-[var(--font-hanken)] text-[#3f463a] dark:text-[#d8d4c4] focus:outline-none focus:border-[#b58a3c] cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {formatSortLabel(o.label, lang)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Corps */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8">

        {/* ——— ONGLET SÉRIES ——— */}
        {tab === "series" && (
          <div>
            <p className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#8f8973] mb-6">
              {dict.seriesIntro}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {seriesList.map((s) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  episodes={teachings
                    .filter((t) => t.seriesId === s.id)
                    .sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0))}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        )}

        {/* ——— ONGLET COURS ——— */}
        {tab === "cours" && (
          <>
            {selectedEventItem && (
              <div className="flex items-center gap-2 mb-4">
                <span className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#8f8973]">
                  {lang === "ar" ? "مُصنّف حسب:" : "Filtré par :"}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelectedEvent(null); setPage(1); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3c4a37] text-[#fbf9f3] font-[var(--font-hanken)] text-[12.5px] font-medium hover:bg-[#2d3829] transition-colors"
                >
                  {selectedEventItem.title}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile : pills de filtre rapide */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 -mx-5 px-5">
              {(["all", "video", "audio"] as const).map((type) => (
                <button type="button"
                  key={type}
                  onClick={() => { setSelectedType(type); setPage(1); }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-[var(--font-hanken)] font-medium border transition-colors ${
                    selectedType === type
                      ? "bg-[#3c4a37] text-[#fbf9f3] border-[#3c4a37]"
                      : "bg-[#fbf9f3] dark:bg-[#20261b] text-[#3f463a] dark:text-[#d8d4c4] border-[#d8d0bf] dark:border-[#454c3c]"
                  }`}
                >
                  {type === "all" ? formatMobileAll(counts.total, lang) : videoAudioLabel[type]}
                </button>
              ))}
            </div>

            <div className="flex gap-8">
              {/* Filtres — desktop */}
              <div className="hidden md:block w-[248px] shrink-0">
                <FilterPanel
                  dict={dict}
                  lang={lang}
                  selectedType={selectedType}
                  selectedThemes={selectedThemes}
                  selectedLanguages={selectedLanguages}
                  selectedEvent={selectedEvent}
                  onTypeChange={(t) => { setSelectedType(t); setPage(1); }}
                  onThemeToggle={(t) => { toggleTheme(t); setPage(1); }}
                  onLanguageToggle={(l) => { toggleLang(l); setPage(1); }}
                  onEventChange={(id) => { setSelectedEvent(id); setPage(1); }}
                  counts={counts}
                  themeCounts={themeCounts}
                  eventOptions={eventOptions}
                />
              </div>

              {/* Grille */}
              <div className="flex-1 min-w-0">
                {paginated.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-[var(--font-cormorant)] text-[24px] text-[#6f7363] dark:text-[#8f8973] mb-4">
                      {dict.noResults}
                    </p>
                    <button type="button"
                      onClick={resetFilters}
                      className="font-[var(--font-hanken)] text-[13.5px] font-medium text-[#7d5f26] dark:text-[#e3c685] hover:text-[#9e7832] dark:hover:text-[#cda350] transition-colors underline underline-offset-4"
                    >
                      {dict.resetFilters}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#8f8973] mb-4">
                      {formatResultsCount(filtered.length, lang)}
                    </p>
                    <div
                      className={`grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[22px] transition-opacity duration-200 ${transitioning ? "opacity-0" : "opacity-100"}`}
                      aria-live="polite"
                      aria-busy={transitioning}
                    >
                      {transitioning
                        ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <div key={i} className="rounded-[12px] bg-[#e9e3d4] dark:bg-[#242b1e] animate-pulse aspect-[3/4]" />
                          ))
                        : paginated.map((t) => {
                            const prog = getProgress(t.id);
                            const pct = prog
                              ? Math.round((prog.positionSeconds / (t.durationSeconds || 1)) * 100)
                              : undefined;
                            return (
                              <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block" aria-label={`${getTeachingTitle(t, lang)} — ${t.duration}`}>
                                <ContentCard
                                  teaching={t}
                                  progressPercent={pct}
                                  completed={prog?.completed}
                                  lang={lang}
                                />
                              </Link>
                            );
                          })}
                    </div>

                    {totalPages > 1 && (
                      <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
                        <button type="button"
                          onClick={() => page > 1 && goToPage(page - 1)}
                          disabled={page === 1}
                          className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium border border-[#e2dac9] dark:border-[#3a4132] bg-[#fbf9f3] dark:bg-[#20261b] text-[#6f7363] dark:text-[#b7b2a0] hover:border-[#b58a3c] hover:text-[#b58a3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label={dict.paginationPrev}
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button type="button"
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium transition-colors ${
                              p === page
                                ? "bg-[#3c4a37] text-[#fbf9f3]"
                                : "bg-[#fbf9f3] dark:bg-[#20261b] text-[#6f7363] dark:text-[#b7b2a0] border border-[#e2dac9] dark:border-[#3a4132] hover:border-[#b58a3c] hover:text-[#b58a3c]"
                            }`}
                            aria-current={p === page ? "page" : undefined}
                            aria-label={formatPaginationPageLabel(p, lang)}
                          >
                            {p}
                          </button>
                        ))}
                        <button type="button"
                          onClick={() => page < totalPages && goToPage(page + 1)}
                          disabled={page === totalPages}
                          className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium border border-[#e2dac9] dark:border-[#3a4132] bg-[#fbf9f3] dark:bg-[#20261b] text-[#6f7363] dark:text-[#b7b2a0] hover:border-[#b58a3c] hover:text-[#b58a3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label={dict.paginationNext}
                        >
                          ›
                        </button>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
