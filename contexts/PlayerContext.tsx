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
import { useVolume } from "@/hooks/useVolume";

interface PlayerContextValue {
  state: PlayerState;
  volume: number;
  muted: boolean;
  playbackRate: number;
  play: (teaching: Teaching, startSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  close: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  registerOnEnded: (callback: () => void) => () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    teaching: null,
    isPlaying: false,
    positionSeconds: 0,
    hasError: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedCallbacksRef = useRef<Set<() => void>>(new Set());
  const { updateProgress } = useProgress();
  const { volume, muted, playbackRate, setVolume, toggleMute, setPlaybackRate } = useVolume();

  const play = useCallback((teaching: Teaching, startSeconds = 0) => {
    setState({ teaching, isPlaying: true, positionSeconds: startSeconds, hasError: false });
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
    setState({ teaching: null, isPlaying: false, positionSeconds: 0, hasError: false });
  }, []);

  const registerOnEnded = useCallback((callback: () => void) => {
    onEndedCallbacksRef.current.add(callback);
    return () => {
      onEndedCallbacksRef.current.delete(callback);
    };
  }, []);

  // Volume/muet/vitesse s'appliquent en continu à l'élément réel.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
    audio.playbackRate = playbackRate;
  }, [volume, muted, playbackRate]);

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
    audio.volume = volume;
    audio.muted = muted;
    audio.playbackRate = playbackRate;
    if (state.isPlaying) audio.play().catch(() => {});
  }, [state.teaching, state.positionSeconds, state.isPlaying, volume, muted, playbackRate]);

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
      // Appeler tous les callbacks enregistrés pour la lecture automatique
      onEndedCallbacksRef.current.forEach((cb) => cb());
    }
    function handleError() {
      if (!audio || !audio.src) return; // pas de source assignée pour l'instant, pas une vraie erreur
      setState((prev) => ({ ...prev, isPlaying: false, hasError: true }));
    }

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [state.teaching, updateProgress]);

  // Media Session API — contrôles de l'écran verrouillé / casque sur mobile.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const teaching = state.teaching;
    if (!teaching) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: teaching.title,
      artist: "Oustaz Niang Mbaye (H.A)",
      album: "Abu Maryam TV",
    });
    navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", resume);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("seekbackward", () => seek(Math.max(0, state.positionSeconds - 15)));
    navigator.mediaSession.setActionHandler("seekforward", () =>
      seek(Math.min(teaching.durationSeconds, state.positionSeconds + 30))
    );
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (typeof details.seekTime === "number") seek(details.seekTime);
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [state.teaching, state.isPlaying, state.positionSeconds, pause, resume, seek]);

  return (
    <PlayerContext.Provider
      value={{ state, volume, muted, playbackRate, play, pause, resume, seek, close, setVolume, toggleMute, setPlaybackRate, registerOnEnded }}
    >
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
