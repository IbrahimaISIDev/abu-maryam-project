"use client";

import { useRef, useState } from "react";
import { apiRoutes } from "@/lib/api-routes";
import Image from "next/image";

interface MediaUploaderProps {
  kind: "audio" | "video" | "image";
  currentUrl: string | null;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
}

const ACCEPT: Record<MediaUploaderProps["kind"], string> = {
  audio: "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,audio/x-m4a",
  video: "video/mp4,video/webm,video/quicktime,video/x-matroska",
  image: "image/jpeg,image/jpg,image/png,image/webp,image/avif",
};

function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? url);
  } catch {
    return url;
  }
}

export default function MediaUploader({ kind, currentUrl, onUploaded, onRemove }: MediaUploaderProps) {
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

  // ─── Image kind: special visual upload zone ────────────────────────────────
  if (kind === "image") {
    return (
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.image}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        {currentUrl ? (
          // Preview of uploaded image
          <div className="relative group w-full rounded-[9px] overflow-hidden border border-[#d8d0bf] bg-[#f5f1e8]"
               style={{ aspectRatio: "16/9" }}>
            <Image
              src={currentUrl}
              alt="Vignette"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Overlay actions on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={progress !== null}
                className="px-3 py-2 bg-white text-[#232a20] rounded-[8px] font-[var(--font-hanken)] text-[12px] font-semibold hover:bg-[#f5f1e8] transition-colors"
              >
                {progress !== null ? `${progress}%…` : "Remplacer"}
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-3 py-2 bg-[#8a2f29] text-white rounded-[8px] font-[var(--font-hanken)] text-[12px] font-semibold hover:bg-[#7a2923] transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ) : (
          // Drop zone when no image uploaded yet
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="w-full border-2 border-dashed border-[#d8d0bf] hover:border-[#b58a3c] rounded-[9px] bg-[#f5f1e8] hover:bg-[#f0ece3] transition-colors flex flex-col items-center justify-center gap-2 py-6 px-4"
            style={{ aspectRatio: "16/9" }}
          >
            {progress !== null ? (
              <>
                <div className="w-full h-1.5 bg-[#e2dac9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#b58a3c] transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
                <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">Envoi… {progress}%</p>
              </>
            ) : (
              <>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b58a3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#6f7363]">
                  Cliquer pour ajouter une vignette
                </p>
                <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">
                  JPG, PNG, WebP — ratio 16:9 recommandé
                </p>
              </>
            )}
          </button>
        )}

        {error && (
          <p className="mt-1.5 font-[var(--font-hanken)] text-[11.5px] text-[#8a2f29]">{error}</p>
        )}
      </div>
    );
  }

  // ─── Audio / Video kind: original compact uploader ────────────────────────
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
