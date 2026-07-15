import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import TeachingPlayer from "@/components/bibliotheque/TeachingPlayer";
import ShareButtons from "@/components/bibliotheque/ShareButtons";
import ContentCard from "@/components/ui/ContentCard";
import Badge from "@/components/ui/Badge";
import { getTeachingById, getSeriesEpisodes, getRelatedTeachings } from "@/data/teachings";
import { getSeriesById } from "@/data/series";
import type { Theme } from "@/lib/types";

const themeLabel: Record<string, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
};
const levelColor: Record<string, string> = {
  débutant: "text-[#5f7050] bg-[#eef0e6]",
  intermédiaire: "text-[#b58a3c] bg-[rgba(181,138,60,0.1)]",
  avancé: "text-[#8a2f29] bg-[rgba(138,47,41,0.08)]",
};

export async function generateStaticParams() {
  const { teachings } = await import("@/data/teachings");
  return teachings.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const teaching = getTeachingById(id);
  if (!teaching) return { title: "Cours introuvable" };
  return {
    title: teaching.title,
    description:
      teaching.description ??
      `Enseignement de type ${teaching.type} sur le thème ${themeLabel[teaching.theme]} — Oustaz Niang Mbaye (H.A)`,
    openGraph: {
      title: `${teaching.title} | Abu Maryam TV`,
      description: teaching.description,
      type: "video.other",
    },
  };
}

