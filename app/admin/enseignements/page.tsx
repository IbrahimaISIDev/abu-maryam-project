"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Teaching, Theme, ContentType, Series, AgendaItem } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import TeachingFormModal from "@/components/admin/TeachingFormModal";
import { apiRoutes } from "@/lib/api-routes";

const THEME_LABELS: Record<Theme, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
  rappel: "Rappel",
};
const THEMES = Object.keys(THEME_LABELS) as Theme[];

type SortKey = "title" | "type" | "theme" | "duration" | "language";

const EMPTY_TEACHING: Omit<Teaching, "id"> = {
  title: "", type: "video", theme: "tafsir", language: "wolof",
  duration: "", durationSeconds: 0, thumbnail: null, youtubeId: null, videoUrl: null, audioUrl: null,
  publishedAt: new Date().toISOString().slice(0, 10),
};

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 text-[10px] transition-colors ${active ? "text-[#b58a3c]" : "text-[#c8c0b0] group-hover:text-[#9a9483]"}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

export default function EnseignementsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Teaching[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ContentType>("all");
  const [themeFilter, setThemeFilter] = useState<Theme | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Teaching | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiRoutes.teachings()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.series()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.agenda()).then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(
        ([teachingsData, seriesData, agendaData]: [
          { teachings: Teaching[] },
          { series: Series[] },
          { agendaItems: AgendaItem[] },
        ]) => {
          if (cancelled) return;
          setItems(teachingsData.teachings);
          setSeriesList(seriesData.series);
          setAgendaItems(agendaData.agendaItems);
        }
      )
      .catch(() => {
        if (!cancelled) toast("Impossible de charger les enseignements", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function openNew() {
    setEditItem({ ...EMPTY_TEACHING, id: "" });
    setIsNew(true);
  }

  function openEdit(t: Teaching) {
    setEditItem({ ...t });
    setIsNew(false);
  }

  const filtered = items.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (themeFilter !== "all" && t.theme !== themeFilter) return false;
    if (publishFilter === "published" && t.published === false) return false;
    if (publishFilter === "draft" && t.published !== false) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.theme.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const v = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""), "fr");
        return sortDir === "asc" ? v : -v;
      })
    : filtered;

  async function handleQuickPublishToggle(t: Teaching) {
    const nextPublished = t.published === false ? true : false;
    setItems((prev) => prev.map((it) => (it.id === t.id ? { ...it, published: nextPublished } : it)));
    try {
      const res = await fetch(apiRoutes.teaching(t.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, published: nextPublished }),
      });
      if (!res.ok) throw new Error();
      toast(nextPublished ? "Enseignement publié" : "Passé en brouillon", "success");
    } catch {
      setItems((prev) => prev.map((it) => (it.id === t.id ? { ...it, published: t.published } : it)));
      toast("Échec de la mise à jour", "error");
    }
  }

  async function handleDelete() {
    const id = deleteId;
    if (!id) return;
    try {
      const res = await fetch(apiRoutes.teaching(id), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((t) => t.id !== id));
      toast("Enseignement supprimé", "success");
    } catch {
      toast("Échec de la suppression", "error");
    }
    setDeleteId(null);
  }

  async function handleSave() {
    if (!editItem) return;
    try {
      if (isNew) {
        const res = await fetch(apiRoutes.teachings(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editItem),
        });
        if (!res.ok) throw new Error();
        const { teaching } = await res.json();
        setItems((prev) => [...prev, teaching]);
        toast("Enseignement ajouté", "success");
      } else {
        const res = await fetch(apiRoutes.teaching(editItem.id), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editItem),
        });
        if (!res.ok) throw new Error();
        const { teaching } = await res.json();
        setItems((prev) => prev.map((t) => (t.id === teaching.id ? teaching : t)));
        toast("Enseignement mis à jour", "success");
      }
      setEditItem(null);
      setIsNew(false);
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
  }

  const counts = {
    all: items.length,
    video: items.filter((t) => t.type === "video").length,
    audio: items.filter((t) => t.type === "audio").length,
    published: items.filter((t) => t.published !== false).length,
    draft: items.filter((t) => t.published === false).length,
  };

  const thClass = "text-left px-4 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider cursor-pointer select-none group";

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
            <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
            {" / "}Enseignements
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">Enseignements</h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] rounded-[10px] font-[var(--font-hanken)] text-[13.5px] font-semibold transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvel enseignement
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-[#e9e3d4] rounded-full p-1 shrink-0">
          {(["all", "video", "audio"] as const).map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`px-4 py-1.5 rounded-full font-[var(--font-hanken)] text-[12.5px] font-medium transition-colors ${typeFilter === f ? "bg-[#fbf9f3] text-[#232a20] shadow-sm" : "text-[#6f7363] hover:text-[#3f463a]"}`}
            >
              {f === "all" ? `Tous · ${counts.all}` : f === "video" ? `Vidéos · ${counts.video}` : `Audios · ${counts.audio}`}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-[#e9e3d4] rounded-full p-1 shrink-0">
          {([
            { v: "all", label: `Tous · ${counts.all}` },
            { v: "published", label: `Publiés · ${counts.published}` },
            { v: "draft", label: `Brouillons · ${counts.draft}` },
          ] as const).map(({ v, label }) => (
            <button key={v} onClick={() => setPublishFilter(v)}
              className={`px-4 py-1.5 rounded-full font-[var(--font-hanken)] text-[12.5px] font-medium transition-colors ${publishFilter === v ? "bg-[#fbf9f3] text-[#232a20] shadow-sm" : "text-[#6f7363] hover:text-[#3f463a]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <select value={themeFilter} onChange={(e) => setThemeFilter(e.target.value as Theme | "all")}
          className="px-3 py-1.5 bg-[#fbf9f3] border border-[#d8d0bf] rounded-full font-[var(--font-hanken)] text-[12.5px] text-[#3f463a] focus:outline-none focus:border-[#b58a3c]"
        >
          <option value="all">Tous les thèmes</option>
          {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
        </select>
        <div className="relative flex-1 max-w-[300px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9483]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full pl-9 pr-4 py-2 bg-[#fbf9f3] border border-[#d8d0bf] rounded-full font-[var(--font-hanken)] text-[13px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c]"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2dac9] bg-[#f5f1e8]">
              <th onClick={() => handleSort("title")} className={`${thClass} px-5`}>
                Titre <SortIcon active={sortKey === "title"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("type")} className={`${thClass} hidden md:table-cell`}>
                Type <SortIcon active={sortKey === "type"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("theme")} className={`${thClass} hidden lg:table-cell`}>
                Thème <SortIcon active={sortKey === "theme"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("duration")} className={`${thClass} hidden lg:table-cell`}>
                Durée <SortIcon active={sortKey === "duration"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("language")} className={`${thClass} hidden xl:table-cell`}>
                Langue <SortIcon active={sortKey === "language"} dir={sortDir} />
              </th>
              <th className="text-right px-5 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece3]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Chargement…</p>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d8d0bf" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucun enseignement trouvé</p>
                    <button onClick={() => { setSearch(""); setTypeFilter("all"); setThemeFilter("all"); }}
                      className="font-[var(--font-hanken)] text-[12.5px] text-[#b58a3c] hover:text-[#9e7832]">
                      Réinitialiser les filtres
                    </button>
                  </div>
                </td>
              </tr>
            ) : sorted.map((t) => (
              <tr key={t.id} className="hover:bg-[#f9f6ef] transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 text-[12px] ${t.type === "video" ? "bg-[#3c4a37] text-[#cda350]" : "bg-[rgba(181,138,60,0.12)] text-[#b58a3c]"}`}>
                      {t.type === "video" ? "▶" : "♪"}
                    </div>
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-[var(--font-hanken)] text-[13.5px] font-medium text-[#232a20] line-clamp-1">{t.title}</span>
                      <button
                        onClick={() => handleQuickPublishToggle(t)}
                        title={t.published === false ? "Publier" : "Repasser en brouillon"}
                        className={`shrink-0 text-[10px] font-semibold font-[var(--font-hanken)] px-1.5 py-0.5 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b58a3c] ${
                          t.published === false
                            ? "bg-[rgba(154,148,131,0.2)] text-[#9a9483] hover:bg-[rgba(154,148,131,0.32)]"
                            : "bg-[rgba(60,74,55,0.1)] text-[#3c4a37] hover:bg-[rgba(60,74,55,0.18)]"
                        }`}
                      >
                        {t.published === false ? "Brouillon" : "Publié"}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${t.type === "video" ? "bg-[rgba(60,74,55,0.1)] text-[#3c4a37]" : "bg-[rgba(181,138,60,0.1)] text-[#b58a3c]"}`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell font-[var(--font-hanken)] text-[13px] text-[#6f7363]">{THEME_LABELS[t.theme] ?? t.theme}</td>
                <td className="px-4 py-3.5 hidden lg:table-cell font-[var(--font-hanken)] text-[13px] tabular-nums text-[#6f7363]">{t.duration}</td>
                <td className="px-4 py-3.5 hidden xl:table-cell font-[var(--font-hanken)] text-[13px] text-[#6f7363] capitalize">{t.language}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => openEdit(t)}
                      aria-label="Modifier"
                      title="Modifier"
                      className="w-8 h-8 flex items-center justify-center text-[#6f7363] hover:text-[#b58a3c] hover:bg-[rgba(181,138,60,0.1)] rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b58a3c]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteId(t.id)}
                      aria-label="Supprimer"
                      title="Supprimer"
                      className="w-8 h-8 flex items-center justify-center text-[#6f7363] hover:text-[#8a2f29] hover:bg-[rgba(138,47,41,0.1)] rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8a2f29]">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length > 0 && (
          <div className="px-5 py-3 border-t border-[#e2dac9] bg-[#f9f6ef]">
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
              {sorted.length} enseignement{sorted.length > 1 ? "s" : ""} affiché{sorted.length > 1 ? "s" : ""}
              {sorted.length !== items.length && ` sur ${items.length}`}
            </p>
          </div>
        )}
      </div>

      {/* Modal suppression */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer cet enseignement ?"
        message="Cette action est irréversible. L'enseignement sera retiré de la bibliothèque."
        confirmLabel="Supprimer"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Modal création / édition */}
      <TeachingFormModal
        isOpen={!!editItem}
        isNew={isNew}
        editItem={editItem}
        seriesList={seriesList}
        agendaItems={agendaItems}
        onChange={setEditItem}
        onSave={handleSave}
        onClose={() => { setEditItem(null); setIsNew(false); }}
      />
    </div>
  );
}
