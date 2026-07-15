"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";

const typeIcon = { video: "▶", audio: "♪" };

export default function MiniPlayer() {
  const { state, pause, resume, close, seek, audioRef } = usePlayer();
  const { teaching, isPlaying, positionSeconds } = state;
  const [progress, setProgress] = useState(0);

  // Sync barre de progression
  useEffect(() => {
    if (!teaching) return;
    setProgress((positionSeconds / teaching.durationSeconds) * 100);
  }, [positionSeconds, teaching]);

  // Tick de progression simulé (pour les placeholders sans vrai audio)
  useEffect(() => {
    if (!isPlaying || !teaching) return;
    const interval = setInterval(() => {
      seek(Math.min(positionSeconds + 1, teaching.durationSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, teaching, positionSeconds, seek]);

  if (!teaching) return null;

  const minutes = Math.floor(positionSeconds / 60);
  const seconds = positionSeconds % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 z-40 bg-[#fbf9f3] border-t border-[#e2dac9] shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      {/* Barre de progression */}
      <div className="h-[3px] bg-[#e2dac9] relative">
        <div
          className="h-full bg-[#b58a3c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-2.5 flex items-center gap-3">
        {/* Icône type */}
        <div className="w-9 h-9 rounded-full bg-[#eef0e6] flex items-center justify-center text-[#3c4a37] text-[14px] shrink-0">
          {typeIcon[teaching.type]}
        </div>

        {/* Titre */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/bibliotheque/${teaching.id}`}
            className="font-[var(--font-hanken)] font-semibold text-[13px] text-[#232a20] line-clamp-1 hover:text-[#b58a3c] transition-colors"
          >
            {teaching.title}
          </Link>
          <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">
            {timeStr} · Oustaz Niang Mbaye (H.A)
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Reculer 15s */}
          <button
            onClick={() => seek(Math.max(0, positionSeconds - 15))}
            className="hidden sm:flex w-8 h-8 items-center justify-center text-[#6f7363] hover:text-[#3c4a37] transition-colors"
            aria-label="Reculer 15 secondes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <text x="12" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">15</text>
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={isPlaying ? pause : resume}
            className="w-9 h-9 rounded-full bg-[#3c4a37] flex items-center justify-center text-[#fbf9f3] hover:bg-[#2e3a2b] transition-colors"
            aria-label={isPlaying ? "Pause" : "Lecture"}
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
          <button
            onClick={() => seek(Math.min(teaching.durationSeconds, positionSeconds + 30))}
            className="hidden sm:flex w-8 h-8 items-center justify-center text-[#6f7363] hover:text-[#3c4a37] transition-colors"
            aria-label="Avancer 30 secondes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <text x="12" y="16" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">30</text>
            </svg>
          </button>

          {/* Fermer */}
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center text-[#9a9483] hover:text-[#3c4a37] transition-colors"
            aria-label="Fermer le player"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Audio element caché (pour support futur vraie URL) */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
