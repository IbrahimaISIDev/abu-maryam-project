"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";

export interface YoutubePlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
}

interface YoutubePlayerProps {
  videoId: string;
  onStateChange?: (state: number) => void;
  onError?: (code: number) => void;
  onReady?: () => void;
  className?: string;
}

const YoutubePlayer = forwardRef<YoutubePlayerHandle, YoutubePlayerProps>(function YoutubePlayer(
  { videoId, onStateChange, onError, onReady, className = "" },
  ref
) {
  const {
    containerRef,
    seekTo,
    getCurrentTime,
    playVideo,
    pauseVideo,
    setVolume,
    setMuted,
    setPlaybackRate,
  } = useYoutubePlayer({ videoId, onStateChange, onError, onReady });

  useImperativeHandle(
    ref,
    () => ({ seekTo, getCurrentTime, play: playVideo, pause: pauseVideo, setVolume, setMuted, setPlaybackRate }),
    [seekTo, getCurrentTime, playVideo, pauseVideo, setVolume, setMuted, setPlaybackRate]
  );

  return <div ref={containerRef} className={className} />;
});

export default YoutubePlayer;
