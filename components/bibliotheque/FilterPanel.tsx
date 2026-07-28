"use client";

import type { ContentType, Theme, Language } from "@/lib/types";
import GlossaryTerm from "@/components/ui/GlossaryTerm";

interface FilterPanelProps {
  selectedType: ContentType | "all";
  selectedThemes: Theme[];
  selectedLanguages: Language[];
  onTypeChange: (t: ContentType | "all") => void;
  onThemeToggle: (t: Theme) => void;
  onLanguageToggle: (l: Language) => void;
  counts: { total: number; video: number; audio: number };
  themeCounts: Partial<Record<Theme, number>>;
}

const themes: { id: Theme; label: string }[] = [
  { id: "tafsir",     label: "Tafsîr" },
  { id: "tawhid",     label: "Tawhîd" },
  { id: "akhlaq",     label: "Akhlâq" },
  { id: "salat",      label: "Salât" },
  { id: "famille",    label: "Famille" },
  { id: "sunna",      label: "Sunna" },
  { id: "sahaba",     label: "Sahaba" },
  { id: "khoutba",    label: "Khoutba" },
  { id: "conférence", label: "Conférence" },
];

const languages: { id: Language; label: string }[] = [
  { id: "wolof",    label: "Wolof" },
  { id: "arabe",    label: "Arabe" },
  { id: "français", label: "Français" },
];

export default function FilterPanel({
  selectedType, selectedThemes, selectedLanguages,
  onTypeChange, onThemeToggle, onLanguageToggle,
  counts, themeCounts,
}: FilterPanelProps) {
  return (
    <aside className="w-full">
      <h2 className="font-[var(--font-hanken)] font-semibold text-[15px] text-[#232a20] mb-5">
        Filtrer
      </h2>

      {/* TYPE */}
      <div className="mb-6">
        <p className="font-[var(--font-hanken)] text-[11px] font-semibold tracking-widest uppercase text-[#9a9483] mb-3">
          Type
        </p>
        <ul className="space-y-2">
          {(
            [
              { value: "all", label: "Tout", count: counts.total },
              { value: "video", label: "▶ Vidéo", count: counts.video },
              { value: "audio", label: "♪ Audio", count: counts.audio },
            ] as const
          ).map(({ value, label, count }) => (
            <li key={value}>
              <label className="flex items-center justify-between gap-2 cursor-pointer group">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedType === value
                        ? "border-[#3c4a37] bg-[#3c4a37]"
                        : "border-[#d8d0bf] group-hover:border-[#3c4a37]"
                    }`}
                  >
                    {selectedType === value && (
                      <span className="w-2 h-2 rounded-full bg-[#fbf9f3]" />
                    )}
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={selectedType === value}
                    onChange={() => onTypeChange(value as ContentType | "all")}
                    aria-label={label}
                  />
                  <span className="font-[var(--font-hanken)] text-[14px] text-[#3f463a]">
                    {label}
                  </span>
                </span>
                <span className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
                  {count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* THÈMES */}
      <div className="mb-6">
        <p className="font-[var(--font-hanken)] text-[11px] font-semibold tracking-widest uppercase text-[#9a9483] mb-3">
          Thèmes
        </p>
        <ul className="space-y-2">
          {themes.map(({ id, label }) => {
            const checked = selectedThemes.includes(id);
            const count = themeCounts[id] ?? 0;
            return (
              <li key={id} className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? "border-[#3c4a37] bg-[#3c4a37]"
                        : "border-[#d8d0bf] group-hover:border-[#3c4a37]"
                    }`}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#fbf9f3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => onThemeToggle(id)}
                    aria-label={label}
                  />
                  <span className="font-[var(--font-hanken)] text-[14px] text-[#3f463a] truncate">
                    {label}
                  </span>
                </label>
                <span className="flex items-center gap-1.5 shrink-0">
                  <GlossaryTerm
                    term={id}
                    className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-[var(--font-hanken)] font-bold text-[#9a9483] hover:text-[#b58a3c] hover:border-[#b58a3c]"
                  >
                    ?
                  </GlossaryTerm>
                  <span className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
                    {count}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* LANGUE */}
      <div>
        <p className="font-[var(--font-hanken)] text-[11px] font-semibold tracking-widest uppercase text-[#9a9483] mb-3">
          Langue
        </p>
        <div className="flex flex-wrap gap-2">
          {languages.map(({ id, label }) => {
            const active = selectedLanguages.includes(id);
            return (
              <button
                key={id}
                onClick={() => onLanguageToggle(id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-[var(--font-hanken)] font-medium transition-colors border ${
                  active
                    ? "bg-[#3c4a37] text-[#fbf9f3] border-[#3c4a37]"
                    : "bg-transparent text-[#3f463a] border-[#d8d0bf] hover:border-[#3c4a37]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
