"use client";

import { useRef, useState } from "react";
import { apiRoutes } from "@/lib/api-routes";

interface MediaUploaderProps {
  kind: "audio" | "video";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}

const ACCEPT: Record<MediaUploaderProps["kind"], string> = {
  audio: "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,audio/x-m4a",
  video: "video/mp4,video/webm,video/quicktime,video/x-matroska",
};

function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

export default function MediaUploader({ kind, currentUrl, onUploaded }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);
    try {
      const presignRes = await fetch(apiRoutes.mediaPresign(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, kind }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignData.error ?? "Échec de préparation de l'envoi");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignData.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error("Échec de l'envoi vers le stockage"));
        xhr.onerror = () => reject(new Error("Échec de l'envoi vers le stockage"));
        xhr.send(file);
      });

      onUploaded(presignData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="shrink-0 px-4 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] disabled:opacity-50 disabled:cursor-not-allowed text-[#fbf9f3] rounded-[9px] font-[var(--font-hanken)] text-[13px] font-semibold transition-colors"
        >
          {progress !== null ? `Envoi… ${progress}%` : currentUrl ? "Remplacer le fichier" : "Choisir un fichier"}
        </button>
        {currentUrl && progress === null && (
          <span
            className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] truncate max-w-[220px]"
            dir="ltr"
            title={currentUrl}
          >
            {fileNameFromUrl(currentUrl)}
          </span>
        )}
      </div>
      {progress !== null && (
        <div className="mt-2 h-1.5 bg-[#e2dac9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#b58a3c] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && (
        <p className="mt-1.5 font-[var(--font-hanken)] text-[11.5px] text-[#8a2f29]">{error}</p>
      )}
    </div>
  );
}
