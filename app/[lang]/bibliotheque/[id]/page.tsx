import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "@/components/ui/LocalizedLink";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import TeachingPlayer from "@/components/bibliotheque/TeachingPlayer";
import SeriesProgress from "@/components/bibliotheque/SeriesProgress";
import ShareButtons from "@/components/bibliotheque/ShareButtons";
import ContentCard from "@/components/ui/ContentCard";
import Badge from "@/components/ui/Badge";
import GlossaryTerm from "@/components/ui/GlossaryTerm";
import { getTeachingById, getSeriesEpisodes, getRelatedTeachings, getSeriesById, getAllTeachings, syncYoutubeViewCount } from "@/lib/db/queries";
import type { Theme } from "@/lib/types";
import { getDictionary } from "@/dictionaries";
import { formatSeriesLabel, formatContentLanguage, formatLevel, formatThemeLabel, formatViews } from "@/lib/format";
import { getTeachingTitle, getTeachingDescription, getSeriesTitle } from "@/lib/content-i18n";
import { buildLanguageAlternates, SITE_URL, type Locale } from "@/lib/i18n";
import { buildYoutubeThumbnailUrl } from "@/lib/youtube";

const levelColor: Record<string, string> = {
  débutant: "text-[#5f7050] bg-[#eef0e6]",
  intermédiaire: "text-[#7d5f26] bg-[rgba(181,138,60,0.1)]",
  avancé: "text-[#8a2f29] bg-[rgba(138,47,41,0.08)]",
};

export const revalidate = 60;

export async function generateStaticParams() {
  const teachings = await getAllTeachings();
  return teachings.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const teaching = await getTeachingById(id);
  if (!teaching) return { title: "Cours introuvable" };
  const title = getTeachingTitle(teaching, lang);
  const description = getTeachingDescription(teaching, lang);

  // Un `openGraph` défini ici remplace entièrement celui hérité du layout (pas de fusion
  // profonde côté Next.js) — sans `images` explicite, un lien partagé (WhatsApp, Facebook…)
  // n'affiche aucune vignette. Vignette réelle si disponible (upload admin ou miniature
  // YouTube), sinon on retombe explicitement sur l'image de partage par défaut du site.
  const ogImage =
    teaching.thumbnail ??
    (teaching.youtubeId ? buildYoutubeThumbnailUrl(teaching.youtubeId, "hqdefault") : null) ??
    `/${lang}/opengraph-image`;

  return {
    title,
    description:
      description ??
      `Enseignement de type ${teaching.type} sur le thème ${formatThemeLabel(teaching.theme, lang)} — Oustaz Niang Mbaye (H.A)`,
    alternates: buildLanguageAlternates(lang, `/bibliotheque/${id}`),
    openGraph: {
      title: `${title} | Abu Maryam TV`,
      description,
      type: "video.other",
      images: [{ url: ogImage }],
    },
  };
}

