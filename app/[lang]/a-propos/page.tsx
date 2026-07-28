import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez Oustaz Niang Mbaye (H.A) et la mission d'Abu Maryam TV : diffuser le savoir islamique authentique selon la compréhension des Salaf.",
  openGraph: {
    title: "À propos | Abu Maryam TV",
    description:
      "La mission d'Abu Maryam TV : rendre le savoir islamique authentique accessible à tous, en wolof et en arabe.",
  },
};
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "@/components/ui/LocalizedLink";
import SocialIcon from "@/components/ui/SocialIcon";
import { teachings } from "@/data/teachings";
import { socialLinks } from "@/data/socials";
import { getDictionary } from "@/dictionaries";
import { formatAboutCtaParagraph, formatSocialLabel } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

const topics = [
  {
    title: "Vie conjugale et médiation familiale",
    desc: "Il est très connu pour ses conférences et ses séances de conseils sur les relations de couple (nèègu seuy en wolof). Il aborde régulièrement les causes de l'instabilité dans les ménages et propose des solutions inspirées des préceptes islamiques, notamment à travers des thèmes comme « Trois principes qui résolvent tous les problèmes conjugaux ».",
  },
  {
    title: "Éducation et spiritualité",
    desc: "Il anime des sessions d'exhortation religieuse, de récitation du Coran et d'invocations, notamment lors de séances matinales (après le Fadjr).",
  },
  {
    title: "Présence numérique",
    desc: "Il diffuse ses enseignements à travers sa chaîne officielle (Oustaz Niang Mbaye TV officiel) et collabore fréquemment avec des plateformes et émissions axées sur la promotion de la Sunnah au Sénégal (comme l'émission Ettu Sunnah).",
  },
];

const values = [
  {
    numAr: "١",
    title: "Authenticité",
    desc: "Enseigner uniquement ce qui est établi par le Qur'an et la Sunna selon la compréhension des Salaf.",
  },
  {
    numAr: "٢",
    title: "Clarté",
    desc: "Transmettre des savoirs complexes avec un langage simple et accessible à tous les niveaux.",
  },
  {
    numAr: "٣",
    title: "Accessibilité",
    desc: "Des cours en wolof et en arabe, disponibles gratuitement à tout moment.",
  },
  {
    numAr: "٤",
    title: "Sérénité",
    desc: "Créer un espace de paix spirituelle et d'élévation du cœur vers Allah.",
  },
];

