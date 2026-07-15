"use client";

import type { ContentType, Theme, Language } from "@/lib/types";

interface FilterPanelProps {
  selectedType: ContentType | "all";
  selectedThemes: Theme[];
  selectedLanguages: Language[];
  onTypeChange: (t: ContentType | "all") => void;
  onThemeToggle: (t: Theme) => void;
  onLanguageToggle: (l: Language) => void;
  counts: { total: number; video: number; audio: number };
}

const themes: { id: Theme; label: string; count: number }[] = [
  { id: "tafsir", label: "Tafsîr", count: 84 },
  { id: "tawhid", label: "Tawhîd", count: 68 },
  { id: "akhlaq", label: "Akhlâq", count: 55 },
  { id: "salat",  label: "Salât",  count: 42 },
  { id: "famille",label: "Famille",count: 38 },
  { id: "sunna",  label: "Sunna",  count: 73 },
];

const languages: { id: Language; label: string }[] = [
  { id: "wolof",    label: "Wolof" },
  { id: "arabe",    label: "Arabe" },
  { id: "français", label: "Français" },
];

export default function FilterPanel({
  selectedType, selectedThemes, selectedLanguages,
  onTypeChange, onThemeToggle, onLanguageToggle,
  counts,
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
          {themes.map(({ id, label, count }) => {
            const checked = selectedThemes.includes(id);
            return (
              <li key={id}>
                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center transition-colors ${
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
                    <span className="font-[var(--font-hanken)] text-[14px] text-[#3f463a]">
                      {label}
                    </span>
                  </span>
                  <span className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
                    {count}
                  </span>
                </label>
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
