"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "abu-maryam-tv:volume";
const listeners = new Set<() => void>();

interface VolumeState {
  volume: number; // 0–1
  muted: boolean;
  playbackRate: number;
}

const defaultState: VolumeState = { volume: 1, muted: false, playbackRate: 1 };
let cache: VolumeState | null = null;

function readFromStorage(): VolumeState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      volume: typeof parsed.volume === "number" ? parsed.volume : 1,
      muted: Boolean(parsed.muted),
      playbackRate: typeof parsed.playbackRate === "number" ? parsed.playbackRate : 1,
    };
  } catch {
    return defaultState;
  }
}

function getSnapshot(): VolumeState {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): VolumeState {
  return defaultState;
}

function commit(next: VolumeState) {
  cache = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Volume, muet et vitesse de lecture — persistés en localStorage, partagés entre le lecteur audio et vidéo. */
export function useVolume() {
  const { volume, muted, playbackRate } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, next));
    commit({ ...getSnapshot(), volume: clamped, muted: clamped === 0 });
  }, []);

  const toggleMute = useCallback(() => {
    commit({ ...getSnapshot(), muted: !getSnapshot().muted });
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    commit({ ...getSnapshot(), playbackRate: rate });
  }, []);

  return { volume, muted, playbackRate, setVolume, toggleMute, setPlaybackRate };
}
