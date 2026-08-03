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
          ? "bg-[radial-gradient(ellipse_at_top,#2a3325,#141912)]"
          : "bg-[linear-gradient(135deg,#364331,#181e16)]"
      } ${className}`}
      style={{ aspectRatio: aspectRatio ?? undefined }}
    >
      {/* 1. Motif Géométrique Islamique (Arabesque Girih / Rosette à 8 branches) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="islamic-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            {/* Motif d'étoile islamique à 8 branches */}
            <path
              d="M15 0 L18.5 10 L28.5 10 L20.5 16 L23.5 26.5 L15 20.5 L6.5 26.5 L9.5 16 L1.5 10 L11.5 10 Z"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.5"
              opacity="0.6"
            />
            <circle cx="15" cy="15" r="10" fill="none" stroke={accentColor} strokeWidth="0.3" strokeDasharray="1,2.5" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-grid)" />
      </svg>

      {/* 2. Silhouette d'Arche Islamique (Mihrab Oriental) pour les Vidéos ou contour d'onde pour Audio */}
      {!isAudio ? (
        <svg
          className="absolute inset-0 w-full h-full opacity-20 group-hover:opacity-35 transition-opacity duration-300 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 12 100 V 42 C 12 22, 50 8, 50 8 C 50 8, 88 22, 88 42 V 100"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.8"
          />
          <path
            d="M 17 100 V 44 C 17 26, 50 14, 50 14 C 50 14, 83 26, 83 44 V 100"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.4"
            strokeDasharray="1.5,1.5"
          />
        </svg>
      ) : (
        /* Vagues d'ondes sonores (Audio Waveform Equalizer) pour l'Audio */
        <div className="absolute inset-0 flex items-center justify-center gap-[4px] opacity-25 pointer-events-none group-hover:opacity-45 transition-opacity duration-300">
          <span className="w-[3px] h-8 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.1s" }} />
          <span className="w-[3px] h-14 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.4s" }} />
          <span className="w-[3px] h-10 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "0.9s" }} />
          <span className="w-[3px] h-18 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.6s" }} />
          <span className="w-[3px] h-11 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.2s" }} />
          <span className="w-[3px] h-15 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.5s" }} />
          <span className="w-[3px] h-9 bg-current rounded-full animate-pulse" style={{ color: accentColor, animationDuration: "1.0s" }} />
        </div>
      )}

      {/* 3. Lueur thermique dorée / spirituelle au centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 48%, ${accentColor}33, transparent 60%)`,
        }}
      />

      {/* 4. Filigrane/Badge de Format en haut à droite */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(18,24,16,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.15)] text-[10px] font-[var(--font-hanken)] text-[#fbf9f3] opacity-85 group-hover:opacity-100 transition-opacity">
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

      {/* 5. Lettre Calligraphique Arabe du Thème au Centre */}
      {visual ? (
        <span
          className="arabic relative leading-none select-none text-[48px] transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          style={{ color: visual.accent, opacity: 0.95 }}
        >
          {visual.letter}
        </span>
      ) : (
        <svg className="relative transition-transform duration-300 group-hover:scale-110" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
          {isAudio ? (
            <path d="M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          ) : (
            <polygon points="6 3 20 12 6 21 6 3" />
          )}
        </svg>
      )}

      {label && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-[var(--font-hanken)] tracking-wide text-[rgba(251,249,243,0.75)] font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
