"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { LiveStatus } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import { apiRoutes } from "@/lib/api-routes";

export default function DirectAdminPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [channelId, setChannelId] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(apiRoutes.live())
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { liveStatus: LiveStatus | null; youtubeApiKeyConfigured: boolean }) => {
        if (cancelled) return;
        setApiKeyConfigured(data.youtubeApiKeyConfigured);
        if (!data.liveStatus) return;
        setIsLive(data.liveStatus.isLive);
        setLiveTitle(data.liveStatus.title ?? "");
        setChannelId(data.liveStatus.youtubeChannelId ?? "");
      })
      .catch(() => {
        if (!cancelled) toast("Impossible de charger le statut du direct", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  function markDirty() {
    setIsDirty(true);
  }

  async function handleSave() {
    try {
      const res = await fetch(apiRoutes.live(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive, title: liveTitle, youtubeChannelId: channelId || null }),
      });
      if (!res.ok) throw new Error();
      setIsDirty(false);
      toast("Configuration du direct enregistrée", "success");
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
          <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
          {" / "}En direct
        </p>
        <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">En direct</h1>
        <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] mt-1">
          Configuration du flux en direct YouTube
        </p>
      </div>

      <div className="max-w-[560px] space-y-5">
        {/* Statut de la détection automatique */}
        {channelId && apiKeyConfigured ? (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[rgba(60,74,55,0.08)] border border-[rgba(60,74,55,0.2)] rounded-[10px]">
            <span className="w-2 h-2 mt-1 rounded-full bg-[#3c4a37] shrink-0" />
            <p className="font-[var(--font-hanken)] text-[12.5px] text-[#3c4a37] leading-relaxed">
              <strong>Détection automatique active.</strong> Le site vérifie lui-même si la chaîne
              diffuse (toutes les ~30 min) et met à jour le bandeau « En direct » sans action de
              votre part. Le statut ci-dessous ne sert que de repli si la vérification échoue.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[rgba(181,138,60,0.1)] border border-[rgba(181,138,60,0.3)] rounded-[10px]">
            <span className="w-2 h-2 mt-1 rounded-full bg-[#b58a3c] shrink-0" />
            <p className="font-[var(--font-hanken)] text-[12.5px] text-[#7a5a26] leading-relaxed">
              <strong>Bascule manuelle.</strong>{" "}
              {!channelId
                ? "Renseignez l'ID de la chaîne YouTube ci-dessous pour activer la détection automatique."
                : "YOUTUBE_API_KEY n'est pas configurée sur le serveur — voir GUIDE_YOUTUBE_API_KEY.md."}{" "}
              En attendant, le statut ci-dessous est celui affiché sur le site.
            </p>
          </div>
        )}

        {/* Statut live */}
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20] mb-0.5">Statut du direct</h2>
              <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483]">
                {channelId && apiKeyConfigured
                  ? "Repli manuel — ignoré tant que la détection automatique fonctionne"
                  : "Activer affiche le bandeau \"En direct\" sur la plateforme"}
              </p>
            </div>
            <button
              onClick={() => { setIsLive((v) => !v); markDirty(); }}
              className={`relative w-12 h-6 rounded-full transition-colors ${isLive ? "bg-[#3c4a37]" : "bg-[#d8d0bf]"}`}
              aria-pressed={isLive}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isLive ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[rgba(60,74,55,0.08)] rounded-[8px]">
              <span className="w-2 h-2 rounded-full bg-[#e84040] animate-pulse" />
              <span className="font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#3c4a37]">
                Diffusion active — visible par les visiteurs
              </span>
            </div>
          )}
        </div>

        {/* Titre du direct */}
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] p-6">
          <label className="block font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#9a9483] uppercase tracking-wider mb-2">
            Titre affiché
          </label>
          <input
            type="text"
            value={liveTitle}
            onChange={(e) => { setLiveTitle(e.target.value); markDirty(); }}
            placeholder="Ex : Cours sur la Salât — Vendredi 16h"
            className="w-full px-4 py-3 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[10px] font-[var(--font-hanken)] text-[14px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c]"
          />
        </div>

        {/* ID chaîne YouTube */}
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] p-6">
          <label className="block font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
            ID Chaîne YouTube
          </label>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mb-3">
            Commence par <code className="bg-[#e9e3d4] px-1 py-0.5 rounded text-[11px]">UC…</code> — trouvable dans les paramètres de la chaîne YouTube.
          </p>
          <input
            type="text"
            value={channelId}
            onChange={(e) => { setChannelId(e.target.value); markDirty(); }}
            placeholder="UCxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[10px] font-[var(--font-hanken)] text-[14px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c] font-mono"
          />
          {!channelId && (
            <p className="font-[var(--font-hanken)] text-[12px] text-[#b58a3c] mt-2">
              ⚠ Sans ID, le lecteur affiche un placeholder sur la page En direct.
            </p>
          )}
        </div>

        {/* Bouton sauvegarder */}
        <button
          onClick={handleSave}
          disabled={!isDirty || loading}
          className={`w-full py-3 rounded-[10px] font-[var(--font-hanken)] text-[14px] font-semibold transition-all ${
            isDirty && !loading
              ? "bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3]"
              : "bg-[#e9e3d4] text-[#9a9483] cursor-not-allowed"
          }`}
        >
          {loading ? "Chargement…" : isDirty ? "Enregistrer les modifications" : "Aucune modification en attente"}
        </button>
      </div>
    </div>
  );
}
