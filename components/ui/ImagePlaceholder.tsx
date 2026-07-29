import type { Theme } from "@/lib/types";

interface ImagePlaceholderProps {
  className?: string;
  label?: string;
  aspectRatio?: string;
  theme?: Theme;
}

const THEME_VISUAL: Record<Theme, { letter: string; accent: string }> = {
  tafsir: { letter: "ف", accent: "#8fa781" },
  tawhid: { letter: "ت", accent: "#e3c685" },
  akhlaq: { letter: "أ", accent: "#8fa781" },
  salat: { letter: "ص", accent: "#8fa781" },
  famille: { letter: "ع", accent: "#e08b81" },
  sunna: { letter: "س", accent: "#e3c685" },
  sahaba: { letter: "ح", accent: "#e08b81" },
  khoutba: { letter: "خ", accent: "#e3c685" },
  "conférence": { letter: "م", accent: "#e08b81" },
};

// Note: no `relative` in base class — callers control positioning (absolute/relative/static)
export default function ImagePlaceholder({
  className = "",
  label,
  aspectRatio,
  theme,
}: ImagePlaceholderProps) {
  const visual = theme ? THEME_VISUAL[theme] : null;

  if (visual) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#3c4a37,#232a20)] ${className}`}
        style={{ aspectRatio: aspectRatio ?? undefined }}
      >
        {/* Lueur douce derrière la lettre — teintée selon le thème */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${visual.accent}33, transparent 65%)`,
          }}
        />
        <span
          className="arabic relative leading-none select-none text-[42px]"
          style={{ color: visual.accent, opacity: 0.85 }}
        >
          {visual.letter}
        </span>
        {label && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-[var(--font-hanken)] tracking-wide text-[rgba(251,249,243,0.7)]">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#3c4a37,#232a20)] ${className}`}
      style={{ aspectRatio: aspectRatio ?? undefined }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(205,163,80,0.18),transparent_65%)]" />
      <svg className="relative" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(251,249,243,0.55)" strokeWidth="1.5">
        <polygon points="6 3 20 12 6 21 6 3" />
      </svg>
      {label && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-[var(--font-hanken)] tracking-wide text-[rgba(251,249,243,0.7)]">
          {label}
        </span>
      )}
    </div>
  );
}
