import Link from "@/components/ui/LocalizedLink";
import type { Series, Teaching } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { formatContentLanguage, formatThemeLabel } from "@/lib/format";
import { getSeriesTitle, getSeriesDescription } from "@/lib/content-i18n";
import SeriesProgress from "./SeriesProgress";

const themeColor: Record<string, { bg: string; text: string }> = {
  tafsir:   { bg: "bg-[#eef0e6] dark:bg-[rgba(95,112,80,0.18)]", text: "text-[#5f7050] dark:text-[#8fa781]" },
  tawhid:   { bg: "bg-[rgba(181,138,60,0.1)] dark:bg-[rgba(205,163,80,0.18)]", text: "text-[#7d5f26] dark:text-[#e3c685]" },
  sahaba:   { bg: "bg-[rgba(138,47,41,0.08)] dark:bg-[rgba(224,139,129,0.18)]", text: "text-[#8a2f29] dark:text-[#e08b81]" },
  akhlaq:   { bg: "bg-[#eef0e6] dark:bg-[rgba(95,112,80,0.18)]", text: "text-[#5f7050] dark:text-[#8fa781]" },
  sunna:    { bg: "bg-[rgba(181,138,60,0.1)] dark:bg-[rgba(205,163,80,0.18)]", text: "text-[#7d5f26] dark:text-[#e3c685]" },
  famille:  { bg: "bg-[rgba(138,47,41,0.08)] dark:bg-[rgba(224,139,129,0.18)]", text: "text-[#8a2f29] dark:text-[#e08b81]" },
  salat:    { bg: "bg-[#eef0e6] dark:bg-[rgba(95,112,80,0.18)]", text: "text-[#5f7050] dark:text-[#8fa781]" },
  khoutba:  { bg: "bg-[rgba(181,138,60,0.1)] dark:bg-[rgba(205,163,80,0.18)]", text: "text-[#7d5f26] dark:text-[#e3c685]" },
  conférence: { bg: "bg-[rgba(138,47,41,0.08)] dark:bg-[rgba(224,139,129,0.18)]", text: "text-[#8a2f29] dark:text-[#e08b81]" },
  rappel:   { bg: "bg-[rgba(181,138,60,0.1)] dark:bg-[rgba(205,163,80,0.18)]", text: "text-[#7d5f26] dark:text-[#e3c685]" },
};

interface SeriesCardProps {
  series: Series;
  episodes: Teaching[];
  lang: Locale;
}

export default function SeriesCard({ series, episodes, lang }: SeriesCardProps) {
  const firstEp = episodes[0];
  const href = firstEp ? `/bibliotheque/${firstEp.id}` : "/bibliotheque";
  const colors = themeColor[series.theme] ?? { bg: "bg-[#eef0e6] dark:bg-[rgba(95,112,80,0.18)]", text: "text-[#5f7050] dark:text-[#8fa781]" };

  return (
    <Link href={href} className="group block">
      <div className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[12px] overflow-hidden hover:border-[#d8d0bf] dark:hover:border-[#454c3c] hover:shadow-sm transition-all">
        {/* Tête de carte — olive foncé */}
        <div className="relative bg-[#3c4a37] px-5 pt-5 pb-6 min-h-[120px] flex flex-col justify-between">
          {/* Verset arabe */}
          {series.arabicVerse && (
            <p className="arabic text-[#cda350] text-[16px] text-right leading-relaxed mb-2">
              {series.arabicVerse}
            </p>
          )}

          {/* Nombre d'épisodes — pastille bas-droite */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 bg-[rgba(251,249,243,0.12)] rounded-full px-2.5 py-1">
            <span className="text-[#fbf9f3] opacity-60 text-[11px]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            </span>
            <span className="font-[var(--font-hanken)] text-[11px] font-semibold text-[#fbf9f3] opacity-80">
              <span dir="ltr" className="inline-block">{episodes.length} / {series.totalEpisodes}</span>{" "}
              {lang === "ar" ? "حلقة" : "épisodes"}
            </span>
          </div>
        </div>

        {/* Corps */}
        <div className="px-5 py-4">
          {/* Badge thème */}
          <span className={`inline-block text-[10.5px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full mb-2 ${colors.bg} ${colors.text}`}>
            {formatThemeLabel(series.theme, lang)}
          </span>

          <h3 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-1.5 group-hover:text-[#3c4a37] dark:group-hover:text-[#a9c19a] transition-colors">
            {getSeriesTitle(series, lang)}
          </h3>

          <p className="font-[var(--font-hanken)] text-[12.5px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed line-clamp-2 mb-3">
            {getSeriesDescription(series, lang)}
          </p>

          <SeriesProgress episodes={episodes} variant="compact" lang={lang} />

          {/* Langue + CTA */}
          <div className="flex items-center justify-between">
            <span className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] dark:text-[#8f8973] uppercase tracking-wider">
              {formatContentLanguage(series.language, lang)}
            </span>
            <span className="font-[var(--font-hanken)] text-[12px] font-medium text-[#7d5f26] dark:text-[#e3c685] group-hover:text-[#9e7832] dark:group-hover:text-[#cda350] transition-colors">
              {lang === "ar" ? "← ابدأ" : "Commencer →"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
