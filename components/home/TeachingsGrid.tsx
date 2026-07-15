import Link from "next/link";
import { teachings } from "@/data/teachings";
import ContentCard from "@/components/ui/ContentCard";

export default function TeachingsGrid() {
  const latest = teachings.slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20]">
          Derniers enseignements
        </h2>
        <Link
          href="/bibliotheque"
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#b58a3c] hover:text-[#9e7832] underline underline-offset-4 transition-colors hidden md:inline"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[22px]">
        {latest.map((t) => (
          <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block">
            <ContentCard teaching={t} />
          </Link>
        ))}
      </div>

      <div className="mt-4 md:hidden text-center">
        <Link
          href="/bibliotheque"
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#b58a3c] underline underline-offset-4"
        >
          Voir tout →
        </Link>
      </div>
    </section>
  );
}
