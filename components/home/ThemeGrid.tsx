import Link from "next/link";
import { themes } from "@/data/themes";

export default function ThemeGrid() {
  return (
    <section>
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] mb-5 text-center">
        Explorer par thème
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
        {themes.map((theme) => (
          <Link
            key={theme.id}
            href={`/bibliotheque?theme=${theme.id}`}
            className="flex flex-col items-center gap-2 p-4 bg-[#fbf9f3] border border-[#e2dac9] rounded-[9px] hover:border-[#b58a3c] hover:shadow-sm transition-all group"
          >
            {/* Icône ronde */}
            <div className="w-[46px] h-[46px] rounded-full bg-[#eef0e6] flex items-center justify-center group-hover:bg-[rgba(181,138,60,0.12)] transition-colors">
              <span className="arabic text-[#3c4a37] text-[20px] leading-none">
                {theme.arabicLetter}
              </span>
            </div>

            <span className="font-[var(--font-hanken)] font-semibold text-[13px] text-[#232a20] text-center">
              {theme.labelFr}
            </span>
            <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">
              {theme.count} cours
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
