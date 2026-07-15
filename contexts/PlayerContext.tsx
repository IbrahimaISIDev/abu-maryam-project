"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Teaching, PlayerState } from "@/lib/types";

interface PlayerContextValue {
  state: PlayerState;
  play: (teaching: Teaching, startSeconds?: number) => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  close: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    teaching: null,
    isPlaying: false,
    positionSeconds: 0,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  return (
    <PlayerContext.Provider value={{ state, play, pause, resume, seek, close, audioRef }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
