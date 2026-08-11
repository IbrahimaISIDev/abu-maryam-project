"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { YT_PLAYER_STATE } from "@/hooks/useYoutubePlayer";
import type { YoutubePlayerHandle } from "@/components/player/YoutubePlayer";

/** Même forme que YoutubePlayerHandle — TeachingPlayer pilote les deux lecteurs sans distinction. */
export type NativeVideoPlayerHandle = YoutubePlayerHandle;

interface NativeVideoPlayerProps {
  src: string;
  onStateChange?: (state: number) => void;
  onError?: (code: number) => void;
  onReady?: () => void;
  className?: string;
}

const NativeVideoPlayer = forwardRef<NativeVideoPlayerHandle, NativeVideoPlayerProps>(function NativeVideoPlayer(
  { src, onStateChange, onError, onReady, className = "" },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      seekTo: (seconds) => {
        if (videoRef.current) videoRef.current.currentTime = seconds;
      },
      getCurrentTime: () => videoRef.current?.currentTime ?? 0,
      getDuration: () => videoRef.current?.duration ?? 0,
      play: () => {
        videoRef.current?.play().catch(() => {});
      },
      pause: () => videoRef.current?.pause(),
      setVolume: (volume) => {
        if (videoRef.current) videoRef.current.volume = volume;
      },
      setMuted: (muted) => {
        if (videoRef.current) videoRef.current.muted = muted;
      },
      setPlaybackRate: (rate) => {
        if (videoRef.current) videoRef.current.playbackRate = rate;
      },
    }),
    []
  );

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      playsInline
      onLoadedMetadata={() => onReady?.()}
      onPlay={() => onStateChange?.(YT_PLAYER_STATE.PLAYING)}
      onPause={() => onStateChange?.(YT_PLAYER_STATE.PAUSED)}
      onEnded={() => onStateChange?.(YT_PLAYER_STATE.ENDED)}
      onError={() => onError?.(0)}
    />
  );
});

export default NativeVideoPlayer;
