"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Series, Teaching, Theme, Language } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { apiRoutes } from "@/lib/api-routes";

const THEME_LABELS: Record<Theme, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
  rappel: "Rappel",
};
const THEMES = Object.keys(THEME_LABELS) as Theme[];
const LANGUAGES: Language[] = ["wolof", "arabe"];

export default function SeriesAdminPage() {
  const toast = useToast();
  const [items, setItems] = useState<Series[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Series | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiRoutes.series()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.teachings()).then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(([seriesData, teachingsData]: [{ series: Series[] }, { teachings: Teaching[] }]) => {
        if (cancelled) return;
        setItems(seriesData.series);
        setTeachings(teachingsData.teachings);
      })
      .catch(() => {
        if (!cancelled) toast("Impossible de charger les séries", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  function getSeriesEpisodes(seriesId: string) {
    return teachings.filter((t) => t.seriesId === seriesId);
  }

  function openNew() {
    setEditItem({ id: "", title: "", description: "", theme: "tafsir", language: "wolof", totalEpisodes: 1 });
    setIsNew(true);
  }

  async function handleDelete() {
    const id = deleteId;
    if (!id) return;
    try {
      const res = await fetch(apiRoutes.seriesItem(id), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((s) => s.id !== id));
      toast("Série supprimée", "success");
    } catch {
      toast("Échec de la suppression", "error");
    }
    setDeleteId(null);
  }

  async function handleSaveEdit() {
    if (!editItem) return;
    try {
      if (isNew) {
        const res = await fetch(apiRoutes.series(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editItem),
        });
        if (!res.ok) throw new Error();
        const { series } = await res.json();
        setItems((prev) => [...prev, series]);
        toast("Série ajoutée", "success");
      } else {
        const res = await fetch(apiRoutes.seriesItem(editItem.id), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editItem),
        });
        if (!res.ok) throw new Error();
        const { series } = await res.json();
        setItems((prev) => prev.map((s) => (s.id === series.id ? series : s)));
        toast("Série mise à jour", "success");
      }
      setEditItem(null);
      setIsNew(false);
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
            <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
            {" / "}Séries
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">Séries</h1>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] rounded-[10px] font-[var(--font-hanken)] text-[13.5px] font-semibold transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle série
        </button>
      </div>

      {loading ? (
        <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-20 text-center">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d8d0bf" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="18" height="4" rx="1" />
          </svg>
          <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucune série pour l&apos;instant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((s) => {
            const episodes = getSeriesEpisodes(s.id);
            const progress = Math.round((episodes.length / s.totalEpisodes) * 100);
            return (
              <div key={s.id} className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden hover:border-[#d0c9b8] transition-colors group">
                <div className="bg-[#3c4a37] px-5 py-4">
                  {s.arabicVerse && (
                    <p className="arabic text-[#cda350] text-[14px] text-right mb-1">{s.arabicVerse}</p>
                  )}
                  <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#cda350] font-semibold mb-0.5">
                    {THEME_LABELS[s.theme] ?? s.theme}
                  </p>
                  <h3 className="font-[var(--font-cormorant)] font-semibold text-[18px] text-[#fbf9f3] leading-tight">
                    {s.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="font-[var(--font-hanken)] text-[12.5px] text-[#6f7363] leading-relaxed mb-4 line-clamp-2">
                    {s.description}
                  </p>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483]">
                        {episodes.length} / {s.totalEpisodes} épisodes publiés
                      </span>
                      <span className="font-[var(--font-hanken)] text-[11px] font-semibold text-[#b58a3c]">{progress}%</span>
                    </div>
                    <div className="h-[5px] bg-[#e2dac9] rounded-full">
                      <div className="h-full bg-[#b58a3c] rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] capitalize">{s.language}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditItem({ ...s })}
                        className="px-3 py-1.5 text-[12px] font-[var(--font-hanken)] font-medium text-[#b58a3c] hover:text-[#9e7832] border border-[#e2dac9] hover:border-[#b58a3c] rounded-[7px] transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeleteId(s.id)}
                        className="px-3 py-1.5 text-[12px] font-[var(--font-hanken)] font-medium text-[#8a2f29] border border-[#e2dac9] hover:border-[#8a2f29] rounded-[7px] transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer cette série ?"
        message="Tous les épisodes associés resteront dans la bibliothèque mais ne seront plus rattachés à cette série."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <Modal isOpen={!!editItem} title={isNew ? "Nouvelle série" : "Modifier la série"} onClose={() => { setEditItem(null); setIsNew(false); }}>
        {editItem && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Titre</label>
              <input
                value={editItem.title}
                onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={editItem.description}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Thème</label>
                <select
                  value={editItem.theme}
                  onChange={(e) => setEditItem({ ...editItem, theme: e.target.value as Theme })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                >
                  {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Langue</label>
                <select
                  value={editItem.language}
                  onChange={(e) => setEditItem({ ...editItem, language: e.target.value as Language })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                >
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Nombre total d&apos;épisodes prévus</label>
              <input
                type="number"
                min={1}
                value={editItem.totalEpisodes}
                onChange={(e) => setEditItem({ ...editItem, totalEpisodes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Verset arabe (optionnel)</label>
              <input
                value={editItem.arabicVerse ?? ""}
                onChange={(e) => setEditItem({ ...editItem, arabicVerse: e.target.value || undefined })}
                dir="rtl"
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-amiri)] text-[15px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setEditItem(null); setIsNew(false); }}
                className="flex-1 py-2.5 border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-medium text-[#6f7363] hover:bg-[#f0ece3] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#fbf9f3] transition-colors"
              >
                {isNew ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
