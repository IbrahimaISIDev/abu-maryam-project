"use client";

import type { ContentType, Theme, Language } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import GlossaryTerm from "@/components/ui/GlossaryTerm";
import { formatThemeLabel } from "@/lib/format";

interface FilterPanelProps {
  dict: Dictionary["library"];
  lang: Locale;
  selectedType: ContentType | "all";
  selectedThemes: Theme[];
  selectedLanguages: Language[];
  onTypeChange: (t: ContentType | "all") => void;
  onThemeToggle: (t: Theme) => void;
  onLanguageToggle: (l: Language) => void;
  counts: { total: number; video: number; audio: number };
  themeCounts: Partial<Record<Theme, number>>;
}

const themeIds: Theme[] = ["tafsir", "tawhid", "akhlaq", "salat", "famille", "sunna", "sahaba", "khoutba", "conférence"];

export default function FilterPanel({
  dict, lang,
  selectedType, selectedThemes, selectedLanguages,
  onTypeChange, onThemeToggle, onLanguageToggle,
  counts, themeCounts,
}: FilterPanelProps) {
  const languages: { id: Language; label: string }[] = [
    { id: "wolof", label: dict.languageWolof },
    { id: "arabe", label: dict.languageArabic },
  ];
  const themes: { id: Theme; label: string }[] = themeIds.map((id) => ({ id, label: formatThemeLabel(id, lang) }));

  return (
    <aside className="w-full">
      <h2 className="font-[var(--font-hanken)] font-semibold text-[15px] text-[#232a20] dark:text-[#f2ede0] mb-5">
        {dict.filterTitle}
      </h2>

      {/* TYPE */}
      <div className="mb-6">
        <p className="font-[var(--font-hanken)] text-[11px] font-semibold tracking-widest uppercase text-[#6f7363] dark:text-[#8f8973] mb-3">
          {dict.filterTypeLabel}
        </p>
        <ul className="space-y-2">
          {(
            [
              { value: "all", label: dict.filterAll, count: counts.total },
              { value: "video", label: lang === "ar" ? "▶ فيديو" : "▶ Vidéo", count: counts.video },
              { value: "audio", label: lang === "ar" ? "♪ صوت" : "♪ Audio", count: counts.audio },
            ] as const
          ).map(({ value, label, count }) => (
            <li key={value}>
              <label className="flex items-center justify-between gap-2 cursor-pointer group">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedType === value
                        ? "border-[#3c4a37] bg-[#3c4a37]"
                        : "border-[#d8d0bf] dark:border-[#454c3c] group-hover:border-[#3c4a37]"
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
                  <span className="font-[var(--font-hanken)] text-[14px] text-[#3f463a] dark:text-[#d8d4c4]">
                    {label}
                  </span>
                </span>
                <span className="font-[var(--font-hanken)] text-[12px] text-[#6f7363] dark:text-[#8f8973]">
                  {count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* THÈMES */}
      <div className="mb-6">
        <p className="font-[var(--font-hanken)] text-[11px] font-semibold tracking-widest uppercase text-[#6f7363] dark:text-[#8f8973] mb-3">
          {dict.filterThemesLabel}
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
                        : "border-[#d8d0bf] dark:border-[#454c3c] group-hover:border-[#3c4a37]"
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
                  <span className="font-[var(--font-hanken)] text-[14px] text-[#3f463a] dark:text-[#d8d4c4] truncate">
                    {label}
                  </span>
                </label>
                <span className="flex items-center gap-1.5 shrink-0">
                  <GlossaryTerm
                    term={id}
                    lang={lang}
                    className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-[var(--font-hanken)] font-bold text-[#6f7363] dark:text-[#8f8973] hover:text-[#b58a3c] hover:border-[#b58a3c]"
                  >
                    ?
                  </GlossaryTerm>
                  <span className="font-[var(--font-hanken)] text-[12px] text-[#6f7363] dark:text-[#8f8973]">
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
        <p className="font-[var(--font-hanken)] text-[11px] font-semibold tracking-widest uppercase text-[#6f7363] dark:text-[#8f8973] mb-3">
          {dict.filterLanguageLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {languages.map(({ id, label }) => {
            const active = selectedLanguages.includes(id);
            return (
              <button type="button"
                key={id}
                onClick={() => onLanguageToggle(id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-[var(--font-hanken)] font-medium transition-colors border ${
                  active
                    ? "bg-[#3c4a37] text-[#fbf9f3] border-[#3c4a37]"
                    : "bg-transparent text-[#3f463a] dark:text-[#d8d4c4] border-[#d8d0bf] dark:border-[#454c3c] hover:border-[#3c4a37]"
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
