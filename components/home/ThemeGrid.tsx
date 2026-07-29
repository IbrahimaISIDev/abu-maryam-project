import Link from "@/components/ui/LocalizedLink";
import { themes } from "@/data/themes";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { formatCoursesCount, formatThemeLabel } from "@/lib/format";

export default function ThemeGrid({ dict, lang }: { dict: Dictionary["home"]; lang: Locale }) {
  return (
    <section>
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0] mb-5 text-center">
        {dict.themeGridTitle}
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {themes.map((theme) => (
          <Link
            key={theme.id}
            href={`/bibliotheque?theme=${theme.id}`}
            className="flex flex-col items-center gap-2 p-4 bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[9px] hover:border-[#b58a3c] hover:shadow-sm transition-all group"
          >
            {/* Icône ronde */}
            <div className="w-[46px] h-[46px] rounded-full bg-[#eef0e6] dark:bg-[#242b1e] flex items-center justify-center group-hover:bg-[rgba(181,138,60,0.12)] transition-colors">
              <span className="arabic text-[#3c4a37] dark:text-[#a9c19a] text-[20px] leading-none">
                {theme.arabicLetter}
              </span>
            </div>

            <span className="font-[var(--font-hanken)] font-semibold text-[13px] text-[#232a20] dark:text-[#f2ede0] text-center">
              {formatThemeLabel(theme.id, lang)}
            </span>
            <span className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] dark:text-[#8f8973]">
              {formatCoursesCount(theme.count, lang)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
