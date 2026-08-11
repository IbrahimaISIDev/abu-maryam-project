"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Series, Teaching, Theme, Language, AgendaItem } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import Modal from "@/components/ui/Modal";
import TeachingFormModal from "@/components/admin/TeachingFormModal";
import { apiRoutes } from "@/lib/api-routes";
import { formatDurationString } from "@/lib/youtube";

const THEME_LABELS: Record<Theme, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
  rappel: "Rappel",
};
const THEMES = Object.keys(THEME_LABELS) as Theme[];
const LANGUAGES: Language[] = ["wolof", "arabe"];

export default function SeriesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSeries, setEditSeries] = useState<Series | null>(null);
  const [editTeaching, setEditTeaching] = useState<Teaching | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiRoutes.series()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.teachings()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.agenda()).then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(
        ([seriesData, teachingsData, agendaData]: [
          { series: Series[] },
          { teachings: Teaching[] },
          { agendaItems: AgendaItem[] },
        ]) => {
          if (cancelled) return;
          setSeriesList(seriesData.series);
          setTeachings(teachingsData.teachings);
          setAgendaItems(agendaData.agendaItems);
        }
      )
      .catch(() => {
        if (!cancelled) toast("Impossible de charger la série", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const series = seriesList.find((s) => s.id === id);
  const episodes = [...teachings.filter((t) => t.seriesId === id)].sort((a, b) => {
    if (a.episodeNumber != null && b.episodeNumber != null) return a.episodeNumber - b.episodeNumber;
    if (a.episodeNumber != null) return -1;
    if (b.episodeNumber != null) return 1;
    return a.publishedAt.localeCompare(b.publishedAt);
  });

  const progress = series ? Math.round((episodes.length / series.totalEpisodes) * 100) : 0;
  const totalPlatformViews = episodes.reduce((s, t) => s + t.platformViews, 0);
  const totalDurationSeconds = episodes.reduce((s, t) => s + t.durationSeconds, 0);

  async function handleSaveSeries() {
    if (!editSeries) return;
    try {
      const res = await fetch(apiRoutes.seriesItem(editSeries.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSeries),
      });
      if (!res.ok) throw new Error();
      const { series: updated } = await res.json();
      setSeriesList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast("Série mise à jour", "success");
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
    setEditSeries(null);
  }

  async function handleSaveTeaching() {
    if (!editTeaching) return;
    try {
      const res = await fetch(apiRoutes.teaching(editTeaching.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTeaching),
      });
      if (!res.ok) throw new Error();
      const { teaching } = await res.json();
      setTeachings((prev) => prev.map((t) => (t.id === teaching.id ? teaching : t)));
      toast("Enseignement mis à jour", "success");
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
    setEditTeaching(null);
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-20 text-center">Chargement…</p>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="p-8">
        <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-20 text-center">Série introuvable</p>
        <div className="text-center">
          <Link href="/admin/series" className="font-[var(--font-hanken)] text-[13px] font-medium text-[#b58a3c] hover:text-[#9e7832]">← Retour aux séries</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 font-[var(--font-hanken)] text-[12.5px] font-medium text-[#6f7363] hover:text-[#b58a3c] transition-colors mb-3"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
          <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
          {" / "}
          <Link href="/admin/series" className="hover:text-[#b58a3c] transition-colors">Séries</Link>
          {" / "}{series.title}
        </p>
        <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">{series.title}</h1>
      </div>

      {/* Carte info série */}
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] overflow-hidden mb-6">
        <div className="bg-[#3c4a37] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {series.arabicVerse && (
                <p className="arabic text-[#cda350] text-[16px] text-right mb-2">{series.arabicVerse}</p>
              )}
              <span className="inline-block font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#cda350] font-semibold bg-[rgba(205,163,80,0.15)] px-2 py-0.5 rounded-full mb-2">
                {THEME_LABELS[series.theme] ?? series.theme}
              </span>
              <p className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.7)] capitalize">{series.language}</p>
            </div>
            <button
              onClick={() => setEditSeries({ ...series })}
              className="shrink-0 px-4 py-2 bg-[rgba(251,249,243,0.1)] hover:bg-[rgba(251,249,243,0.18)] border border-[rgba(251,249,243,0.2)] rounded-[9px] font-[var(--font-hanken)] text-[13px] font-medium text-[#fbf9f3] transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="font-[var(--font-hanken)] text-[13.5px] text-[#3f463a] leading-relaxed mb-5">
            {series.description}
          </p>
          <div className="flex items-center gap-6 mb-5 flex-wrap">
            <div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20] leading-none">{episodes.length} / {series.totalEpisodes}</p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">Épisodes publiés</p>
            </div>
            <div className="w-px h-10 bg-[#e2dac9]" />
            <div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20] leading-none">{totalPlatformViews.toLocaleString("fr-FR")}</p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">Vues plateforme (cumulées)</p>
            </div>
            <div className="w-px h-10 bg-[#e2dac9]" />
            <div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20] leading-none">{formatDurationString(totalDurationSeconds)}</p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">Durée totale</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">Progression</span>
              <span className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#b58a3c]">{progress}%</span>
            </div>
            <div className="h-2.5 bg-[#e2dac9] rounded-full overflow-hidden">
              <div className="h-full bg-[#b58a3c] rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des épisodes */}
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e2dac9]">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20]">Épisodes</h2>
        </div>
        {episodes.length === 0 ? (
          <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-12 text-center">Aucun épisode rattaché à cette série pour l&apos;instant</p>
        ) : (
          <ul className="divide-y divide-[#f0ece3]">
            {episodes.map((ep) => (
              <li key={ep.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f9f6ef] transition-colors">
                <span className="w-8 shrink-0 text-center font-[var(--font-cormorant)] font-semibold text-[20px] text-[#d8d0bf]">
                  {ep.episodeNumber ?? "—"}
                </span>
                <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 text-[12px] ${ep.type === "video" ? "bg-[#3c4a37] text-[#cda350]" : "bg-[rgba(181,138,60,0.12)] text-[#b58a3c]"}`}>
                  {ep.type === "video" ? "▶" : "♪"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-hanken)] text-[13.5px] font-medium text-[#232a20] line-clamp-1">{ep.title}</p>
                  <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483]">
                    {ep.duration} · {ep.platformViews.toLocaleString("fr-FR")} vue{ep.platformViews > 1 ? "s" : ""} plateforme
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-semibold font-[var(--font-hanken)] px-1.5 py-0.5 rounded ${
                  ep.published === false ? "bg-[rgba(154,148,131,0.2)] text-[#9a9483]" : "bg-[rgba(60,74,55,0.1)] text-[#3c4a37]"
                }`}>
                  {ep.published === false ? "Brouillon" : "Publié"}
                </span>
                <button
                  onClick={() => setEditTeaching({ ...ep })}
                  aria-label="Modifier"
                  title="Modifier"
                  className="w-8 h-8 shrink-0 flex items-center justify-center text-[#6f7363] hover:text-[#b58a3c] hover:bg-[rgba(181,138,60,0.1)] rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b58a3c]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal édition série */}
      <Modal isOpen={!!editSeries} title="Modifier la série" onClose={() => setEditSeries(null)}>
        {editSeries && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Titre</label>
              <input
                value={editSeries.title}
                onChange={(e) => setEditSeries({ ...editSeries, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={editSeries.description}
                onChange={(e) => setEditSeries({ ...editSeries, description: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Thème</label>
                <select
                  value={editSeries.theme}
                  onChange={(e) => setEditSeries({ ...editSeries, theme: e.target.value as Theme })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                >
                  {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Langue</label>
                <select
                  value={editSeries.language}
                  onChange={(e) => setEditSeries({ ...editSeries, language: e.target.value as Language })}
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
                value={editSeries.totalEpisodes}
                onChange={(e) => setEditSeries({ ...editSeries, totalEpisodes: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Verset arabe (optionnel)</label>
              <input
                value={editSeries.arabicVerse ?? ""}
                onChange={(e) => setEditSeries({ ...editSeries, arabicVerse: e.target.value || undefined })}
                dir="rtl"
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-amiri)] text-[15px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditSeries(null)}
                className="flex-1 py-2.5 border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-medium text-[#6f7363] hover:bg-[#f0ece3] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSeries}
                className="flex-1 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#fbf9f3] transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal édition épisode */}
      <TeachingFormModal
        isOpen={!!editTeaching}
        isNew={false}
        editItem={editTeaching}
        seriesList={seriesList}
        agendaItems={agendaItems}
        onChange={setEditTeaching}
        onSave={handleSaveTeaching}
        onClose={() => setEditTeaching(null)}
      />
    </div>
  );
}
