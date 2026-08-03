"use client";

import React, { useState, useEffect } from "react";

interface SeminarCountdownProps {
  targetDate: string | Date;
  title: string;
}

export default function SeminarCountdown({ targetDate, title }: SeminarCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 font-[var(--font-hanken)] text-xs font-semibold text-[#e6cf8b]">
      <span className="hidden sm:inline text-white/70">⏳ Prochain Séminaire ({title}) :</span>
      <span className="inline-sm:hidden">⏳ Séminaire :</span>
      <div className="flex items-center gap-1 font-mono text-white">
        <span className="rounded bg-black/40 px-1.5 py-0.5">{timeLeft.days}j</span>
        <span>:</span>
        <span className="rounded bg-black/40 px-1.5 py-0.5">{String(timeLeft.hours).padStart(2, "0")}h</span>
        <span>:</span>
        <span className="rounded bg-black/40 px-1.5 py-0.5">{String(timeLeft.minutes).padStart(2, "0")}m</span>
        <span>:</span>
        <span className="rounded bg-black/40 px-1.5 py-0.5">{String(timeLeft.seconds).padStart(2, "0")}s</span>
      </div>
    </div>
  );
}
