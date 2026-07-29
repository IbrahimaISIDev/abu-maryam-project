"use client";

import { useMemo } from "react";
import Link from "@/components/ui/LocalizedLink";
import ContentCard from "@/components/ui/ContentCard";
import { useProgress } from "@/hooks/useProgress";
import type { Teaching, TeachingProgress } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export default function ContinueListening({
  title,
  viewAll,
  lang,
  teachings,
}: {
  title: string;
  viewAll: string;
  lang: Locale;
  teachings: Teaching[];
}) {
  const { getInProgress } = useProgress();
  const items = useMemo(
    () =>
      getInProgress()
        .map((p) => {
          const t = teachings.find((x) => x.id === p.teachingId);
          return t ? { teaching: t, prog: p } : null;
        })
        .filter((x): x is { teaching: Teaching; prog: TeachingProgress } => x !== null),
    [getInProgress, teachings]
  );

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[32px] text-[#232a20]">
          {title}
        </h2>
        <Link
          href="/bibliotheque"
          className="font-[var(--font-hanken)] text-[13px] font-medium text-[#7d5f26] dark:text-[#e3c685] hover:text-[#9e7832] dark:hover:text-[#cda350] transition-colors"
        >
          {viewAll}
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ teaching, prog }) => {
          const pct = Math.round((prog.positionSeconds / (teaching.durationSeconds || 1)) * 100);
          return (
            <Link key={teaching.id} href={`/bibliotheque/${teaching.id}`} className="block">
              <ContentCard
                teaching={teaching}
                size="default"
                progressPercent={pct}
                completed={prog.completed}
                lang={lang}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
