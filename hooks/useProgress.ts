"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { TeachingProgress } from "@/lib/types";

const STORAGE_KEY = "abu-maryam-tv:progress";
const listeners = new Set<() => void>();
const emptySnapshot: Record<string, TeachingProgress> = {};
let cache: Record<string, TeachingProgress> | null = null;

function readFromStorage(): Record<string, TeachingProgress> {
  if (typeof window === "undefined") return emptySnapshot;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return emptySnapshot;
  }
}

function getSnapshot(): Record<string, TeachingProgress> {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function getServerSnapshot(): Record<string, TeachingProgress> {
  return emptySnapshot;
}

function commit(next: Record<string, TeachingProgress>) {
  cache = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateProgress = useCallback(
    (teachingId: string, positionSeconds: number, durationSeconds: number) => {
      const completed = positionSeconds / durationSeconds > 0.9;
      commit({
        ...getSnapshot(),
        [teachingId]: {
          teachingId,
          positionSeconds,
          completed,
          lastPlayedAt: new Date().toISOString(),
        },
      });
    },
    []
  );

  const markCompleted = useCallback((teachingId: string) => {
    const current = getSnapshot();
    commit({
      ...current,
      [teachingId]: {
        ...(current[teachingId] ?? {
          teachingId,
          positionSeconds: 0,
          lastPlayedAt: new Date().toISOString(),
        }),
        completed: true,
      },
    });
  }, []);

  const getProgress = useCallback(
    (teachingId: string): TeachingProgress | null => data[teachingId] ?? null,
    [data]
  );

  const getInProgress = useCallback((): TeachingProgress[] => {
    return Object.values(data)
      .filter((p) => !p.completed && p.positionSeconds > 10)
      .sort(
        (a, b) =>
          new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
      )
      .slice(0, 4);
  }, [data]);

  return { updateProgress, markCompleted, getProgress, getInProgress };
}