export default async function TeachingDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const { lang, id } = await params;
  const teaching = await getTeachingById(id);
  if (!teaching) notFound();

  // Vues fraîches depuis YouTube pour le contenu YouTube (repli silencieux sur la dernière
  // valeur connue si l'appel échoue ou que YOUTUBE_API_KEY est absente) — voir
  // syncYoutubeViewCount. Le contenu auto-hébergé garde directement teaching.views.
  const views = teaching.youtubeId
    ? await syncYoutubeViewCount(teaching.id, teaching.youtubeId, teaching.views)
    : teaching.views;

  const dict = await getDictionary(lang);
  const series = teaching.seriesId ? await getSeriesById(teaching.seriesId) : null;
  const seriesEpisodes = series ? await getSeriesEpisodes(series.id) : [];
  const related = await getRelatedTeachings(teaching, 4);
  const publishedDate = new Date(teaching.publishedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // JSON-LD Schema.org
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": teaching.type === "video" ? "VideoObject" : "AudioObject",
    "name": getTeachingTitle(teaching, lang),
    "description": getTeachingDescription(teaching, lang),
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
      "name": formatThemeLabel(teaching.theme, lang),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <MobileHeader title={getTeachingTitle(teaching, lang)} />

      <main id="main-content" className="pb-24 md:pb-0 dark:bg-[#1b211a]">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-6 md:py-8">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 font-[var(--font-hanken)] text-[12.5px] text-[#6f7363] dark:text-[#8f8973] mb-6">
            <Link href="/" className="hover:text-[#b58a3c] transition-colors">{dict.nav.home}</Link>
            <span>›</span>
            <Link href="/bibliotheque" className="hover:text-[#b58a3c] transition-colors">{dict.nav.library}</Link>
            <span>›</span>
            <span className="text-[#3f463a] dark:text-[#d8d4c4] line-clamp-1">{getTeachingTitle(teaching, lang)}</span>
          </nav>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Colonne principale */}
            <div className="space-y-6">
              {/* Player */}
              <Suspense fallback={<div className="bg-[#232a20] rounded-[14px]" style={{ aspectRatio: "16/9" }} />}>
                <TeachingPlayer teaching={teaching} dict={dict} lang={lang} seriesEpisodes={seriesEpisodes} relatedTeachings={related} />
              </Suspense>

              {/* Infos */}
              <div>
                {/* Badges méta */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge theme={teaching.theme as Theme} lang={lang} />
                  <GlossaryTerm
                    term={teaching.theme}
                    lang={lang}
                    className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-[var(--font-hanken)] font-bold text-[#6f7363] hover:text-[#b58a3c]"
                  >
                    ?
                  </GlossaryTerm>
                  {teaching.level && (
                    <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${levelColor[teaching.level]}`}>
                      {formatLevel(teaching.level, lang)}
                    </span>
                  )}
                  {series && teaching.episodeNumber && (
                    <span className="text-[11px] font-medium text-[#6f7363] dark:text-[#8f8973] font-[var(--font-hanken)]">
                      {lang === "ar" ? "الحلقة" : "Épisode"}{" "}
                      <span dir="ltr" className="inline-block">{teaching.episodeNumber} / {series.totalEpisodes}</span>
                    </span>
                  )}
                </div>

                <h1 className="font-[var(--font-cormorant)] font-semibold text-[26px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-3">
                  {getTeachingTitle(teaching, lang)}
                </h1>

                {/* Avatar + date */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-[#3c4a37] flex items-center justify-center shrink-0">
                    <span className="arabic text-[#cda350] text-[16px]">أ</span>
                  </div>
                  <div>
                    <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#232a20] dark:text-[#f2ede0]">
                      Oustaz Niang Mbaye (H.A)
                    </p>
                    <p className="font-[var(--font-hanken)] text-[12px] text-[#6f7363] dark:text-[#8f8973]">
                      {publishedDate} · {teaching.duration} ·{" "}
                      {formatContentLanguage(teaching.language, lang)} · {formatViews(views, lang)}
                    </p>
                  </div>
                </div>

                <hr className="border-[#e2dac9] dark:border-[#3a4132] mb-4" />

                {/* Description */}
                {teaching.description && (
                  <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed mb-5">
                    {getTeachingDescription(teaching, lang)}
                  </p>
                )}

                {/* Téléchargement audio */}
                {teaching.type === "audio" && teaching.audioUrl && (
                  <a
                    href={teaching.audioUrl}
                    download
                    className="inline-flex items-center gap-2 mb-4 px-4 py-2 border border-[#d8d0bf] dark:border-[#454c3c] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {dict.library.downloadAudio}
                  </a>
                )}

                {/* Partage */}
                <ShareButtons
                  title={getTeachingTitle(teaching, lang)}
                  url={`${SITE_URL}/${lang}/bibliotheque/${teaching.id}`}
                  dict={dict.common}
                  lang={lang}
                />
              </div>

              {/* Cours liés (si pas de série) */}
              {!series && related.length > 0 && (
                <div>
                  <h2 className="font-[var(--font-cormorant)] font-semibold text-[24px] text-[#232a20] dark:text-[#f2ede0] mb-4">
                    {dict.library.sameThemeMain}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {related.map((t) => (
                      <ContentCard key={t.id} teaching={t} size="compact" lang={lang} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rail latéral — Série ou Cours liés */}
            <aside className="space-y-5">
              {series && (
                <div className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] overflow-hidden">
                  {/* En-tête série */}
                  <div className="bg-[#3c4a37] px-5 py-4">
                    {series.arabicVerse && (
                      <p className="arabic text-[#cda350] text-[14px] text-right mb-1">
                        {series.arabicVerse}
                      </p>
                    )}
                    <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#cda350] font-semibold mb-1">
                      {formatSeriesLabel(seriesEpisodes.length, lang)}
                    </p>
                    <h3 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#fbf9f3] leading-tight">
                      {getSeriesTitle(series, lang)}
                    </h3>
                  </div>

                  <SeriesProgress episodes={seriesEpisodes} lang={lang} />

                  {/* Liste des épisodes */}
                  <ul className="divide-y divide-[#e2dac9] dark:divide-[#3a4132]">
                    {seriesEpisodes.map((ep) => {
                      const isCurrent = ep.id === teaching.id;
                      return (
                        <li key={ep.id}>
                          <Link
                            href={`/bibliotheque/${ep.id}`}
                            className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                              isCurrent
                                ? "bg-[rgba(181,138,60,0.08)] dark:bg-[rgba(205,163,80,0.14)] border-l-2 border-[#b58a3c]"
                                : "hover:bg-[#f5f0e8] dark:hover:bg-[rgba(255,255,255,0.04)]"
                            }`}
                          >
                            <span className={`font-[var(--font-cormorant)] text-[22px] font-semibold shrink-0 ${isCurrent ? "text-[#7d5f26] dark:text-[#e3c685]" : "text-[#d8d0bf] dark:text-[#4a5240]"}`}>
                              {ep.episodeNumber}
                            </span>
                            <div className="min-w-0">
                              <p className={`font-[var(--font-hanken)] text-[13px] font-medium leading-snug line-clamp-2 ${isCurrent ? "text-[#232a20] dark:text-[#f2ede0]" : "text-[#6f7363] dark:text-[#b7b2a0]"}`}>
                                {getTeachingTitle(ep, lang)}
                              </p>
                              <p className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] dark:text-[#8f8973] mt-0.5">
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
                    <div className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] p-5">
                      <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#7d5f26] dark:text-[#e3c685] font-semibold mb-3">
    {dict.library.nextEpisode}
                      </p>
                      <ContentCard teaching={next} size="compact" lang={lang} />
                    </div>
                  );
                })()
              )}

              {/* Cours liés (sidebar si série) */}
              {related.length > 0 && (
                <div className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] p-5">
                  <p className="font-[var(--font-hanken)] text-[11px] uppercase tracking-widest text-[#7d5f26] dark:text-[#e3c685] font-semibold mb-3">
    {dict.library.sameThemeSidebar}
                  </p>
                  <ul className="space-y-3 divide-y divide-[#e2dac9] dark:divide-[#3a4132]">
                    {related.slice(0, 3).map((t) => (
                      <li key={t.id} className="pt-3 first:pt-0">
                        <Link href={`/bibliotheque/${t.id}`} className="group flex gap-3 items-start">
                          <div className="w-[60px] h-[38px] rounded-[5px] overflow-hidden shrink-0 bg-[#e2dac9] dark:bg-[#3a4132] flex items-center justify-center text-[#6f7363] dark:text-[#8f8973] text-[10px]">
                            {t.type === "video" ? "▶" : "♪"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] dark:text-[#d8d4c4] group-hover:text-[#b58a3c] leading-snug line-clamp-2 transition-colors">
                              {getTeachingTitle(t, lang)}
                            </p>
                            <p className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] dark:text-[#8f8973] mt-0.5">
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
