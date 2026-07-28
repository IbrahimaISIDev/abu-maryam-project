"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import { useDictionary } from "@/contexts/DictionaryContext";
import { formatNoResultsFor } from "@/lib/format";
import { teachings } from "@/data/teachings";
import { seriesList } from "@/data/series";
import { agendaItems } from "@/data/events";

const THEME_LABELS: Record<string, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
};

type ResultType = "enseignement" | "serie" | "evenement";

interface Result {
  type: ResultType;
  id: string;
  label: string;
  sub: string;
  href: string;
}

const TYPE_ICON: Record<ResultType, string> = {
  enseignement: "▶",
  serie: "☰",
  evenement: "📅",
};

function search(q: string): Result[] {
  if (!q.trim() || q.length < 2) return [];
  const lq = q.toLowerCase();

  const teachingResults: Result[] = teachings
    .filter((t) => t.title.toLowerCase().includes(lq) || t.theme.toLowerCase().includes(lq))
    .slice(0, 5)
    .map((t) => ({
      type: "enseignement" as const,
      id: t.id,
      label: t.title,
      sub: `${t.type === "video" ? "Vidéo" : "Audio"} · ${THEME_LABELS[t.theme] ?? t.theme} · ${t.duration}`,
      href: `/bibliotheque/${t.id}`,
    }));

  const seriesResults: Result[] = seriesList
    .filter((s) => s.title.toLowerCase().includes(lq) || s.theme.toLowerCase().includes(lq))
    .slice(0, 3)
    .map((s) => ({
      type: "serie" as const,
      id: s.id,
      label: s.title,
      sub: `Série · ${s.totalEpisodes} épisodes`,
      href: "/bibliotheque?tab=series",
    }));

  const eventResults: Result[] = agendaItems
    .filter((e) => e.title.toLowerCase().includes(lq) || e.location.toLowerCase().includes(lq))
    .slice(0, 3)
    .map((e) => ({
      type: "evenement" as const,
      id: e.id,
      label: e.title,
      sub: e.location,
      href: "/evenements",
    }));

  return [...teachingResults, ...seriesResults, ...eventResults];
}

export default function PublicSearch() {
  const { isOpen, query, setQuery, selected, setSelected, closeSearch, toggleSearch } = useSearch();
  const { dict, lang } = useDictionary();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => search(query), [query]);

  const TYPE_LABELS: Record<ResultType, string> = {
    enseignement: dict.search.groups.teachings,
    serie: dict.search.groups.series,
    evenement: dict.search.groups.events,
  };

  function goTo(href: string) {
    router.push(`/${lang}${href}`);
    closeSearch();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(0);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
      if (e.key === "Escape") closeSearch();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggleSearch, closeSearch]);

  // Pose le focus à l'ouverture — effet de synchronisation avec le DOM,
  // aucun setState ici (la réinitialisation vit dans SearchContext, au
  // plus près du déclencheur).
  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [isOpen]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) {
      goTo(results[selected].href);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-[rgba(35,42,32,0.55)] backdrop-blur-sm"
      onClick={closeSearch}
    >
      <div
        className="w-full max-w-[560px] bg-[#fbf9f3] dark:bg-[#20261b] rounded-[16px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2dac9] dark:border-[#3a4132]">
          <svg className="text-[#9a9483] dark:text-[#8f8973] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={dict.search.placeholder}
            className="flex-1 bg-transparent font-[var(--font-hanken)] text-[15px] text-[#232a20] dark:text-[#f2ede0] placeholder:text-[#9a9483] dark:placeholder:text-[#8f8973] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-[#e9e3d4] dark:bg-[#2b3326] rounded text-[11px] font-[var(--font-hanken)] text-[#9a9483] dark:text-[#8f8973]">
            Esc
          </kbd>
        </div>

        {/* Résultats */}
        {results.length > 0 ? (
          <ul className="py-2 max-h-[360px] overflow-y-auto">
            {(() => {
              let lastType: ResultType | "" = "";
              return results.map((r, i) => {
                const showGroup = r.type !== lastType;
                lastType = r.type;
                return (
                  <li key={`${r.type}-${r.id}`}>
                    {showGroup && (
                      <p className="px-5 pt-3 pb-1 font-[var(--font-hanken)] text-[10.5px] uppercase tracking-widest font-semibold text-[#9a9483] dark:text-[#8f8973]">
                        {TYPE_LABELS[r.type]}
                      </p>
                    )}
                    <button
                      onClick={() => goTo(r.href)}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${i === selected ? "bg-[#f0ece3] dark:bg-[rgba(255,255,255,0.05)]" : "hover:bg-[#f5f1e8] dark:hover:bg-[rgba(255,255,255,0.03)]"}`}
                    >
                      <div className="w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 text-[12px] bg-[#3c4a37] text-[#cda350]">
                        {TYPE_ICON[r.type]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20] dark:text-[#f2ede0] truncate">{r.label}</p>
                        <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] dark:text-[#8f8973] truncate">{r.sub}</p>
                      </div>
                    </button>
                  </li>
                );
              });
            })()}
          </ul>
        ) : query.length >= 2 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] dark:text-[#8f8973]">{formatNoResultsFor(query, lang)}</p>
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] dark:text-[#8f8973] text-center">
              {dict.search.minChars}
            </p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#e2dac9] dark:border-[#3a4132] flex items-center gap-4">
          <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] dark:text-[#8f8973]">↑↓ {dict.search.navigate}</span>
          <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] dark:text-[#8f8973]">↵ {dict.search.open}</span>
          <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] dark:text-[#8f8973]">Esc {dict.search.close}</span>
        </div>
      </div>
    </div>
  );
}
