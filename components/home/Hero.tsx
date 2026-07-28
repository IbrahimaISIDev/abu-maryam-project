import Link from "@/components/ui/LocalizedLink";
import Image from "next/image";
import LiveDot from "@/components/ui/LiveDot";
import type { Dictionary } from "@/dictionaries/types";

export default function Hero({ dict }: { dict: Dictionary["home"] }) {
  return (
    <section className="relative h-[400px] md:h-[560px] overflow-hidden">
      {/* Image de fond */}
      <Image
        src="/images/oustaz-niang-mbaye1.jpeg"
        alt="Oustaz Niang Mbaye (H.A) en prêche"
        fill
        sizes="100vw"
        priority
        className="object-cover"
        style={{ objectPosition: "75% 15%", filter: "saturate(0.55) sepia(0.18) contrast(1.05)" }}
      />

      {/* Voile olive — unifie la photo avec la palette du site */}
      <div className="absolute inset-0 bg-[#3c4a37] mix-blend-multiply opacity-40" />

      {/* Dégradé sombre pour la lisibilité du texte */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(28,34,22,.92) 36%, rgba(28,34,22,.55) 68%, rgba(28,34,22,.25) 100%)",
        }}
      />

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10">
        <div className="max-w-[760px]">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(205,163,80,0.4)] bg-[rgba(181,138,60,0.16)]">
            <LiveDot />
            <span className="font-[var(--font-hanken)] text-[12.5px] font-medium text-[#e3c685]">
              {dict.liveBadge}
            </span>
          </div>

          {/* Verset arabe */}
          <p className="arabic text-[#cda350] text-[20px] md:text-[23px] mb-4 rtl:text-right ltr:text-left">
            العلم نورٌ يهدي القلوب
          </p>

          {/* Titre H1 */}
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[33px] md:text-[62px] leading-[1.05] text-[#fbf9f3] mb-4 md:mb-5">
            {dict.heroTitleLine1}<br className="hidden md:block" /> {dict.heroTitleLine2}
          </h1>

          {/* Paragraphe */}
          <p className="font-[var(--font-hanken)] text-[15px] md:text-[17px] text-[rgba(251,249,243,0.8)] max-w-[540px] mb-6 md:mb-8 leading-relaxed">
            {dict.heroParagraph}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              href="/en-direct"
              className="flex items-center gap-2 bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-6 py-3 rounded-full hover:bg-[#9e7832] transition-colors w-full sm:w-auto justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {dict.watchLive}
            </Link>
            <Link
              href="/bibliotheque"
              className="flex items-center justify-center gap-2 border-2 border-[#fbf9f3] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-6 py-3 rounded-full hover:bg-[rgba(251,249,243,0.1)] transition-colors w-full sm:w-auto"
            >
              {dict.exploreTeachings}
            </Link>
            <Link
              href="/inscription"
              className="hidden md:inline-flex items-center gap-1 font-[var(--font-hanken)] text-[14px] text-[rgba(251,249,243,0.85)] underline underline-offset-4 hover:text-[#fbf9f3] transition-colors"
            >
              {dict.joinSeminar}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
