"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { teachings } from "@/data/teachings";
import type { Registration } from "@/lib/types";

const THEME_LABELS: Record<string, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
};

interface Result {
  type: "enseignement" | "inscription";
  id: string;
  label: string;
  sub: string;
  href: string;
}

function search(q: string, registrations: Registration[]): Result[] {
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
      href: "/admin/enseignements",
    }));

  const regResults: Result[] = registrations
    .filter((r) => r.fullName.toLowerCase().includes(lq) || r.email.toLowerCase().includes(lq) || r.city.toLowerCase().includes(lq))
    .slice(0, 5)
    .map((r) => ({
      type: "inscription" as const,
      id: r.id,
      label: r.fullName,
      sub: `${r.city} · ${r.email}`,
      href: "/admin/inscriptions",
    }));

  return [...teachingResults, ...regResults];
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => search(query, registrations), [query, registrations]);

  // Recharge les inscriptions réelles à chaque ouverture — la recherche
  // portait jusqu'ici sur le jeu de données mock, désormais déconnecté
  // du panneau Inscriptions et des soumissions du formulaire public.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/inscription")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { registrations: Registration[] }) => {
        if (!cancelled) setRegistrations(data.registrations);
      })
      .catch(() => {
        // silencieux : la recherche reste utilisable sur les enseignements
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(0);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!open) {
          setQuery("");
          setSelected(0);
        }
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Focus de l'input à l'ouverture — effet de synchronisation avec le DOM, pas de setState ici
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) {
      router.push(results[selected].href);
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-[rgba(35,42,32,0.55)] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[560px] mx-4 bg-[#fbf9f3] rounded-[16px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e2dac9]">
          <svg className="text-[#9a9483] shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Rechercher un enseignement, un inscrit…"
            className="flex-1 bg-transparent font-[var(--font-hanken)] text-[15px] text-[#232a20] placeholder:text-[#9a9483] outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-[#e9e3d4] rounded text-[11px] font-[var(--font-hanken)] text-[#9a9483]">
            Esc
          </kbd>
        </div>

        {/* Résultats */}
        {results.length > 0 ? (
          <ul className="py-2 max-h-[360px] overflow-y-auto">
            {(() => {
              let lastType = "";
              return results.map((r, i) => {
                const showGroup = r.type !== lastType;
                lastType = r.type;
                return (
                  <li key={r.id}>
                    {showGroup && (
                      <p className="px-5 pt-3 pb-1 font-[var(--font-hanken)] text-[10.5px] uppercase tracking-widest font-semibold text-[#9a9483]">
                        {r.type === "enseignement" ? "Enseignements" : "Inscriptions"}
                      </p>
                    )}
                    <button
                      onClick={() => { router.push(r.href); setOpen(false); }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${i === selected ? "bg-[#f0ece3]" : "hover:bg-[#f5f1e8]"}`}
                    >
                      <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 text-[12px] ${r.type === "enseignement" ? "bg-[#3c4a37] text-[#cda350]" : "bg-[#e9e3d4] text-[#6f7363]"}`}>
                        {r.type === "enseignement" ? "▶" : r.label.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20] truncate">{r.label}</p>
                        <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] truncate">{r.sub}</p>
                      </div>
                    </button>
                  </li>
                );
              });
            })()}
          </ul>
        ) : query.length >= 2 ? (
          <div className="px-5 py-8 text-center">
            <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucun résultat pour « {query} »</p>
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] text-center">
              Tapez au moins 2 caractères pour rechercher
            </p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#e2dac9] flex items-center gap-4">
          <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">↑↓ naviguer</span>
          <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">↵ ouvrir</span>
          <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">Esc fermer</span>
        </div>
      </div>
    </div>
  );
}
