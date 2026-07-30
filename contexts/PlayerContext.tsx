"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import type { Teaching, PlayerState } from "@/lib/types";
import { useProgress } from "@/hooks/useProgress";

interface PlayerContextValue {
  state: PlayerState;
  play: (teaching: Teaching, startSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    teaching: null,
    isPlaying: false,
    positionSeconds: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { updateProgress } = useProgress();

  const play = useCallback((teaching: Teaching, startSeconds = 0) => {
    setState({ teaching, isPlaying: true, positionSeconds: startSeconds });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
    audioRef.current?.play().catch(() => {});
  }, []);

  const seek = useCallback((seconds: number) => {
    setState((prev) => ({ ...prev, positionSeconds: seconds }));
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  const close = useCallback(() => {
    audioRef.current?.pause();
    setState({ teaching: null, isPlaying: false, positionSeconds: 0 });
  }, []);

  // Charge le fichier réel dès qu'un enseignement audio devient l'élément actif.
  // Le ref évite de relancer .play()/réassigner .src à chaque tick de timeupdate.
  const loadedTeachingIdRef = useRef<string | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    const teaching = state.teaching;
    if (!teaching) {
      loadedTeachingIdRef.current = null;
      return;
    }
    if (!audio || teaching.type !== "audio" || loadedTeachingIdRef.current === teaching.id) return;

    loadedTeachingIdRef.current = teaching.id;
    audio.src = teaching.audioUrl ?? "";
    audio.currentTime = state.positionSeconds;
    if (state.isPlaying) audio.play().catch(() => {});
  }, [state.teaching, state.positionSeconds, state.isPlaying]);

  // Source de vérité réelle de la position : les événements du <audio>, pas un minuteur simulé.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function handleTimeUpdate() {
      const teaching = state.teaching;
      if (!teaching || !audio) return;
      const pos = Math.floor(audio.currentTime);
      setState((prev) => ({ ...prev, positionSeconds: pos }));
      updateProgress(teaching.id, pos, teaching.durationSeconds);
    }
    function handleEnded() {
      setState((prev) => ({ ...prev, isPlaying: false }));
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [state.teaching, updateProgress]);

  return (
    <PlayerContext.Provider value={{ state, play, pause, resume, seek, close }}>
      {children}
      {/* Toujours monté (pas conditionné à un teaching actif) pour que audioRef soit stable dès le premier play(). */}
      <audio ref={audioRef} className="hidden" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
