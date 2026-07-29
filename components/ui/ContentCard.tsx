import type { Teaching } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { formatContentLanguage, formatThemeLabel } from "@/lib/format";
import { getTeachingTitle } from "@/lib/content-i18n";
import Badge from "./Badge";
import ImagePlaceholder from "./ImagePlaceholder";

interface ContentCardProps {
  teaching: Teaching;
  size?: "default" | "compact";
  progressPercent?: number;
  completed?: boolean;
  lang?: Locale;
}

const typeIcon = { video: "▶", audio: "♪" };

export default function ContentCard({ teaching, size = "default", progressPercent, completed, lang = "fr" }: ContentCardProps) {
  const typeLabel = lang === "ar" ? { video: "فيديو", audio: "صوت" } : { video: "Vidéo", audio: "Audio" };
  const watchedLabel = lang === "ar" ? "تمت المشاهدة" : "Vu";
  const thumbH = size === "compact" ? "h-[110px]" : "h-[148px]";

  return (
    <div className="group bg-[#fbf9f3] dark:bg-[#20261b] rounded-[9px] overflow-hidden border border-[#e2dac9] dark:border-[#3a4132] hover:border-[#d8d0bf] dark:hover:border-[#454c3c] transition-colors cursor-pointer">
      {/* Miniature */}
      <div className={`relative ${thumbH} overflow-hidden`}>
        <ImagePlaceholder className="w-full h-full" theme={teaching.theme} />

        {/* Badge thème haut-gauche */}
        <div className="absolute top-2 left-2">
          <Badge theme={teaching.theme} lang={lang} />
        </div>

        {/* Badge durée bas-droit */}
        <div className="absolute bottom-2 right-2 bg-[rgba(28,34,22,0.80)] text-[#fbf9f3] text-[10.5px] font-semibold px-1.5 py-0.5 rounded-[4px] font-[var(--font-hanken)] tabular-nums">
          {teaching.duration}
        </div>

        {/* Icône play au survol */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-[rgba(251,249,243,0.92)] flex items-center justify-center text-[#3c4a37] text-lg">
            {teaching.type === "video" ? "▶" : "♪"}
          </div>
        </div>

        {/* Badge Vu */}
        {completed && (
          <div className="absolute top-2 right-2 bg-[#3c4a37] text-[#cda350] text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full font-[var(--font-hanken)]">
            ✓ {watchedLabel}
          </div>
        )}

        {/* Barre progression */}
        {!completed && progressPercent !== undefined && progressPercent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[rgba(0,0,0,0.25)]">
            <div
              className="h-full bg-[#b58a3c]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Méta */}
      <div className="p-3">
        <p className="text-[11.5px] font-medium text-[#b58a3c] dark:text-[#e3c685] font-[var(--font-hanken)] mb-1">
          {typeIcon[teaching.type]} {typeLabel[teaching.type]} · {formatContentLanguage(teaching.language, lang)}
        </p>
        <h3 className="text-[19px] font-semibold text-[#232a20] dark:text-[#f2ede0] leading-tight font-[var(--font-cormorant)] line-clamp-2">
          {getTeachingTitle(teaching, lang)}
        </h3>
        {size === "default" && (
          <p className="mt-1 text-[11px] text-[#9a9483] dark:text-[#8f8973] font-[var(--font-hanken)]">
            {formatThemeLabel(teaching.theme, lang)}
          </p>
        )}
      </div>
    </div>
  );
}
