"use client";

import Link from "@/components/ui/LocalizedLink";
import { usePlayer } from "@/contexts/PlayerContext";
import { useDictionary } from "@/contexts/DictionaryContext";
import { getTeachingTitle } from "@/lib/content-i18n";

const typeIcon = { video: "▶", audio: "♪" };
const i18n = {
  fr: { rewind: "Reculer 15 secondes", forward: "Avancer 30 secondes", pause: "Pause", play: "Lecture", close: "Fermer le player" },
  ar: { rewind: "الرجوع 15 ثانية", forward: "التقدم 30 ثانية", pause: "إيقاف مؤقت", play: "تشغيل", close: "إغلاق المشغل" },
};

export default function MiniPlayer() {
  const { state, pause, resume, close, seek } = usePlayer();
  const { lang } = useDictionary();
  const t = i18n[lang];
  const { teaching, isPlaying, positionSeconds } = state;
  const progress = teaching ? (positionSeconds / teaching.durationSeconds) * 100 : 0;

  if (!teaching) return null;

  const minutes = Math.floor(positionSeconds / 60);
  const seconds = positionSeconds % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 z-40 bg-[#fbf9f3] dark:bg-[#20261b] border-t border-[#e2dac9] dark:border-[#3a4132] shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      {/* Barre de progression */}
      <div className="h-[3px] bg-[#e2dac9] dark:bg-[#3a4132] relative">
        <div
          className="h-full bg-[#b58a3c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-2.5 flex items-center gap-3">
        {/* Icône type */}
        <div className="w-9 h-9 rounded-full bg-[#eef0e6] dark:bg-[rgba(95,112,80,0.18)] flex items-center justify-center text-[#3c4a37] dark:text-[#a9c19a] text-[14px] shrink-0">
          {typeIcon[teaching.type]}
        </div>

        {/* Titre */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/bibliotheque/${teaching.id}`}
            className="font-[var(--font-hanken)] font-semibold text-[13px] text-[#232a20] dark:text-[#f2ede0] line-clamp-1 hover:text-[#b58a3c] transition-colors"
          >
            {getTeachingTitle(teaching, lang)}
          </Link>
          <p className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] dark:text-[#8f8973]">
            {timeStr} · Oustaz Niang Mbaye (H.A)
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Reculer 15s */}
          <button type="button"
            onClick={() => seek(Math.max(0, positionSeconds - 15))}
            className="hidden sm:flex w-8 h-8 items-center justify-center text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a] transition-colors"
            aria-label={t.rewind}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <text x="12" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">15</text>
            </svg>
          </button>

          {/* Play / Pause */}
          <button type="button"
            onClick={isPlaying ? pause : resume}
            className="w-9 h-9 rounded-full bg-[#3c4a37] flex items-center justify-center text-[#fbf9f3] hover:bg-[#2e3a2b] transition-colors"
            aria-label={isPlaying ? t.pause : t.play}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Avancer 30s */}
          <button type="button"
            onClick={() => seek(Math.min(teaching.durationSeconds, positionSeconds + 30))}
            className="hidden sm:flex w-8 h-8 items-center justify-center text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a] transition-colors"
            aria-label={t.forward}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <text x="12" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">30</text>
            </svg>
          </button>

          {/* Fermer */}
          <button type="button"
            onClick={close}
            className="w-8 h-8 flex items-center justify-center text-[#6f7363] dark:text-[#8f8973] hover:text-[#3c4a37] dark:hover:text-[#a9c19a] transition-colors"
            aria-label={t.close}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
