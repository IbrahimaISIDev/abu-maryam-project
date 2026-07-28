"use client";

import { useProgress } from "@/hooks/useProgress";
import type { Teaching } from "@/lib/types";

interface SeriesProgressProps {
  episodes: Teaching[];
  variant?: "full" | "compact";
}

export default function SeriesProgress({ episodes, variant = "full" }: SeriesProgressProps) {
  const { getProgress } = useProgress();
  const completed = episodes.filter((ep) => getProgress(ep.id)?.completed).length;
  const pct = episodes.length ? Math.round((completed / episodes.length) * 100) : 0;

  if (variant === "compact") {
    if (completed === 0) return null;
    return (
      <div className="mt-2">
        <div className="h-[4px] bg-[#e2dac9] dark:bg-[#3a4132] rounded-full overflow-hidden">
          <div className="h-full bg-[#b58a3c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="font-[var(--font-hanken)] text-[10.5px] text-[#9a9483] dark:text-[#8f8973] mt-1">
          {completed} / {episodes.length} suivis
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-3 border-b border-[#e2dac9] dark:border-[#3a4132] bg-[#f5f1e8] dark:bg-[#242b1e]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-[var(--font-hanken)] text-[11.5px] font-medium text-[#6f7363] dark:text-[#b7b2a0]">
          Votre progression
        </span>
        <span className="font-[var(--font-hanken)] text-[11.5px] font-semibold text-[#3c4a37] dark:text-[#e3c685] tabular-nums">
          {completed} / {episodes.length}
        </span>
      </div>
      <div className="h-[5px] bg-[#e2dac9] dark:bg-[#3a4132] rounded-full overflow-hidden">
        <div className="h-full bg-[#b58a3c] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
