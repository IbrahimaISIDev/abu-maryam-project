import Link from "next/link";
import type { Series } from "@/lib/types";
import { getSeriesEpisodes } from "@/data/teachings";

const themeLabel: Record<string, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
};
const themeColor: Record<string, { bg: string; text: string }> = {
  tafsir:   { bg: "bg-[#eef0e6]", text: "text-[#5f7050]" },
  tawhid:   { bg: "bg-[rgba(181,138,60,0.1)]", text: "text-[#b58a3c]" },
  sahaba:   { bg: "bg-[rgba(138,47,41,0.08)]", text: "text-[#8a2f29]" },
  akhlaq:   { bg: "bg-[#eef0e6]", text: "text-[#5f7050]" },
  sunna:    { bg: "bg-[rgba(181,138,60,0.1)]", text: "text-[#b58a3c]" },
  famille:  { bg: "bg-[rgba(138,47,41,0.08)]", text: "text-[#8a2f29]" },
  salat:    { bg: "bg-[#eef0e6]", text: "text-[#5f7050]" },
  khoutba:  { bg: "bg-[rgba(181,138,60,0.1)]", text: "text-[#b58a3c]" },
  conférence: { bg: "bg-[rgba(138,47,41,0.08)]", text: "text-[#8a2f29]" },
};

interface SeriesCardProps {
  series: Series;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const episodes = getSeriesEpisodes(series.id);
  const firstEp = episodes[0];
  const href = firstEp ? `/bibliotheque/${firstEp.id}` : "/bibliotheque";
  const colors = themeColor[series.theme] ?? { bg: "bg-[#eef0e6]", text: "text-[#5f7050]" };

  return (
    <Link href={href} className="group block">
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden hover:border-[#d8d0bf] hover:shadow-sm transition-all">
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
              {episodes.length} / {series.totalEpisodes} épisodes
            </span>
          </div>
        </div>

        {/* Corps */}
        <div className="px-5 py-4">
          {/* Badge thème */}
          <span className={`inline-block text-[10.5px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full mb-2 ${colors.bg} ${colors.text}`}>
            {themeLabel[series.theme] ?? series.theme}
          </span>

          <h3 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20] leading-tight mb-1.5 group-hover:text-[#3c4a37] transition-colors">
            {series.title}
          </h3>

          <p className="font-[var(--font-hanken)] text-[12.5px] text-[#6f7363] leading-relaxed line-clamp-2 mb-3">
            {series.description}
          </p>

          {/* Langue + CTA */}
          <div className="flex items-center justify-between">
            <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] uppercase tracking-wider">
              {series.language}
            </span>
            <span className="font-[var(--font-hanken)] text-[12px] font-medium text-[#b58a3c] group-hover:text-[#9e7832] transition-colors">
              Commencer →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
