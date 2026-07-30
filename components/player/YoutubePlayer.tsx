"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";

export interface YoutubePlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  play: () => void;
  pause: () => void;
}

interface YoutubePlayerProps {
  videoId: string;
  onStateChange?: (state: number) => void;
  className?: string;
}

const YoutubePlayer = forwardRef<YoutubePlayerHandle, YoutubePlayerProps>(function YoutubePlayer(
  { videoId, onStateChange, className = "" },
  ref
) {
  const { containerRef, seekTo, getCurrentTime, playVideo, pauseVideo } = useYoutubePlayer({
    videoId,
    onStateChange,
  });

  useImperativeHandle(
    ref,
    () => ({ seekTo, getCurrentTime, play: playVideo, pause: pauseVideo }),
    [seekTo, getCurrentTime, playVideo, pauseVideo]
  );

  return <div ref={containerRef} className={className} />;
});

export default YoutubePlayer;