export default async function AProposPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.nav.about} />

      <main id="main-content" className="pb-20 md:pb-0">
        {/* Héro profil */}
        <div className="bg-[#e9e3d4] dark:bg-[#242b1e]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8 md:py-12">
            <div className="flex flex-col md:grid md:grid-cols-[420px_1fr] gap-8 md:gap-10 items-start">
              {/* Portrait */}
              <div className="w-full md:w-auto">
                <div className="relative rounded-[16px] overflow-hidden min-h-[280px] md:min-h-[420px] border border-[#e2dac9] dark:border-[#3a4132]">
                  <Image
                    src="/images/oustaz-niang-mbaye1.jpeg"
                    alt="Portrait d'Oustaz Niang Mbaye (H.A)"
                    fill
                    sizes="(min-width: 768px) 420px, 100vw"
                    className="object-cover"
                    style={{ filter: "saturate(0.78) sepia(0.08) contrast(1.02)" }}
                    priority
                  />
                  <div className="absolute inset-0 bg-[#3c4a37] mix-blend-multiply opacity-[0.08]" />
                </div>
              </div>

              {/* Texte */}
              <div className="flex flex-col justify-center">
                <p className="arabic text-[#b58a3c] dark:text-[#e3c685] text-[18px] text-right mb-3">
                  طلب العلم فريضة
                </p>
                <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] md:text-[48px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-2">
                  Oustaz Niang Mbaye{" "}
                  <span className="font-[var(--font-hanken)] font-normal text-[24px] md:text-[28px] text-[#6f7363] dark:text-[#b7b2a0]">(H.A)</span>
                </h1>
                <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] dark:text-[#b7b2a0] mb-5">
                  Imam · Prédicateur du Qur&apos;an et de la Sunna
                </p>
                <p className="font-[var(--font-hanken)] text-[14.5px] text-[#3f463a] dark:text-[#d8d4c4] leading-relaxed mb-8 max-w-[520px]">
                  Oustaz Niang Mbaye est un conférencier et prêcheur islamique sénégalais,
                  particulièrement suivi pour ses interventions médiatiques et ses séminaires
                  religieux axés sur la famille, l&apos;éducation et la société.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: String(teachings.length), label: dict.about.statTeachings },
                    { value: "18", sub: dict.about.statYearsSuffix, label: dict.about.statYearsLabel },
                    { value: "2", label: dict.about.statLanguages },
                  ].map((stat, i) => (
                    <div key={i} className="text-center md:text-left">
                      <p className="font-[var(--font-cormorant)] font-semibold text-[34px] md:text-[40px] text-[#232a20] dark:text-[#f2ede0] leading-none">
                        {stat.value}
                        {stat.sub && (
                          <span className="font-[var(--font-hanken)] text-[18px] text-[#6f7363] dark:text-[#b7b2a0] ml-1">
                            {stat.sub}
                          </span>
                        )}
                      </p>
                      <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] dark:text-[#8f8973] mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 md:px-10 space-y-12 md:space-y-14 py-10 md:py-14">
          {/* Mission */}
          <section className="text-center max-w-[780px] mx-auto">
            <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#9a9483] dark:text-[#8f8973] font-semibold mb-3">
              {dict.about.mission}
            </p>
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[26px] md:text-[36px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-5">
              Rendre le savoir islamique accessible, authentique et porteur de sérénité
            </h2>
            <p className="arabic text-[#b58a3c] dark:text-[#e3c685] text-[20px]">
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            </p>
          </section>

          {/* Domaines d'intervention */}
          <section>
            <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#9a9483] dark:text-[#8f8973] font-semibold mb-3 text-center">
              {dict.about.domains}
            </p>
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[24px] md:text-[30px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-8 text-center max-w-[780px] mx-auto">
              Ses interventions et programmes se concentrent principalement sur plusieurs thématiques majeures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topics.map((t) => (
                <div
                  key={t.title}
                  className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] p-6 flex flex-col gap-3"
                >
                  <h3 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20] dark:text-[#f2ede0] leading-snug">
                    {t.title}
                  </h3>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Réseaux sociaux */}
          <section className="text-center">
            <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#9a9483] dark:text-[#8f8973] font-semibold mb-3">
              {dict.about.followTitle}
            </p>
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[24px] md:text-[30px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-8">
              {dict.about.followSubtitle}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-3 rounded-full border border-[#e2dac9] dark:border-[#3a4132] bg-[#fbf9f3] dark:bg-[#20261b] font-[var(--font-hanken)] font-semibold text-[14px] text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
                >
                  <SocialIcon id={s.id} className="w-[18px] h-[18px]" />
                  {formatSocialLabel(s.id, s.label, lang)}
                </a>
              ))}
            </div>
          </section>

          {/* 4 valeurs */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {values.map((v) => (
                <div
                  key={v.numAr}
                  className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] p-6 flex flex-col gap-3"
                >
                  <span className="arabic text-[#3c4a37] dark:text-[#a9c19a] text-[28px] leading-none font-bold">{v.numAr}</span>
                  <h3 className="font-[var(--font-cormorant)] font-semibold text-[21px] text-[#232a20] dark:text-[#f2ede0]">
                    {v.title}
                  </h3>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA final */}
          <section className="rounded-[10px] bg-[#3c4a37] px-6 py-10 md:px-12 md:py-12 text-center">
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[26px] md:text-[34px] text-[#fbf9f3] mb-3">
              {dict.about.ctaTitle}
            </h2>
            <p className="font-[var(--font-hanken)] text-[14px] text-[rgba(251,249,243,0.75)] max-w-[440px] mx-auto mb-7 leading-relaxed">
              {formatAboutCtaParagraph(teachings.length, lang)}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/bibliotheque"
                className="bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[#9e7832] transition-colors"
              >
                {dict.home.exploreLibrary}
              </Link>
              <Link
                href="/evenements"
                className="border-2 border-[#fbf9f3] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[rgba(251,249,243,0.1)] transition-colors"
              >
                {dict.home.viewEvents}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
