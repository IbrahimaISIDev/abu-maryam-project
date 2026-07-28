"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import FilterPanel from "./FilterPanel";
import SeriesCard from "./SeriesCard";
import ContentCard from "@/components/ui/ContentCard";
import { teachings } from "@/data/teachings";
import { seriesList } from "@/data/series";
import { useProgress } from "@/hooks/useProgress";
import type { ContentType, Theme, Language } from "@/lib/types";

const PAGE_SIZE = 9;
const CATALOGUE_TOTAL = teachings.length;
const ALL_THEMES = ["tafsir", "tawhid", "akhlaq", "salat", "famille", "sunna", "sahaba", "khoutba", "conférence"] as const;
const ALL_LANGUAGES = ["wolof", "arabe"] as const;

const sortOptions = [
  { value: "recent", label: "Plus récents" },
  { value: "oldest", label: "Plus anciens" },
];

type Tab = "cours" | "series";

export default function BibliothequeCatalogue() {
  const { getProgress } = useProgress();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
  const [transitioning, setTransitioning] = useState(false);

  // Garde l'URL synchronisée avec les filtres — permet de partager ou recharger une recherche précise
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== "cours") params.set("tab", tab);
    if (query.trim()) params.set("q", query.trim());
    if (sort !== "recent") params.set("sort", sort);
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedThemes.length) params.set("themes", selectedThemes.join(","));
    if (selectedLanguages.length) params.set("langs", selectedLanguages.join(","));
    if (page !== 1) params.set("page", String(page));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [tab, query, sort, selectedType, selectedThemes, selectedLanguages, page, pathname]);

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
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (sort === "oldest") return [...list].reverse();
    return list;
  }, [selectedType, selectedThemes, selectedLanguages, query, sort]);

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
  }, []);

  return (
    <>
      {/* Bandeau entête */}
      <div className="bg-[#e9e3d4] dark:bg-[#242b1e] px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-[1280px] mx-auto">
          <p className="arabic text-[#b58a3c] dark:text-[#e3c685] text-[18px] mb-2 text-right">
            خزانة العلم
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[30px] md:text-[42px] text-[#232a20] dark:text-[#f2ede0] mb-1.5">
            Bibliothèque des enseignements
          </h1>
          <p className="font-[var(--font-hanken)] text-[14px] text-[#6f7363] dark:text-[#b7b2a0] mb-6">
            {CATALOGUE_TOTAL} enseignements · Tafsir, conférences, khoutbas, séries de cours — à suivre à votre rythme.
          </p>

          {/* Onglets Cours / Séries */}
          <div className="flex items-center gap-1 bg-[#ddd8cc] dark:bg-[#2b3326] rounded-full p-1 w-fit mb-6">
            {(["cours", "series"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full font-[var(--font-hanken)] text-[13.5px] font-semibold transition-colors ${
                  tab === t
                    ? "bg-[#fbf9f3] dark:bg-[#20261b] text-[#232a20] dark:text-[#f2ede0] shadow-sm"
                    : "text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3f463a] dark:hover:text-[#d8d4c4]"
                }`}
              >
                {t === "cours" ? `Cours · ${CATALOGUE_TOTAL}` : `Séries · ${seriesList.length}`}
              </button>
            ))}
          </div>

          {/* Recherche + tri — visible uniquement sur l'onglet Cours */}
          {tab === "cours" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9483] dark:text-[#8f8973]"
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
                  placeholder="Rechercher un cours, une sourate, un thème…"
                  className="w-full pl-10 pr-4 py-3 bg-[#fbf9f3] dark:bg-[#20261b] border border-[#d8d0bf] dark:border-[#454c3c] rounded-full text-[14px] font-[var(--font-hanken)] text-[#232a20] dark:text-[#f2ede0] placeholder:text-[#9a9483] dark:placeholder:text-[#8f8973] focus:outline-none focus:border-[#b58a3c] focus:ring-1 focus:ring-[#b58a3c]"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-3 bg-[#fbf9f3] dark:bg-[#20261b] border border-[#d8d0bf] dark:border-[#454c3c] rounded-full text-[14px] font-[var(--font-hanken)] text-[#3f463a] dark:text-[#d8d4c4] focus:outline-none focus:border-[#b58a3c] cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    Trier : {o.label}
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
            <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] dark:text-[#8f8973] mb-6">
              Des parcours structurés pour approfondir un thème, verset par verset, étape par étape.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {seriesList.map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          </div>
        )}

        {/* ——— ONGLET COURS ——— */}
        {tab === "cours" && (
          <>
            {/* Mobile : pills de filtre rapide */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 -mx-5 px-5">
              {(["all", "video", "audio"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setPage(1); }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-[var(--font-hanken)] font-medium border transition-colors ${
                    selectedType === type
                      ? "bg-[#3c4a37] text-[#fbf9f3] border-[#3c4a37]"
                      : "bg-[#fbf9f3] dark:bg-[#20261b] text-[#3f463a] dark:text-[#d8d4c4] border-[#d8d0bf] dark:border-[#454c3c]"
                  }`}
                >
                  {type === "all" ? `Tout · ${counts.total}` : type === "video" ? "▶ Vidéo" : "♪ Audio"}
                </button>
              ))}
            </div>

            <div className="flex gap-8">
              {/* Filtres — desktop */}
              <div className="hidden md:block w-[248px] shrink-0">
                <FilterPanel
                  selectedType={selectedType}
                  selectedThemes={selectedThemes}
                  selectedLanguages={selectedLanguages}
                  onTypeChange={(t) => { setSelectedType(t); setPage(1); }}
                  onThemeToggle={(t) => { toggleTheme(t); setPage(1); }}
                  onLanguageToggle={(l) => { toggleLang(l); setPage(1); }}
                  counts={counts}
                  themeCounts={themeCounts}
                />
              </div>

              {/* Grille */}
              <div className="flex-1 min-w-0">
                {paginated.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-[var(--font-cormorant)] text-[24px] text-[#9a9483] dark:text-[#8f8973] mb-4">
                      Aucun résultat trouvé
                    </p>
                    <button
                      onClick={resetFilters}
                      className="font-[var(--font-hanken)] text-[13.5px] font-medium text-[#b58a3c] dark:text-[#e3c685] hover:text-[#9e7832] dark:hover:text-[#cda350] transition-colors underline underline-offset-4"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] dark:text-[#8f8973] mb-4">
                      {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
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
                              <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block" aria-label={`${t.title} — ${t.duration}`}>
                                <ContentCard
                                  teaching={t}
                                  progressPercent={pct}
                                  completed={prog?.completed}
                                />
                              </Link>
                            );
                          })}
                    </div>

                    {totalPages > 1 && (
                      <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
                        <button
                          onClick={() => page > 1 && goToPage(page - 1)}
                          disabled={page === 1}
                          className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium border border-[#e2dac9] dark:border-[#3a4132] bg-[#fbf9f3] dark:bg-[#20261b] text-[#6f7363] dark:text-[#b7b2a0] hover:border-[#b58a3c] hover:text-[#b58a3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Page précédente"
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium transition-colors ${
                              p === page
                                ? "bg-[#3c4a37] text-[#fbf9f3]"
                                : "bg-[#fbf9f3] dark:bg-[#20261b] text-[#6f7363] dark:text-[#b7b2a0] border border-[#e2dac9] dark:border-[#3a4132] hover:border-[#b58a3c] hover:text-[#b58a3c]"
                            }`}
                            aria-current={p === page ? "page" : undefined}
                            aria-label={`Page ${p}`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => page < totalPages && goToPage(page + 1)}
                          disabled={page === totalPages}
                          className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium border border-[#e2dac9] dark:border-[#3a4132] bg-[#fbf9f3] dark:bg-[#20261b] text-[#6f7363] dark:text-[#b7b2a0] hover:border-[#b58a3c] hover:text-[#b58a3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Page suivante"
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
