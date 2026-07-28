"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useProgress } from "@/hooks/useProgress";
import type { Teaching } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";

interface TeachingPlayerProps {
  teaching: Teaching;
  dict: Dictionary;
}

export default function TeachingPlayer({ teaching, dict }: TeachingPlayerProps) {
  const { state, play, pause, resume, seek } = usePlayer();
  const { updateProgress, getProgress } = useProgress();
  const [localPos, setLocalPos] = useState(() => {
    const saved = getProgress(teaching.id);
    return saved && !saved.completed ? saved.positionSeconds : 0;
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isThisPlaying =
    state.teaching?.id === teaching.id && state.isPlaying;
  const isThisLoaded = state.teaching?.id === teaching.id;

  // Tick de progression
  useEffect(() => {
    if (!isThisPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const pos = isThisLoaded ? state.positionSeconds + 1 : localPos + 1;
      setLocalPos(pos);
      updateProgress(teaching.id, pos, teaching.durationSeconds);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isThisPlaying, isThisLoaded, state.positionSeconds, localPos, teaching, updateProgress]);

  const progress = (localPos / teaching.durationSeconds) * 100;
  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  function handlePlayPause() {
    if (!isThisLoaded) {
      play(teaching, localPos);
    } else if (isThisPlaying) {
      pause();
    } else {
      resume();
    }
  }

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newPos = Math.floor(ratio * teaching.durationSeconds);
    setLocalPos(newPos);
    seek(newPos);
    if (!isThisLoaded) play(teaching, newPos);
  }

  function handleChapterClick(t: number) {
    setLocalPos(t);
    seek(t);
    if (!isThisLoaded) play(teaching, t);
  }

  const currentChapterIndex = teaching.chapters
    ? teaching.chapters.reduce((acc, ch, i) => (ch.timeSeconds <= localPos ? i : acc), -1)
    : -1;

  return (
    <div className="bg-[#232a20] rounded-[14px] overflow-hidden">
      {/* Zone visuelle */}
      <div
        className="relative flex items-center justify-center"
        style={{ aspectRatio: teaching.type === "video" ? "16/9" : "21/6" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3c4a37 0px, #3c4a37 1px, transparent 1px, transparent 8px)",
          }}
        />

        {/* Verset arabe si disponible */}
        {teaching.arabicVerse && (
          <p className="absolute top-4 right-4 arabic text-[#cda350] text-[16px] text-right leading-relaxed max-w-[280px]">
            {teaching.arabicVerse}
          </p>
        )}

        {/* Bouton play */}
        <button
          onClick={handlePlayPause}
          className="relative z-10 w-[74px] h-[74px] rounded-full bg-[rgba(251,249,243,0.15)] border-2 border-[rgba(251,249,243,0.4)] flex items-center justify-center text-[#fbf9f3] hover:bg-[rgba(251,249,243,0.25)] transition-colors"
          aria-label={isThisPlaying ? dict.common.pause : dict.live.launchPlayback}
        >
          {isThisPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </button>

        {/* Type badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[rgba(28,34,22,0.7)] text-[#fbf9f3] text-[12px] font-[var(--font-hanken)] px-3 py-1 rounded-full">
          <span>{teaching.type === "video" ? "▶" : "♪"}</span>
          <span>{teaching.type === "video" ? dict.common.video : dict.common.audio}</span>
        </div>
      </div>

      {/* Barre de contrôle */}
      <div className="px-5 py-4 space-y-3">
        {/* Barre de progression cliquable */}
        <div
          className="relative h-[6px] bg-[rgba(251,249,243,0.15)] rounded-full cursor-pointer group"
          onClick={handleSeekClick}
          role="slider"
          aria-label={dict.library.seekAria}
          aria-valuemin={0}
          aria-valuemax={teaching.durationSeconds}
          aria-valuenow={localPos}
          tabIndex={0}
        >
          <div
            className="h-full bg-[#b58a3c] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          {teaching.chapters?.map((ch, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-[2px] h-2 bg-[rgba(251,249,243,0.6)] pointer-events-none"
              style={{ left: `${(ch.timeSeconds / teaching.durationSeconds) * 100}%` }}
            />
          ))}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#b58a3c] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Chapitrage */}
        {teaching.chapters && teaching.chapters.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" aria-label={dict.library.chaptersAria}>
            {teaching.chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => handleChapterClick(ch.timeSeconds)}
                dir="ltr"
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-[var(--font-hanken)] font-medium border transition-colors ${
                  i === currentChapterIndex
                    ? "bg-[#b58a3c] border-[#b58a3c] text-[#232a20]"
                    : "border-[rgba(251,249,243,0.25)] text-[rgba(251,249,243,0.7)] hover:border-[#b58a3c] hover:text-[#fbf9f3]"
                }`}
              >
                {fmtTime(ch.timeSeconds)} · {ch.label}
              </button>
            ))}
          </div>
        )}

        {/* Contrôles + temps */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { seek(Math.max(0, localPos - 15)); setLocalPos((p) => Math.max(0, p - 15)); }}
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.rewindAria}
            dir="ltr"
          >
            −15s
          </button>

          <button
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full bg-[#b58a3c] flex items-center justify-center text-[#fbf9f3] hover:bg-[#9e7832] transition-colors"
            aria-label={isThisPlaying ? dict.common.pause : dict.common.play}
          >
            {isThisPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>

          <button
            onClick={() => { seek(Math.min(teaching.durationSeconds, localPos + 30)); setLocalPos((p) => Math.min(teaching.durationSeconds, p + 30)); }}
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.forwardAria}
            dir="ltr"
          >
            +30s
          </button>

          <span dir="ltr" className="ml-auto font-[var(--font-hanken)] text-[12px] tabular-nums text-[rgba(251,249,243,0.6)]">
            {fmtTime(localPos)} / {teaching.duration}
          </span>
        </div>
      </div>
    </div>
  );
}
