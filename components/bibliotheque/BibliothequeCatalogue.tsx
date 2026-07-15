"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import FilterPanel from "./FilterPanel";
import SeriesCard from "./SeriesCard";
import ContentCard from "@/components/ui/ContentCard";
import { teachings } from "@/data/teachings";
import { seriesList } from "@/data/series";
import { useProgress } from "@/hooks/useProgress";
import type { ContentType, Theme, Language } from "@/lib/types";

const PAGE_SIZE = 9;
const CATALOGUE_TOTAL = 320;

const sortOptions = [
  { value: "recent", label: "Plus récents" },
  { value: "oldest", label: "Plus anciens" },
];

type Tab = "cours" | "series";

export default function BibliothequeCatalogue() {
  const { getProgress } = useProgress();
  const [tab, setTab] = useState<Tab>("cours");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedType, setSelectedType] = useState<ContentType | "all">("all");
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [page, setPage] = useState(1);

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

  return (
    <>
      {/* Bandeau entête */}
      <div className="bg-[#e9e3d4] px-5 md:px-10 py-8 md:py-10">
        <div className="max-w-[1280px] mx-auto">
          <p className="arabic text-[#b58a3c] text-[18px] mb-2 text-right">
            خزانة العلم
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[30px] md:text-[42px] text-[#232a20] mb-1.5">
            Bibliothèque des enseignements
          </h1>
          <p className="font-[var(--font-hanken)] text-[14px] text-[#6f7363] mb-6">
            {CATALOGUE_TOTAL}+ enseignements · Tafsir, conférences, khoutbas, séries de cours — à suivre à votre rythme.
          </p>

          {/* Onglets Cours / Séries */}
          <div className="flex items-center gap-1 bg-[#ddd8cc] rounded-full p-1 w-fit mb-6">
            {(["cours", "series"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full font-[var(--font-hanken)] text-[13.5px] font-semibold transition-colors ${
                  tab === t
                    ? "bg-[#fbf9f3] text-[#232a20] shadow-sm"
                    : "text-[#6f7363] hover:text-[#3f463a]"
                }`}
              >
                {t === "cours" ? `Cours · ${CATALOGUE_TOTAL}+` : `Séries · ${seriesList.length}`}
              </button>
            ))}
          </div>

          {/* Recherche + tri — visible uniquement sur l'onglet Cours */}
          {tab === "cours" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9483]"
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
                  className="w-full pl-10 pr-4 py-3 bg-[#fbf9f3] border border-[#d8d0bf] rounded-full text-[14px] font-[var(--font-hanken)] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c] focus:ring-1 focus:ring-[#b58a3c]"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-3 bg-[#fbf9f3] border border-[#d8d0bf] rounded-full text-[14px] font-[var(--font-hanken)] text-[#3f463a] focus:outline-none focus:border-[#b58a3c] cursor-pointer"
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
            <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] mb-6">
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
                      : "bg-[#fbf9f3] text-[#3f463a] border-[#d8d0bf]"
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
                />
              </div>

              {/* Grille */}
              <div className="flex-1 min-w-0">
                {paginated.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-[var(--font-cormorant)] text-[24px] text-[#9a9483]">
                      Aucun résultat trouvé
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] mb-4">
                      {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-[22px]">
                      {paginated.map((t) => {
                        const prog = getProgress(t.id);
                        const pct = prog
                          ? Math.round((prog.positionSeconds / (t.durationSeconds || 1)) * 100)
                          : undefined;
                        return (
                          <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block">
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
                      <div className="flex items-center justify-center gap-2 mt-8">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-[34px] h-[34px] rounded-full flex items-center justify-center font-[var(--font-hanken)] text-[13px] font-medium transition-colors ${
                              p === page
                                ? "bg-[#3c4a37] text-[#fbf9f3]"
                                : "bg-[#fbf9f3] text-[#6f7363] border border-[#e2dac9] hover:border-[#b58a3c] hover:text-[#b58a3c]"
                            }`}
                            aria-current={p === page ? "page" : undefined}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
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
