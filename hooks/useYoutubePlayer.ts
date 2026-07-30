"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface YTPlayerInstance {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  destroy(): void;
}

interface YTPlayerEvent {
  data: number;
  target: YTPlayerInstance;
}

interface YTPlayerErrorEvent {
  data: number;
}

interface YTPlayerConstructorOptions {
  videoId: string;
  playerVars?: Record<string, number | string>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerErrorEvent) => void;
  };
}

interface YTNamespace {
  Player: new (el: HTMLElement, options: YTPlayerConstructorOptions) => YTPlayerInstance;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** États renvoyés par onStateChange — https://developers.google.com/youtube/iframe_api_reference#Events */
export const YT_PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
} as const;

let apiPromise: Promise<void> | null = null;

function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiPromise;
}

interface UseYoutubePlayerOptions {
  videoId: string;
  onStateChange?: (state: number) => void;
  onError?: (code: number) => void;
  onReady?: () => void;
}

export function useYoutubePlayer({ videoId, onStateChange, onError, onReady }: UseYoutubePlayerOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [isReady, setIsReady] = useState(false);

  const onStateChangeRef = useRef(onStateChange);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
    onErrorRef.current = onError;
    onReadyRef.current = onReady;
  }, [onStateChange, onError, onReady]);

  useEffect(() => {
    let destroyed = false;
    let player: YTPlayerInstance | undefined;

    loadYoutubeIframeApi().then(() => {
      if (destroyed || !containerRef.current || !window.YT) return;
      player = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0 },
        events: {
          onReady: () => {
            if (destroyed) return;
            playerRef.current = player ?? null;
            setIsReady(true);
            onReadyRef.current?.();
          },
          onStateChange: (event) => onStateChangeRef.current?.(event.data),
          onError: (event) => onErrorRef.current?.(event.data),
        },
      });
    });

    return () => {
      destroyed = true;
      setIsReady(false);
      player?.destroy();
      playerRef.current = null;
    };
  }, [videoId]);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const getCurrentTime = useCallback((): number => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  const playVideo = useCallback(() => playerRef.current?.playVideo(), []);
  const pauseVideo = useCallback(() => playerRef.current?.pauseVideo(), []);

  /** `volume` en 0–1, converti en 0–100 pour l'API YouTube. */
  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(Math.round(volume * 100));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (muted) playerRef.current?.mute();
    else playerRef.current?.unMute();
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
  }, []);

  return {
    containerRef,
    isReady,
    seekTo,
    getCurrentTime,
    playVideo,
    pauseVideo,
    setVolume,
    setMuted,
    setPlaybackRate,
  };
}
