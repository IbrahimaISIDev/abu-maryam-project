"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useProgress } from "@/hooks/useProgress";
import YoutubePlayer, { type YoutubePlayerHandle } from "@/components/player/YoutubePlayer";
import { YT_PLAYER_STATE } from "@/hooks/useYoutubePlayer";
import type { Teaching } from "@/lib/types";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { getChapterLabel } from "@/lib/content-i18n";

interface TeachingPlayerProps {
  teaching: Teaching;
  dict: Dictionary;
  lang: Locale;
}

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
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
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-[var(--font-hanken)] font-medium border transition-colors ${
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

function currentChapterIndexFor(teaching: Teaching, positionSeconds: number): number {
  return teaching.chapters
    ? teaching.chapters.reduce((acc, ch, i) => (ch.timeSeconds <= positionSeconds ? i : acc), -1)
    : -1;
}

export default function TeachingPlayer(props: TeachingPlayerProps) {
  if (props.teaching.type === "video") return <VideoTeachingPlayer {...props} />;
  return <AudioTeachingPlayer {...props} />;
}

function AudioTeachingPlayer({ teaching, dict, lang }: TeachingPlayerProps) {
  const { state, play, pause, resume, seek } = usePlayer();

  const isThisLoaded = state.teaching?.id === teaching.id;
  const isThisPlaying = isThisLoaded && state.isPlaying;
  const positionSeconds = isThisLoaded ? state.positionSeconds : 0;

  function handlePlayPause() {
    if (!isThisLoaded) play(teaching, 0);
    else if (isThisPlaying) pause();
    else resume();
  }

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

          <span dir="ltr" className="ml-auto font-[var(--font-hanken)] text-[12px] tabular-nums text-[rgba(251,249,243,0.6)]">
            {fmtTime(positionSeconds)} / {teaching.duration}
          </span>
        </div>
      </div>
    </div>
  );
}

function VideoTeachingPlayer({ teaching, dict, lang }: TeachingPlayerProps) {
  const { updateProgress, getProgress } = useProgress();
  const playerRef = useRef<YoutubePlayerHandle>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(() => {
    const saved = getProgress(teaching.id);
    return saved && !saved.completed ? saved.positionSeconds : 0;
  });

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
  }

  function handlePlayPause() {
    if (isPlaying) playerRef.current?.pause();
    else playerRef.current?.play();
  }

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newPos = Math.floor(ratio * teaching.durationSeconds);
    playerRef.current?.seekTo(newPos);
    setPositionSeconds(newPos);
  }

  function seekAndDisplay(t: number) {
    playerRef.current?.seekTo(t);
    setPositionSeconds(t);
  }

  if (!teaching.youtubeId) {
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
        <YoutubePlayer
          videoId={teaching.youtubeId}
          onStateChange={handleStateChange}
          className="absolute inset-0 w-full h-full"
        />
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

        <div className="flex items-center gap-3">
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
            className="w-9 h-9 rounded-full bg-[#b58a3c] flex items-center justify-center text-[#fbf9f3] hover:bg-[#9e7832] transition-colors"
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
            onClick={() => playerRef.current?.seekTo(Math.min(teaching.durationSeconds, positionSeconds + 30))}
            className="text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors text-[12px] font-[var(--font-hanken)]"
            aria-label={dict.live.forwardAria}
            dir="ltr"
          >
            +30s
          </button>

          <span dir="ltr" className="ml-auto font-[var(--font-hanken)] text-[12px] tabular-nums text-[rgba(251,249,243,0.6)]">
            {fmtTime(positionSeconds)} / {teaching.duration}
          </span>

          <a
            href={`https://www.youtube.com/watch?v=${teaching.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-[var(--font-hanken)] text-[12px] font-medium text-[#b58a3c] hover:text-[#cda350] transition-colors whitespace-nowrap"
          >
            {lang === "ar" ? "مشاهدة على يوتيوب ↗" : "Voir sur YouTube ↗"}
          </a>
        </div>
      </div>
    </div>
  );
}
