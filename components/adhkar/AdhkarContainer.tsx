"use client";

import React, { useState, useRef } from "react";
import { adhkarData, DhikrItem } from "@/data/adhkar";

export default function AdhkarContainer() {
  const [activeCategory, setActiveCategory] = useState<"matin" | "soir" | "priere">("matin");
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredItems = adhkarData.filter((item) => item.category === activeCategory);

  const handleIncrement = (id: string, maxCount: number) => {
    setCounters((prev) => {
      const current = prev[id] || 0;
      if (current >= maxCount) return { ...prev, [id]: 0 };
      return { ...prev, [id]: current + 1 };
    });
  };

  const handleReset = (id: string) => {
    setCounters((prev) => ({ ...prev, [id]: 0 }));
  };

  const toggleAudio = (item: DhikrItem) => {
    if (!item.audioUrl) return;

    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(item.audioUrl);
    audioRef.current.onended = () => setPlayingId(null);
    audioRef.current
      .play()
      .then(() => setPlayingId(item.id))
      .catch(() => setPlayingId(null));
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 border-b border-white/10 pb-6">
        <button
          onClick={() => setActiveCategory("matin")}
          className={`flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
            activeCategory === "matin"
              ? "bg-[#b58a3c] text-white shadow-lg shadow-[#b58a3c]/30"
              : "border border-white/10 bg-white/5 text-white/70 hover:border-[#b58a3c]/40 hover:text-white"
          }`}
        >
          <span>☀️</span>
          <span>Invocations du Matin</span>
          <span className="arabic font-[var(--font-amiri)] text-[#ffd700]">(أذكار الصباح)</span>
        </button>

        <button
          onClick={() => setActiveCategory("soir")}
          className={`flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
            activeCategory === "soir"
              ? "bg-[#b58a3c] text-white shadow-lg shadow-[#b58a3c]/30"
              : "border border-white/10 bg-white/5 text-white/70 hover:border-[#b58a3c]/40 hover:text-white"
          }`}
        >
          <span>🌙</span>
          <span>Invocations du Soir</span>
          <span className="arabic font-[var(--font-amiri)] text-[#ffd700]">(أذكار المساء)</span>
        </button>

        <button
          onClick={() => setActiveCategory("priere")}
          className={`flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
            activeCategory === "priere"
              ? "bg-[#b58a3c] text-white shadow-lg shadow-[#b58a3c]/30"
              : "border border-white/10 bg-white/5 text-white/70 hover:border-[#b58a3c]/40 hover:text-white"
          }`}
        >
          <span>🕌</span>
          <span>Après la Prière</span>
          <span className="arabic font-[var(--font-amiri)] text-[#ffd700]">(أذكار الصلاة)</span>
        </button>
      </div>

      {/* List of Dhikr cards */}
      <div className="grid gap-6">
        {filteredItems.map((item) => {
          const currentCount = counters[item.id] || 0;
          const isCompleted = currentCount === item.repeatCount;
          const isPlaying = playingId === item.id;

          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isCompleted
                  ? "border-emerald-500/40 bg-[#16251c]"
                  : "border-[#b58a3c]/30 bg-gradient-to-b from-[#1c2419] to-[#121912]"
              } p-6 text-white shadow-md md:p-8`}
            >
              {/* Top info bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <h3 className="font-[var(--font-hanken)] text-base font-bold text-[#e6cf8b] md:text-lg">
                  {item.title}
                </h3>

                <div className="flex items-center gap-3">
                  {item.audioUrl && (
                    <button
                      onClick={() => toggleAudio(item)}
                      className={`flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-semibold transition ${
                        isPlaying
                          ? "bg-[#b58a3c] text-white"
                          : "border border-[#b58a3c]/40 bg-[#b58a3c]/15 text-[#f0d486] hover:bg-[#b58a3c]/30"
                      }`}
                    >
                      <span>{isPlaying ? "⏸ Pause" : "🔊 Audio"}</span>
                    </button>
                  )}

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    Répéter : {item.repeatCount}x
                  </span>
                </div>
              </div>

              {/* Arabic Calligraphy Text */}
              <div
                dir="rtl"
                className="arabic my-6 py-2 text-right font-[var(--font-amiri)] text-2xl font-bold leading-loose text-[#f7e7bd] md:text-3xl"
              >
                {item.arabicText}
              </div>

              {/* Transliteration & Translation */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <p className="text-xs italic text-white/60">{item.transliteration}</p>
                <p className="text-sm font-medium leading-relaxed text-white/90">
                  {item.translation}
                </p>
              </div>

              {/* Source & Merit */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#b58a3c]">
                <span>Rapporté par : {item.source}</span>
                {item.merit && (
                  <span className="rounded-md bg-[#b58a3c]/10 px-2.5 py-1 text-emerald-400">
                    ✨ Mérite : {item.merit}
                  </span>
                )}
              </div>

              {/* Interactive Counter Button */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <button
                  onClick={() => handleReset(item.id)}
                  className="text-xs text-white/40 underline hover:text-white/80"
                >
                  Réinitialiser
                </button>

                <button
                  onClick={() => handleIncrement(item.id, item.repeatCount)}
                  className={`flex items-center gap-3 rounded-full px-6 py-3 font-bold transition-all transform active:scale-95 ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-[#b58a3c] text-white hover:bg-[#c99b45] shadow-lg shadow-[#b58a3c]/20"
                  }`}
                >
                  <span>{isCompleted ? "✓ Terminé !" : "Compteur"}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/25 text-xs font-black">
                    {currentCount} / {item.repeatCount}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
