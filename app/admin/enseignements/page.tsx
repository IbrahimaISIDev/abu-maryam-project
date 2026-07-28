"use client";

import { useState } from "react";
import Link from "next/link";
import { teachings as initialTeachings } from "@/data/teachings";
import type { Teaching, Theme, ContentType, Language, DifficultyLevel } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";

const THEME_LABELS: Record<Theme, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna",
  sahaba: "Sahaba", khoutba: "Khoutba", conférence: "Conférence",
};
const THEMES = Object.keys(THEME_LABELS) as Theme[];
const LANGUAGES: Language[] = ["wolof", "arabe"];
const LEVELS: DifficultyLevel[] = ["débutant", "intermédiaire", "avancé"];

type SortKey = "title" | "type" | "theme" | "duration" | "language";

const EMPTY_TEACHING: Omit<Teaching, "id"> = {
  title: "", type: "video", theme: "tafsir", language: "wolof",
  duration: "", durationSeconds: 0, thumbnail: null, mediaUrl: null,
  publishedAt: new Date().toISOString().slice(0, 10),
};

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 text-[10px] transition-colors ${active ? "text-[#b58a3c]" : "text-[#c8c0b0] group-hover:text-[#9a9483]"}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

export default function EnseignementsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Teaching[]>(initialTeachings);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ContentType>("all");
  const [themeFilter, setThemeFilter] = useState<Theme | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Teaching | null>(null);
  const [isNew, setIsNew] = useState(false);

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

  function handleDelete() {
    setItems((prev) => prev.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    toast("Enseignement supprimé", "success");
  }

  function handleSave() {
    if (!editItem) return;
    if (isNew) {
      setItems((prev) => [...prev, { ...editItem, id: String(Date.now()) }]);
      toast("Enseignement ajouté", "success");
    } else {
      setItems((prev) => prev.map((t) => (t.id === editItem.id ? editItem : t)));
      toast("Enseignement mis à jour", "success");
    }
    setEditItem(null);
    setIsNew(false);
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
            {sorted.length === 0 ? (
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
                    <div className="min-w-0">
                      <span className="font-[var(--font-hanken)] text-[13.5px] font-medium text-[#232a20] line-clamp-1">{t.title}</span>
                      {t.published === false && (
                        <span className="ml-2 text-[10px] font-semibold font-[var(--font-hanken)] px-1.5 py-0.5 rounded bg-[rgba(154,148,131,0.2)] text-[#9a9483]">
                          Brouillon
                        </span>
                      )}
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
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)}
                      className="px-3 py-1.5 text-[12px] font-[var(--font-hanken)] font-medium text-[#b58a3c] hover:text-[#9e7832] border border-[#e2dac9] hover:border-[#b58a3c] rounded-[7px] transition-colors">
                      Modifier
                    </button>
                    <button onClick={() => setDeleteId(t.id)}
                      className="px-3 py-1.5 text-[12px] font-[var(--font-hanken)] font-medium text-[#8a2f29] hover:text-[#6e2520] border border-[#e2dac9] hover:border-[#8a2f29] rounded-[7px] transition-colors">
                      Supprimer
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
      <Modal isOpen={!!editItem} title={isNew ? "Nouvel enseignement" : "Modifier l'enseignement"} onClose={() => { setEditItem(null); setIsNew(false); }}>
        {editItem && (
          <div className="p-6 space-y-4">
            <div>
              <FieldLabel>Titre</FieldLabel>
              <input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                placeholder="Titre de l'enseignement"
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Type</FieldLabel>
                <select value={editItem.type} onChange={(e) => setEditItem({ ...editItem, type: e.target.value as ContentType })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]">
                  <option value="video">Vidéo</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div>
                <FieldLabel>Langue</FieldLabel>
                <select value={editItem.language} onChange={(e) => setEditItem({ ...editItem, language: e.target.value as Language })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]">
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Thème</FieldLabel>
                <select value={editItem.theme} onChange={(e) => setEditItem({ ...editItem, theme: e.target.value as Theme })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]">
                  {THEMES.map((t) => <option key={t} value={t}>{THEME_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Niveau</FieldLabel>
                <select value={editItem.level ?? ""} onChange={(e) => setEditItem({ ...editItem, level: e.target.value as DifficultyLevel || undefined })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]">
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <FieldLabel>Durée (ex : 1:12:04)</FieldLabel>
              <input value={editItem.duration} onChange={(e) => setEditItem({ ...editItem, duration: e.target.value })}
                placeholder="0:00:00"
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea value={editItem.description ?? ""} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                rows={3} placeholder="Résumé de l'enseignement…"
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c] resize-none"
              />
            </div>
            {/* Toggle publié / brouillon */}
            <label className="flex items-center justify-between cursor-pointer bg-[#f5f1e8] rounded-[9px] px-4 py-3">
              <div>
                <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20]">
                  {editItem.published === false ? "Brouillon" : "Publié"}
                </p>
                <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483]">
                  {editItem.published === false ? "Visible uniquement en back-office" : "Visible sur le site public"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditItem({ ...editItem, published: editItem.published === false ? true : false })}
                className={`relative w-10 h-6 rounded-full transition-colors ${editItem.published === false ? "bg-[#d8d0bf]" : "bg-[#3c4a37]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${editItem.published === false ? "left-0.5" : "left-4"}`} />
              </button>
            </label>

            <div className="flex gap-3 pt-2">
              <button onClick={() => { setEditItem(null); setIsNew(false); }}
                className="flex-1 py-2.5 border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-medium text-[#6f7363] hover:bg-[#f0ece3] transition-colors">
                Annuler
              </button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#fbf9f3] transition-colors">
                {isNew ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
