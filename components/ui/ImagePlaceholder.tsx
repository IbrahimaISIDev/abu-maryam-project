import type { Theme } from "@/lib/types";

interface ImagePlaceholderProps {
  className?: string;
  label?: string;
  aspectRatio?: string;
  theme?: Theme;
  type?: "video" | "audio";
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
  rappel: { letter: "ذ", accent: "#e3c685" },
};

// Note: pas de `relative` dans les classes de base — les appelants contrôlent le positionnement
export default function ImagePlaceholder({
  className = "",
  label,
  aspectRatio,
  theme,
  type = "video",
}: ImagePlaceholderProps) {
  const visual = theme ? THEME_VISUAL[theme] : null;
  const isAudio = type === "audio";
  const accentColor = visual?.accent ?? "#b58a3c";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
        isAudio
          ? "bg-[radial-gradient(ellipse_at_top,#2d3829,#161c14)]"
          : "bg-[linear-gradient(135deg,#3c4a37,#1c2319)]"
      } ${className}`}
      style={{ aspectRatio: aspectRatio ?? undefined }}
    >
      {/* 1. Motif d'arrière-plan spécifique au format */}
      {isAudio ? (
        /* Vagues d'ondes sonores (Audio Waveform Equalizer) */
        <div className="absolute inset-0 flex items-center justify-center gap-[4px] opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity duration-300">
          <span className="w-[3px] h-7 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.1s" }} />
          <span className="w-[3px] h-13 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.4s" }} />
          <span className="w-[3px] h-9 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "0.9s" }} />
          <span className="w-[3px] h-16 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.6s" }} />
          <span className="w-[3px] h-10 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.2s" }} />
          <span className="w-[3px] h-14 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.5s" }} />
          <span className="w-[3px] h-8 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.0s" }} />
        </div>
      ) : (
        /* Texture halo vidéo cinématographique */
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(205,163,80,0.18),transparent_70%)] pointer-events-none" />
      )}

      {/* 2. Lueur thermique teintée selon le thème */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${accentColor}28, transparent 65%)`,
        }}
      />

      {/* 3. Petit filigrane/badge de format en haut à droite */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(18,24,16,0.65)] backdrop-blur-md border border-[rgba(255,255,255,0.12)] text-[10px] font-[var(--font-hanken)] text-[#fbf9f3] opacity-85 group-hover:opacity-100 transition-opacity">
        {isAudio ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="uppercase tracking-wider font-semibold text-[9px] text-[#e9e3d4]">Audio</span>
          </>
        ) : (
          <>
            <svg width="9" height="9" viewBox="0 0 24 24" fill={accentColor}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="uppercase tracking-wider font-semibold text-[9px] text-[#e9e3d4]">Vidéo</span>
          </>
        )}
      </div>

      {/* 4. Lettre Arabe centrale ou icône */}
      {visual ? (
        <span
          className="arabic relative leading-none select-none text-[44px] transition-transform duration-300 group-hover:scale-110 drop-shadow-md"
          style={{ color: visual.accent, opacity: 0.9 }}
        >
          {visual.letter}
        </span>
      ) : (
        <svg className="relative transition-transform duration-300 group-hover:scale-110" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
          {isAudio ? (
            <path d="M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          ) : (
            <polygon points="6 3 20 12 6 21 6 3" />
          )}
        </svg>
      )}

      {label && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-[var(--font-hanken)] tracking-wide text-[rgba(251,249,243,0.7)]">
          {label}
        </span>
      )}
    </div>
  );
}
