"use client";

import React, { useState, useRef } from "react";
import { dailyContents, DailyContent } from "@/data/daily";

export default function DailyVerseWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current: DailyContent = dailyContents[currentIndex];

  const handleNext = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentIndex((prev) => (prev + 1) % dailyContents.length);
  };

  const handlePrev = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentIndex((prev) => (prev - 1 + dailyContents.length) % dailyContents.length);
  };

  const toggleAudio = () => {
    if (!current.audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(current.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    } else if (audioRef.current.src !== current.audioUrl) {
      audioRef.current.pause();
      audioRef.current = new Audio(current.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#b58a3c]/30 bg-gradient-to-b from-[#1c2419] via-[#161c14] to-[#0f140e] p-6 text-white shadow-xl md:p-8">
      {/* Background Girih / Islamic Geometric Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="girih-pattern-daily" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 40 20 L 20 40 L 0 20 Z M 20 5 L 35 20 L 20 35 L 5 20 Z"
                fill="none"
                stroke="#b58a3c"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#girih-pattern-daily)" />
        </svg>
      </div>

      {/* Decorative Golden Arch Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-[#b58a3c]/15 blur-3xl" />

      <div className="relative z-10">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#b58a3c]/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 items-center justify-center rounded-full border border-[#b58a3c]/40 bg-[#b58a3c]/15 px-3 text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
              {current.type === "verse" ? "📖 Verset du Jour" : "📜 Hadith du Jour"}
            </span>
            {current.dateStr && (
              <span className="text-xs text-white/60">{current.dateStr}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              title="Précédent"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:border-[#b58a3c]/50 hover:bg-[#b58a3c]/20"
            >
              ←
            </button>
            <span className="text-xs text-white/50">
              {currentIndex + 1} / {dailyContents.length}
            </span>
            <button
              onClick={handleNext}
              title="Suivant"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition hover:border-[#b58a3c]/50 hover:bg-[#b58a3c]/20"
            >
              →
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="my-6 space-y-5 text-center">
          {/* Title */}
          <h3 className="font-[var(--font-hanken)] text-lg font-bold text-[#e6cf8b]">
            {current.title}
          </h3>

          {/* Arabic Calligraphy Text */}
          <div
            dir="rtl"
            className="arabic my-4 py-2 font-[var(--font-amiri)] text-2xl font-bold leading-loose tracking-wide text-[#f7e7bd] md:text-3xl"
          >
            « {current.arabicText} »
          </div>

          {/* Transliteration */}
          {current.transliteration && (
            <p className="text-xs italic tracking-wide text-white/60">
              {current.transliteration}
            </p>
          )}

          {/* Translation */}
          <blockquote className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-white/90 md:text-base">
            « {current.translation} »
          </blockquote>

          {/* Reference */}
          <p className="text-xs font-semibold text-[#b58a3c]">
            — {current.reference}
          </p>

          {/* Explanation Box */}
          <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-xs leading-relaxed text-white/75 md:text-sm">
            <span className="font-semibold text-[#d4af37]">💡 Note d'Oustaz : </span>
            {current.explanation}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-[#b58a3c]/20 pt-4">
          {current.audioUrl && (
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                isPlaying
                  ? "bg-[#b58a3c] text-white shadow-lg shadow-[#b58a3c]/30"
                  : "border border-[#b58a3c]/40 bg-[#b58a3c]/15 text-[#f0d486] hover:bg-[#b58a3c]/30"
              }`}
            >
              <span>{isPlaying ? "⏸ Pause l'Audio d'Oustaz" : "🔊 Écouter l'Explication Audio"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
