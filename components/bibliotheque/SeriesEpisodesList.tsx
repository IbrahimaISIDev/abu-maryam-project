"use client";

import { useState } from "react";
import Link from "@/components/ui/LocalizedLink";
import type { Teaching } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { getTeachingTitle } from "@/lib/content-i18n";

export default function SeriesEpisodesList({
  episodes,
  currentTeachingId,
  lang,
}: {
  episodes: Teaching[];
  currentTeachingId: string;
  lang: Locale;
}) {
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const ordered = dir === "asc" ? episodes : [...episodes].reverse();

  return (
    <div>
      <div className="flex items-center justify-end px-5 py-2 border-t border-b border-[#e2dac9] dark:border-[#3a4132]">
        <button
          onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="flex items-center gap-1.5 font-[var(--font-hanken)] text-[11.5px] font-medium text-[#6f7363] dark:text-[#8f8973] hover:text-[#3f463a] dark:hover:text-[#d8d4c4] transition-colors"
        >
          <span>{dir === "asc" ? (lang === "ar" ? "1 ← الأخير" : "1 → dernier") : (lang === "ar" ? "الأخير ← 1" : "dernier → 1")}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${dir === "desc" ? "rotate-180" : ""}`}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      </div>
      <ul className="divide-y divide-[#e2dac9] dark:divide-[#3a4132]">
        {ordered.map((ep) => {
          const isCurrent = ep.id === currentTeachingId;
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
  );
}
