"use client";

import { useState, useEffect, useCallback } from "react";
import type { TeachingProgress } from "@/lib/types";

const STORAGE_KEY = "abu-maryam-tv:progress";

function loadProgress(): Record<string, TeachingProgress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveProgress(data: Record<string, TeachingProgress>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [data, setData] = useState<Record<string, TeachingProgress>>({});

  useEffect(() => {
    setData(loadProgress());
  }, []);

  const updateProgress = useCallback(
    (teachingId: string, positionSeconds: number, durationSeconds: number) => {
      setData((prev) => {
        const completed = positionSeconds / durationSeconds > 0.9;
        const next: Record<string, TeachingProgress> = {
          ...prev,
          [teachingId]: {
            teachingId,
            positionSeconds,
            completed,
            lastPlayedAt: new Date().toISOString(),
          },
        };
        saveProgress(next);
        return next;
      });
    },
    []
  );

  const markCompleted = useCallback((teachingId: string) => {
    setData((prev) => {
      const next = {
        ...prev,
        [teachingId]: {
          ...(prev[teachingId] ?? {
            teachingId,
            positionSeconds: 0,
            lastPlayedAt: new Date().toISOString(),
          }),
          completed: true,
        },
      };
      saveProgress(next);
      return next;
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