export default async function TeachingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teaching = getTeachingById(id);
  if (!teaching) notFound();

  const series = teaching.seriesId ? getSeriesById(teaching.seriesId) : null;
  const seriesEpisodes = series ? getSeriesEpisodes(series.id) : [];
  const related = getRelatedTeachings(teaching, 4);
  const publishedDate = new Date(teaching.publishedAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // JSON-LD Schema.org
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": teaching.type === "video" ? "VideoObject" : "AudioObject",
    "name": teaching.title,
    "description": teaching.description,
    "duration": `PT${teaching.durationSeconds}S`,
    "uploadDate": teaching.publishedAt,
    "author": {
      "@type": "Person",
      "name": "Oustaz Niang Mbaye (H.A)",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Abu Maryam TV",
    },
    "inLanguage": teaching.language,
    "about": {
      "@type": "Thing",
      "name": themeLabel[teaching.theme],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <MobileHeader title={teaching.title} />

      <main className="pb-24 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-6 md:py-8">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 font-[var(--font-hanken)] text-[12.5px] text-[#9a9483] mb-6">
            <Link href="/" className="hover:text-[#b58a3c] transition-colors">Accueil</Link>
            <span>›</span>
            <Link href="/bibliotheque" className="hover:text-[#b58a3c] transition-colors">Bibliothèque</Link>
            <span>›</span>
            <span className="text-[#3f463a] line-clamp-1">{teaching.title}</span>
          </nav>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Colonne principale */}
            <div className="space-y-6">
              {/* Player */}
              <TeachingPlayer teaching={teaching} />

              {/* Infos */}
              <div>
                {/* Badges méta */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge theme={teaching.theme as Theme} />
                  {teaching.level && (
                    <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${levelColor[teaching.level]}`}>
                      {teaching.level.charAt(0).toUpperCase() + teaching.level.slice(1)}
                    </span>
                  )}
                  {series && teaching.episodeNumber && (
                    <span className="text-[11px] font-medium text-[#9a9483] font-[var(--font-hanken)]">
                      Épisode {teaching.episodeNumber} / {series.totalEpisodes}
                    </span>
                  )}
                </div>

                <h1 className="font-[var(--font-cormorant)] font-semibold text-[26px] md:text-[34px] text-[#232a20] leading-tight mb-3">
                  {teaching.title}
                </h1>

                {/* Avatar + date */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#3c4a37] flex items-center justify-center shrink-0">
                    <span className="arabic text-[#cda350] text-[16px]">أ</span>
                  </div>
                  <div>
                    <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#232a20]">
                      Oustaz Niang Mbaye (H.A)
                    </p>
                    <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
                      {publishedDate} · {teaching.duration} ·{" "}
                      {teaching.language.charAt(0).toUpperCase() + teaching.language.slice(1)}
                    </p>
                  </div>
                </div>

                <hr className="border-[#e2dac9] mb-4" />

                {/* Description */}
                {teaching.description && (
                  <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] leading-relaxed mb-5">
                    {teaching.description}
                  </p>
                )}

                {/* Partage */}
                <ShareButtons
                  title={teaching.title}
                  url={`https://abumaryam.tv/bibliotheque/${teaching.id}`}
                />
              </div>

              {/* Cours liés (si pas de série) */}
              {!series && related.length > 0 && (
                <div>
                  <h2 className="font-[var(--font-cormorant)] font-semibold text-[24px] text-[#232a20] mb-4">
                    Dans le même thème
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((t) => (
                      <ContentCard key={t.id} teaching={t} size="compact" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rail latéral — Série ou Cours liés */}
            <aside className="space-y-5">
              {series && (
                <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[13px] overflow-hidden">
                  {/* En-tête série */}
                  <div className="bg-[#3c4a37] px-5 py-4">
                    {series.arabicVerse && (
                      <p className="arabic text-[#cda350] text-[14px] text-right mb-1">
                        {series.arabicVerse}
                      </p>
                    )}
                    <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#cda350] font-semibold mb-1">
                      Série · {seriesEpisodes.length} épisodes
                    </p>
                    <h3 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#fbf9f3] leading-tight">
                      {series.title}
                    </h3>
                  </div>

                  {/* Liste des épisodes */}
                  <ul className="divide-y divide-[#e2dac9]">
                    {seriesEpisodes.map((ep) => {
                      const isCurrent = ep.id === teaching.id;
                      return (
                        <li key={ep.id}>
                          <Link
                            href={`/bibliotheque/${ep.id}`}
                            className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                              isCurrent
                                ? "bg-[rgba(181,138,60,0.08)] border-l-2 border-[#b58a3c]"
                                : "hover:bg-[#f5f0e8]"
                            }`}
                          >
                            <span className={`font-[var(--font-cormorant)] text-[22px] font-semibold shrink-0 ${isCurrent ? "text-[#b58a3c]" : "text-[#d8d0bf]"}`}>
                              {ep.episodeNumber}
                            </span>
                            <div className="min-w-0">
                              <p className={`font-[var(--font-hanken)] text-[13px] font-medium leading-snug line-clamp-2 ${isCurrent ? "text-[#232a20]" : "text-[#6f7363]"}`}>
                                {ep.title}
                              </p>
                              <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] mt-0.5">
                                {ep.duration}
                              </p>
                            </div>
                            {isCurrent && (
                              <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-[#b58a3c]" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Cours suivant dans la série */}
              {series && teaching.episodeNumber && (
                (() => {
                  const next = seriesEpisodes.find(
                    (ep) => ep.episodeNumber === (teaching.episodeNumber ?? 0) + 1
                  );
                  if (!next) return null;
                  return (
                    <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[13px] p-5">
                      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#b58a3c] font-semibold mb-3">
                        Prochain épisode
                      </p>
                      <ContentCard teaching={next} size="compact" />
                    </div>
                  );
                })()
              )}

              {/* Cours liés (sidebar si série) */}
              {related.length > 0 && (
                <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[13px] p-5">
                  <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#b58a3c] font-semibold mb-3">
                    Du même thème
                  </p>
                  <ul className="space-y-3 divide-y divide-[#e2dac9]">
                    {related.slice(0, 3).map((t) => (
                      <li key={t.id} className="pt-3 first:pt-0">
                        <Link href={`/bibliotheque/${t.id}`} className="group flex gap-3 items-start">
                          <div className="w-[60px] h-[38px] rounded-[5px] overflow-hidden shrink-0 bg-[#e2dac9] flex items-center justify-center text-[#9a9483] text-[10px]">
                            {t.type === "video" ? "▶" : "♪"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] group-hover:text-[#b58a3c] leading-snug line-clamp-2 transition-colors">
                              {t.title}
                            </p>
                            <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] mt-0.5">
                              {t.duration}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
