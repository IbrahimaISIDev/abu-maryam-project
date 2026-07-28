import Link from "@/components/ui/LocalizedLink";
import { teachings } from "@/data/teachings";
import ContentCard from "@/components/ui/ContentCard";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";

export default function TeachingsGrid({ dict, lang }: { dict: Dictionary["home"]; lang: Locale }) {
  const latest = teachings.slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0]">
          {dict.teachingsGridTitle}
        </h2>
        <Link
          href="/bibliotheque"
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#b58a3c] dark:text-[#e3c685] hover:text-[#9e7832] dark:hover:text-[#cda350] underline underline-offset-4 transition-colors hidden md:inline"
        >
          {dict.viewAll}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[22px]">
        {latest.map((t) => (
          <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block">
            <ContentCard teaching={t} lang={lang} />
          </Link>
        ))}
      </div>

      <div className="mt-4 md:hidden text-center">
        <Link
          href="/bibliotheque"
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#b58a3c] dark:text-[#e3c685] underline underline-offset-4"
        >
          {dict.viewAll}
        </Link>
      </div>
    </section>
  );
}
