"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePlayer } from "@/contexts/PlayerContext";
import { useProgress } from "@/hooks/useProgress";
import { useVolume } from "@/hooks/useVolume";
import YoutubePlayer, { type YoutubePlayerHandle } from "@/components/player/YoutubePlayer";
import NativeVideoPlayer from "@/components/player/NativeVideoPlayer";
import { YT_PLAYER_STATE } from "@/hooks/useYoutubePlayer";
import type { Teaching } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { getChapterLabel } from "@/lib/content-i18n";
import { buildYoutubeWatchUrl } from "@/lib/youtube";

interface TeachingPlayerProps {
  teaching: Teaching;
  dict: Dictionary;
  lang: Locale;
  seriesEpisodes?: Teaching[];
  relatedTeachings?: Teaching[];
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function currentChapterIndexFor(teaching: Teaching, positionSeconds: number): number {
  return teaching.chapters
    ? teaching.chapters.reduce((acc, ch, i) => (ch.timeSeconds <= positionSeconds ? i : acc), -1)
    : -1;
}

/** Lit `?t=` une seule fois au montage (lien profond vers un instant précis). */
function useInitialTimestamp(): number | null {
  const searchParams = useSearchParams();
  const [initial] = useState<number | null>(() => {
    const raw = searchParams.get("t");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  });
  return initial;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
  dict,
}: {
  volume: number;
  muted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  dict: Dictionary;
}) {
  const isSilent = muted || volume === 0;
  return (
    <div className="hidden sm:flex items-center gap-1.5">
      <button type="button"
        onClick={onToggleMute}
        aria-label={isSilent ? dict.library.unmuteAria : dict.library.muteAria}
        aria-pressed={isSilent}
        className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors shrink-0"
      >
        {isSilent ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={isSilent ? 0 : volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        aria-label={dict.library.volumeAria}
        className="w-16 accent-[#b58a3c]"
      />
    </div>
  );
}

function SpeedControl({ rate, onChange, dict }: { rate: number; onChange: (r: number) => void; dict: Dictionary }) {
  function cycle() {
    const idx = SPEEDS.indexOf(rate as (typeof SPEEDS)[number]);
    onChange(SPEEDS[(idx + 1) % SPEEDS.length]);
  }
  return (
    <button type="button"
      onClick={cycle}
      aria-label={dict.library.speedAria}
      dir="ltr"
      className="shrink-0 text-[11px] font-[var(--font-hanken)] font-semibold text-[rgba(251,249,243,0.7)] hover:text-[#fbf9f3] transition-colors border border-[rgba(251,249,243,0.25)] hover:border-[#b58a3c] rounded-full px-2 py-1 tabular-nums"
    >
      {rate}×
    </button>
  );
}

function CopyTimestampButton({ positionSeconds, lang }: { positionSeconds: number; lang: Locale }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = new URL(window.location.href);
    url.searchParams.set("t", String(Math.floor(positionSeconds)));
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button"
      onClick={handleCopy}
      className="shrink-0 flex items-center gap-1 text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
      aria-label={lang === "ar" ? "نسخ رابط هذه اللحظة" : "Copier le lien à cet instant"}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}

function ChapterBar({
  teaching,
  positionSeconds,
  currentChapterIndex,
  onSeekClick,
  onChapterClick,
  dict,
  lang,
}: {
  teaching: Teaching;
  positionSeconds: number;
  currentChapterIndex: number;
  onSeekClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onChapterClick: (t: number) => void;
  dict: Dictionary;
  lang: Locale;
}) {
  const progress = (positionSeconds / teaching.durationSeconds) * 100;
  return (
    <>
      <div
        className="relative h-[6px] bg-[rgba(251,249,243,0.15)] rounded-full cursor-pointer group"
        onClick={onSeekClick}
        role="slider"
        aria-label={dict.library.seekAria}
        aria-valuemin={0}
        aria-valuemax={teaching.durationSeconds}
        aria-valuenow={positionSeconds}
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

      {teaching.chapters && teaching.chapters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" aria-label={dict.library.chaptersAria}>
          {teaching.chapters.map((ch, i) => (
            <button type="button"
              key={i}
              onClick={() => onChapterClick(ch.timeSeconds)}
              dir="ltr"
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-[var(--font-hanken)] font-medium border transition-all duration-200 ${
                i === currentChapterIndex
                  ? "bg-[#b58a3c] border-[#b58a3c] text-[#232a20]"
                  : "border-[rgba(251,249,243,0.25)] text-[rgba(251,249,243,0.7)] hover:border-[#b58a3c] hover:text-[#fbf9f3]"
              }`}
            >
              {fmtTime(ch.timeSeconds)} · {getChapterLabel(teaching, i, lang, ch.label)}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function TeachingPlayer(props: TeachingPlayerProps) {
  if (props.teaching.type === "video") return <VideoTeachingPlayer {...props} />;
  return <AudioTeachingPlayer {...props} />;
}

/** Trouve l'épisode suivant dans une série ou un cours lié par thème */
function findNextTeaching(
  teaching: Teaching,
  seriesEpisodes?: Teaching[],
  relatedTeachings?: Teaching[]
): Teaching | null {
  // Priorité : épisode suivant dans la série
  if (seriesEpisodes && teaching.episodeNumber) {
    const next = seriesEpisodes.find((ep) => ep.episodeNumber === teaching.episodeNumber! + 1);
    if (next) return next;
  }
  // Fallback : premier cours lié par thème
  if (relatedTeachings && relatedTeachings.length > 0) {
    return relatedTeachings[0];
  }
  return null;
}

/** Trouve l'épisode précédent dans une série ou un cours lié par thème */
function findPreviousTeaching(
  teaching: Teaching,
  seriesEpisodes?: Teaching[],
  relatedTeachings?: Teaching[]
): Teaching | null {
  // Priorité : épisode précédent dans la série
  if (seriesEpisodes && teaching.episodeNumber && teaching.episodeNumber > 1) {
    const prev = seriesEpisodes.find((ep) => ep.episodeNumber === teaching.episodeNumber! - 1);
    if (prev) return prev;
  }
  // Fallback : pas de navigation "précédent" hors série
  return null;
}

function AudioTeachingPlayer({ teaching, dict, lang, seriesEpisodes, relatedTeachings }: TeachingPlayerProps) {
  const { state, play, pause, resume, seek, volume, muted, playbackRate, setVolume, toggleMute, setPlaybackRate, registerOnEnded } =
    usePlayer();
  const initialTimestamp = useInitialTimestamp();
  const appliedInitialTimestamp = useRef(false);

  const isThisLoaded = state.teaching?.id === teaching.id;
  const isThisPlaying = isThisLoaded && state.isPlaying;
  const positionSeconds = isThisLoaded ? state.positionSeconds : 0;
  const hasError = isThisLoaded && state.hasError;

  const nextTeaching = findNextTeaching(teaching, seriesEpisodes, relatedTeachings);
  const previousTeaching = findPreviousTeaching(teaching, seriesEpisodes, relatedTeachings);

  function handlePlayPause() {
    if (!isThisLoaded) play(teaching, 0);
    else if (isThisPlaying) pause();
    else resume();
  }

  function handleNavigateTo(teaching: Teaching) {
    window.location.href = `/bibliotheque/${teaching.id}`;
  }

  // Enregistrement du callback de lecture automatique pour l'audio
  useEffect(() => {
    if (!nextTeaching) return;
    const unregister = registerOnEnded(() => {
      setTimeout(() => {
        window.location.href = `/bibliotheque/${nextTeaching.id}`;
      }, 1500);
    });
    return unregister;
  }, [nextTeaching, registerOnEnded]);

  // Lien profond ?t= — ne s'applique qu'une fois, au premier montage.
  useEffect(() => {
    if (appliedInitialTimestamp.current || initialTimestamp === null) return;
    appliedInitialTimestamp.current = true;
    play(teaching, initialTimestamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTimestamp]);

  // Raccourcis clavier — actifs tant que cette page est affichée.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (isThisLoaded) seek(Math.max(0, positionSeconds - 5));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (isThisLoaded) seek(Math.min(teaching.durationSeconds, positionSeconds + 5));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThisLoaded, positionSeconds, teaching.durationSeconds]);

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newPos = Math.floor(ratio * teaching.durationSeconds);
    if (!isThisLoaded) play(teaching, newPos);
    else seek(newPos);
  }

  function handleChapterClick(t: number) {
    if (!isThisLoaded) play(teaching, t);
    else seek(t);
  }

  return (
    <div className="bg-[#232a20] rounded-[14px] overflow-hidden">
      {/* Zone visuelle décorative */}
      <div className="relative flex items-center justify-center" style={{ aspectRatio: "21/6" }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3c4a37 0px, #3c4a37 1px, transparent 1px, transparent 8px)",
          }}
        />

        {teaching.arabicVerse && (
          <p className="absolute top-4 right-4 arabic text-[#cda350] text-[16px] text-right leading-relaxed max-w-[280px]">
            {teaching.arabicVerse}
          </p>
        )}

        {hasError ? (
          <p className="relative z-10 font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.75)] px-6 text-center">
            {dict.library.errorAudio}
          </p>
        ) : (
          <button type="button"
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
        )}

        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[rgba(28,34,22,0.7)] text-[#fbf9f3] text-[12px] font-[var(--font-hanken)] px-3 py-1 rounded-full">
          <span>♪</span>
          <span>{dict.common.audio}</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        <ChapterBar
          teaching={teaching}
          positionSeconds={positionSeconds}
          currentChapterIndex={currentChapterIndexFor(teaching, positionSeconds)}
          onSeekClick={handleSeekClick}
          onChapterClick={handleChapterClick}
          dict={dict}
          lang={lang}
        />

        <div className="flex items-center gap-3">
          {/* Bouton précédent */}
          {previousTeaching && (
            <button type="button"
              onClick={() => handleNavigateTo(previousTeaching)}
              className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)] flex items-center gap-1"
              aria-label={lang === "ar" ? "السابق" : "Précédent"}
              title={previousTeaching.title}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">{lang === "ar" ? "السابق" : "Préc."}</span>
            </button>
          )}

          <button type="button"
            onClick={() => (isThisLoaded ? seek(Math.max(0, positionSeconds - 15)) : play(teaching, 0))}
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.rewindAria}
            dir="ltr"
          >
            −15s
          </button>

          <button type="button"
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full bg-[#b58a3c] flex items-center justify-center text-[#fbf9f3] hover:bg-[#9e7832] transition-colors shrink-0"
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

          <button type="button"
            onClick={() =>
              isThisLoaded ? seek(Math.min(teaching.durationSeconds, positionSeconds + 30)) : play(teaching, 0)
            }
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.forwardAria}
            dir="ltr"
          >
            +30s
          </button>

          {/* Bouton suivant */}
          {nextTeaching && (
            <button type="button"
              onClick={() => handleNavigateTo(nextTeaching)}
              className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)] flex items-center gap-1"
              aria-label={lang === "ar" ? "التالي" : "Suivant"}
              title={nextTeaching.title}
            >
              <span className="hidden sm:inline">{lang === "ar" ? "التالي" : "Suiv."}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <span dir="ltr" className="font-[var(--font-hanken)] text-[12px] tabular-nums text-[rgba(251,249,243,0.6)] shrink-0">
            {fmtTime(positionSeconds)} / {teaching.duration}
          </span>

          <div className="ml-auto flex items-center gap-3">
            <SpeedControl rate={playbackRate} onChange={setPlaybackRate} dict={dict} />
            <VolumeControl volume={volume} muted={muted} onVolumeChange={setVolume} onToggleMute={toggleMute} dict={dict} />
            <CopyTimestampButton positionSeconds={positionSeconds} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoTeachingPlayer({ teaching, dict, lang, seriesEpisodes, relatedTeachings }: TeachingPlayerProps) {
  const { updateProgress, getProgress } = useProgress();
  const { volume, muted, playbackRate, setVolume, toggleMute, setPlaybackRate } = useVolume();
  const initialTimestamp = useInitialTimestamp();
  const playerRef = useRef<YoutubePlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(() => {
    const saved = getProgress(teaching.id);
    return saved && !saved.completed ? saved.positionSeconds : 0;
  });

  const nextTeaching = findNextTeaching(teaching, seriesEpisodes, relatedTeachings);
  const previousTeaching = findPreviousTeaching(teaching, seriesEpisodes, relatedTeachings);

  // Applique les préférences persistées (volume/muet/vitesse) dès que le lecteur est prêt,
  // et se positionne sur le lien profond ?t= éventuel.
  function handleReady() {
    setIsReady(true);
    playerRef.current?.setVolume(volume);
    playerRef.current?.setMuted(muted);
    playerRef.current?.setPlaybackRate(playbackRate);
    if (initialTimestamp !== null) {
      playerRef.current?.seekTo(initialTimestamp);
      setPositionSeconds(initialTimestamp);
    }
  }

  // Filet de sécurité : un ID mal formé ne déclenche parfois ni onReady ni
  // onError (le lecteur reste bloqué en silence) — au bout de 10s sans
  // signal, on bascule sur le message d'erreur plutôt que de laisser
  // tourner le spinner indéfiniment.
  useEffect(() => {
    if (isReady) return;
    const timeout = setTimeout(() => setHasError(true), 10000);
    return () => clearTimeout(timeout);
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    playerRef.current?.setVolume(volume);
  }, [isReady, volume]);
  useEffect(() => {
    if (!isReady) return;
    playerRef.current?.setMuted(muted);
  }, [isReady, muted]);
  useEffect(() => {
    if (!isReady) return;
    playerRef.current?.setPlaybackRate(playbackRate);
  }, [isReady, playbackRate]);

  // Polling léger pendant la lecture — lit l'état réel du lecteur YouTube,
  // ne simule rien (contrairement à l'ancien minuteur factice).
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const pos = Math.floor(playerRef.current?.getCurrentTime() ?? 0);
      setPositionSeconds(pos);
      updateProgress(teaching.id, pos, teaching.durationSeconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, teaching.id, teaching.durationSeconds, updateProgress]);

  function handleStateChange(ytState: number) {
    if (ytState === YT_PLAYER_STATE.PLAYING) setIsPlaying(true);
    else if (ytState === YT_PLAYER_STATE.PAUSED || ytState === YT_PLAYER_STATE.ENDED) setIsPlaying(false);

    // Lecture automatique de l'épisode suivant à la fin
    if (ytState === YT_PLAYER_STATE.ENDED && nextTeaching) {
      // Redirection vers l'épisode suivant après un court délai
      setTimeout(() => {
        window.location.href = `/bibliotheque/${nextTeaching.id}`;
      }, 1500);
    }
  }

  function handlePlayPause() {
    if (isPlaying) playerRef.current?.pause();
    else playerRef.current?.play();
  }

  function handleNavigateTo(teaching: Teaching) {
    window.location.href = `/bibliotheque/${teaching.id}`;
  }

  function seekAndDisplay(t: number) {
    playerRef.current?.seekTo(t);
    setPositionSeconds(t);
  }

  // Raccourcis clavier — actifs tant que cette page est affichée.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekAndDisplay(Math.max(0, positionSeconds - 5));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekAndDisplay(Math.min(teaching.durationSeconds, positionSeconds + 5));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, positionSeconds, teaching.durationSeconds]);

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekAndDisplay(Math.floor(ratio * teaching.durationSeconds));
  }

  if (!teaching.youtubeId && !teaching.videoUrl) {
    return (
      <div className="bg-[#232a20] rounded-[14px] overflow-hidden flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
        <p className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.6)]">
          {lang === "ar" ? "الفيديو غير متوفر بعد" : "Vidéo pas encore disponible"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#232a20] rounded-[14px] overflow-hidden">
      <div className="relative" style={{ aspectRatio: "16/9" }}>
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.75)]">{dict.library.errorVideo}</p>
          </div>
        ) : (
          <>
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 border-2 border-[rgba(251,249,243,0.25)] border-t-[#b58a3c] rounded-full animate-spin" />
                <span className="sr-only">{dict.library.loadingVideo}</span>
              </div>
            )}
            {teaching.youtubeId ? (
              <YoutubePlayer
                ref={playerRef}
                videoId={teaching.youtubeId}
                onStateChange={handleStateChange}
                onError={() => setHasError(true)}
                onReady={handleReady}
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <NativeVideoPlayer
                ref={playerRef}
                src={teaching.videoUrl!}
                onStateChange={handleStateChange}
                onError={() => setHasError(true)}
                onReady={handleReady}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            )}
          </>
        )}
      </div>

      <div className="px-5 py-4 space-y-3">
        <ChapterBar
          teaching={teaching}
          positionSeconds={positionSeconds}
          currentChapterIndex={currentChapterIndexFor(teaching, positionSeconds)}
          onSeekClick={handleSeekClick}
          onChapterClick={seekAndDisplay}
          dict={dict}
          lang={lang}
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Bouton précédent */}
          {previousTeaching && (
            <button type="button"
              onClick={() => handleNavigateTo(previousTeaching)}
              className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)] flex items-center gap-1"
              aria-label={lang === "ar" ? "السابق" : "Précédent"}
              title={previousTeaching.title}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">{lang === "ar" ? "السابق" : "Préc."}</span>
            </button>
          )}

          <button type="button"
            onClick={() => seekAndDisplay(Math.max(0, positionSeconds - 15))}
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.rewindAria}
            dir="ltr"
          >
            −15s
          </button>

          <button type="button"
            onClick={handlePlayPause}
            className="w-9 h-9 rounded-full bg-[#b58a3c] flex items-center justify-center text-[#fbf9f3] hover:bg-[#9e7832] transition-colors shrink-0"
            aria-label={isPlaying ? dict.common.pause : dict.common.play}
          >
            {isPlaying ? (
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

          <button type="button"
            onClick={() => seekAndDisplay(Math.min(teaching.durationSeconds, positionSeconds + 30))}
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.forwardAria}
            dir="ltr"
          >
            +30s
          </button>

          {/* Bouton suivant */}
          {nextTeaching && (
            <button type="button"
              onClick={() => handleNavigateTo(nextTeaching)}
              className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)] flex items-center gap-1"
              aria-label={lang === "ar" ? "التالي" : "Suivant"}
              title={nextTeaching.title}
            >
              <span className="hidden sm:inline">{lang === "ar" ? "التالي" : "Suiv."}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <span dir="ltr" className="font-[var(--font-hanken)] text-[12px] tabular-nums text-[rgba(251,249,243,0.6)] shrink-0">
            {fmtTime(positionSeconds)} / {teaching.duration}
          </span>

          <div className="ml-auto flex items-center gap-3 flex-wrap">
            <SpeedControl rate={playbackRate} onChange={setPlaybackRate} dict={dict} />
            <VolumeControl volume={volume} muted={muted} onVolumeChange={setVolume} onToggleMute={toggleMute} dict={dict} />
            <CopyTimestampButton positionSeconds={positionSeconds} lang={lang} />
            {teaching.youtubeId && (
              <a
                href={buildYoutubeWatchUrl(teaching.youtubeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-[var(--font-hanken)] text-[12px] font-medium text-[#b58a3c] hover:text-[#cda350] transition-colors whitespace-nowrap"
              >
                {lang === "ar" ? "مشاهدة على يوتيوب ↗" : "Voir sur YouTube ↗"}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
