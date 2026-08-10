import Link from "@/components/ui/LocalizedLink";
import { getAgendaItems, getAllTeachings } from "@/lib/db/queries";
import ContentCard from "@/components/ui/ContentCard";
import { getAgendaItemTitle } from "@/lib/content-i18n";
import { computeAgendaStatus } from "@/lib/activities";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";

const PREVIEW_LIMIT = 4;

/**
 * Vidéos du séminaire/événement en cours ou à venir, sur l'accueil — même présentation que
 * TeachingsGrid (mêmes classes de grille) pour une continuité visuelle avec la Bibliothèque.
 * Priorité à l'événement mis en avant (isFeatured) s'il a du contenu rattaché, sinon le
 * premier événement non passé qui en a. Ne s'affiche pas si aucun événement actif n'a de
 * contenu — pas de section vide sur l'accueil.
 */
export default async function EventContentSection({ dict, lang }: { dict: Dictionary["home"]; lang: Locale }) {
  const [agendaItems, teachings] = await Promise.all([getAgendaItems(), getAllTeachings()]);

  const candidates = agendaItems
    .filter((a) => computeAgendaStatus(a) !== "past")
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  const target = candidates.find((a) => teachings.some((t) => t.agendaItemId === a.id));
  if (!target) return null;

  const eventTeachings = teachings.filter((t) => t.agendaItemId === target.id);
  const preview = eventTeachings.slice(0, PREVIEW_LIMIT);
  const eventTitle = getAgendaItemTitle(target.id, target.title, lang);
  const viewAllHref = `/bibliotheque?event=${target.id}`;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0]">
          {lang === "ar" ? `فيديوهات — ${eventTitle}` : `Vidéos — ${eventTitle}`}
        </h2>
        <Link
          href={viewAllHref}
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#7d5f26] dark:text-[#e3c685] hover:text-[#9e7832] dark:hover:text-[#cda350] underline underline-offset-4 transition-colors hidden md:inline"
        >
          {dict.viewAll}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[22px]">
        {preview.map((t) => (
          <Link key={t.id} href={`/bibliotheque/${t.id}`} className="block">
            <ContentCard teaching={t} lang={lang} />
          </Link>
        ))}
      </div>

      <div className="mt-4 md:hidden text-center">
        <Link
          href={viewAllHref}
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#7d5f26] dark:text-[#e3c685] underline underline-offset-4"
        >
          {dict.viewAll}
        </Link>
      </div>
    </section>
  );
}
