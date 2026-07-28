import type { Theme } from "@/lib/types";

const themeColors: Record<string, string> = {
  tafsir:     "TAFSIR",
  tawhid:     "TAWHÎD",
  akhlaq:     "AKHLÂQ",
  salat:      "SALÂT",
  famille:    "FAMILLE",
  sunna:      "SUNNA",
  sahaba:     "SAHABA",
  khoutba:    "KHOUTBA",
  conférence: "CONFÉRENCE",
};

interface BadgeProps {
  theme?: Theme | string;
  label?: string;
  variant?: "category" | "live" | "urgent" | "featured";
  className?: string;
}

export default function Badge({ theme, label, variant = "category", className = "" }: BadgeProps) {
  if (variant === "live") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8a2f29] text-[#fbf9f3] text-[11px] font-semibold tracking-widest uppercase font-[var(--font-hanken)] ${className}`}>
        <span className="w-[6px] h-[6px] rounded-full bg-[#fbf9f3] animate-live-pulse shrink-0" />
        EN DIRECT
      </span>
    );
  }

  if (variant === "urgent") {
    return (
      <span className={`inline-block px-3 py-1 bg-[#8a2f29] text-[#fbf9f3] text-[10.5px] font-bold tracking-widest uppercase font-[var(--font-hanken)] ${className}`}>
        {label ?? "PLACES LIMITÉES"}
      </span>
    );
  }

  if (variant === "featured") {
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 border border-[#8a2f29] dark:border-[#e08b81] text-[#8a2f29] dark:text-[#e08b81] text-[10.5px] font-bold tracking-widest uppercase font-[var(--font-hanken)] rounded-[4px] ${className}`}>
        {label ?? "À LA UNE · PLACES LIMITÉES"}
      </span>
    );
  }

  const text = label ?? (theme ? themeColors[theme] ?? theme.toUpperCase() : "");
  return (
    <span className={`inline-block px-2 py-0.5 bg-[rgba(60,74,55,0.92)] text-[#e3c685] text-[10px] font-semibold tracking-widest uppercase font-[var(--font-hanken)] rounded-[4px] ${className}`}>
      {text}
    </span>
  );
}
