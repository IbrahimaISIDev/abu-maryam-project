"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";

interface Question {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  theme: string;
  questionText: string;
  status: "pending" | "answered" | "archived";
  answerNote: string | null;
  createdAt: string;
}

const THEME_LABELS: Record<string, string> = {
  tafsir: "Tafsîr", tawhid: "Tawhîd", akhlaq: "Akhlâq",
  salat: "Salât", famille: "Famille", sunna: "Sunna", rappel: "Rappel",
};

const statusMap: Record<Question["status"], { label: string; cls: string }> = {
  answered: { label: "Répondu", cls: "bg-[#eef4e8] text-[#5f7050]" },
  pending: { label: "En attente", cls: "bg-[rgba(181,138,60,0.1)] text-[#b58a3c]" },
  archived: { label: "Archivé", cls: "bg-[rgba(154,148,131,0.15)] text-[#9a9483]" },
};

type SortKey = "name" | "theme" | "status" | "createdAt";

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 text-[10px] transition-colors ${active ? "text-[#b58a3c]" : "text-[#c8c0b0] group-hover:text-[#9a9483]"}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

function exportCSV(data: Question[]) {
  const headers = ["Nom", "Email", "Téléphone", "Thème", "Question", "Statut", "Réponse", "Date"];
  const rows = data.map((q) => [
    q.name, q.email ?? "", q.phone ?? "", THEME_LABELS[q.theme] ?? q.theme, q.questionText,
    statusMap[q.status]?.label ?? q.status, q.answerNote ?? "",
    new Date(q.createdAt).toLocaleDateString("fr-FR"),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `questions-abu-maryam-tv-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminQuestionsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Question["status"]>("all");
  const [themeFilter, setThemeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<Question | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/questions")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) setItems(data.questions);
        else throw new Error();
      })
      .catch(() => {
        if (!cancelled) toast("Impossible de charger les questions", "error");
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

  const filtered = items.filter((q) => {
    if (filter !== "all" && q.status !== filter) return false;
    if (themeFilter !== "all" && q.theme !== themeFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return q.name.toLowerCase().includes(s) || q.questionText.toLowerCase().includes(s) || q.theme.toLowerCase().includes(s);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const v = sortKey === "createdAt"
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : String(a[sortKey]).localeCompare(String(b[sortKey]), "fr");
    return sortDir === "asc" ? v : -v;
  });

  const counts = {
    all: items.length,
    pending: items.filter((q) => q.status === "pending").length,
    answered: items.filter((q) => q.status === "answered").length,
    archived: items.filter((q) => q.status === "archived").length,
  };

  async function setStatus(id: string, status: Question["status"]) {
    const labels: Record<Question["status"], string> = {
      answered: "Question marquée répondue",
      archived: "Question archivée",
      pending: "Question remise en attente",
    };
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
      if (detailItem?.id === id) setDetailItem((prev) => (prev ? { ...prev, status } : prev));
      toast(labels[status], status === "archived" ? "info" : "success");
    } catch {
      toast("Échec de la mise à jour du statut", "error");
    }
  }

  async function saveAnswerNote() {
    if (!detailItem) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/questions/${detailItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerNote: answerDraft }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((q) => (q.id === detailItem.id ? { ...q, answerNote: answerDraft } : q)));
      setDetailItem((prev) => (prev ? { ...prev, answerNote: answerDraft } : prev));
      toast("Réponse enregistrée", "success");
    } catch {
      toast("Échec de l'enregistrement de la réponse", "error");
    } finally {
      setSavingNote(false);
    }
  }

  function openDetail(q: Question) {
    setDetailItem(q);
    setAnswerDraft(q.answerNote ?? "");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(selected.size === sorted.length ? new Set() : new Set(sorted.map((q) => q.id)));
  }

  async function bulkSetStatus(status: Question["status"]) {
    const ids = Array.from(selected);
    const count = ids.length;
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/admin/questions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      setItems((prev) => prev.map((q) => (selected.has(q.id) ? { ...q, status } : q)));
      toast(`${count} question${count > 1 ? "s" : ""} mise${count > 1 ? "s" : ""} à jour`, "success");
    } catch {
      toast("Échec de la mise à jour groupée", "error");
    }
    setSelected(new Set());
  }

  async function handleDeleteOne(id: string) {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((q) => q.id !== id));
      if (detailItem?.id === id) setDetailItem(null);
      toast("Question supprimée", "success");
    } catch {
      toast("Échec de la suppression", "error");
    }
    setDeleteId(null);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    const count = ids.length;
    try {
      await Promise.all(ids.map((id) => fetch(`/api/admin/questions/${id}`, { method: "DELETE" })));
      setItems((prev) => prev.filter((q) => !selected.has(q.id)));
      setSelected(new Set());
      toast(`${count} question${count > 1 ? "s" : ""} supprimée${count > 1 ? "s" : ""}`, "success");
    } catch {
      toast("Échec de la suppression groupée", "error");
    }
    setConfirmBulkDelete(false);
  }

  const thClass = "px-4 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider cursor-pointer select-none group text-left";

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
            <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
            {" / "}Questions
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">Questions</h1>
          <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] mt-1">
            {items.length} question{items.length > 1 ? "s" : ""} de la communauté
          </p>
        </div>
        <button
          onClick={() => { exportCSV(sorted); toast("Export CSV téléchargé", "info"); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#fbf9f3] hover:bg-[#f0ece3] border border-[#d8d0bf] text-[#3f463a] rounded-[10px] font-[var(--font-hanken)] text-[13.5px] font-semibold transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-[#e9e3d4] rounded-full p-1">
          {(["all", "pending", "answered", "archived"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full font-[var(--font-hanken)] text-[12.5px] font-medium transition-colors ${filter === f ? "bg-[#fbf9f3] text-[#232a20] shadow-sm" : "text-[#6f7363] hover:text-[#3f463a]"}`}
            >
              {f === "all" ? "Toutes" : statusMap[f].label} · {counts[f]}
            </button>
          ))}
        </div>
        <select value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}
          className="px-3 py-1.5 bg-[#fbf9f3] border border-[#d8d0bf] rounded-full font-[var(--font-hanken)] text-[12.5px] text-[#3f463a] focus:outline-none focus:border-[#b58a3c]"
        >
          <option value="all">Tous les thèmes</option>
          {Object.entries(THEME_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <div className="relative flex-1 max-w-[320px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9483]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, thème, mot-clé…"
            className="w-full pl-9 pr-4 py-2 bg-[#fbf9f3] border border-[#d8d0bf] rounded-full font-[var(--font-hanken)] text-[13px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c]"
          />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2dac9] bg-[#f5f1e8]">
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={sorted.length > 0 && selected.size === sorted.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-[#3c4a37] cursor-pointer"
                  aria-label="Tout sélectionner"
                />
              </th>
              <th onClick={() => handleSort("name")} className={`${thClass} px-2`}>
                Nom <SortIcon active={sortKey === "name"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider">
                Question
              </th>
              <th onClick={() => handleSort("theme")} className={`${thClass} hidden md:table-cell`}>
                Thème <SortIcon active={sortKey === "theme"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("status")} className={thClass}>
                Statut <SortIcon active={sortKey === "status"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("createdAt")} className={`${thClass} hidden lg:table-cell`}>
                Date <SortIcon active={sortKey === "createdAt"} dir={sortDir} />
              </th>
              <th className="text-right px-5 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece3]">
            {loading ? (
              [0, 1, 2].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3.5"><div className="w-4 h-4 bg-[#e2dac9] rounded" /></td>
                  <td className="px-2 py-3.5"><div className="h-3.5 w-24 bg-[#e2dac9] rounded" /></td>
                  <td className="px-4 py-3.5"><div className="h-3.5 w-2/3 bg-[#e2dac9] rounded" /></td>
                  <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-3.5 w-16 bg-[#e2dac9] rounded" /></td>
                  <td className="px-4 py-3.5"><div className="h-5 w-16 bg-[#e2dac9] rounded-full" /></td>
                  <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-3.5 w-14 bg-[#e2dac9] rounded" /></td>
                  <td className="px-5 py-3.5"><div className="h-7 w-20 bg-[#e2dac9] rounded ml-auto" /></td>
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d8d0bf" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucune question ne correspond à vos critères</p>
                    <button onClick={() => { setSearch(""); setFilter("all"); setThemeFilter("all"); }}
                      className="font-[var(--font-hanken)] text-[12.5px] text-[#b58a3c] hover:text-[#9e7832]">
                      Réinitialiser les filtres
                    </button>
                  </div>
                </td>
              </tr>
            ) : sorted.map((q) => {
              const s = statusMap[q.status];
              const isChecked = selected.has(q.id);
              return (
                <tr key={q.id} className={`hover:bg-[#f9f6ef] transition-colors group ${isChecked ? "bg-[#f5f1e8]" : ""}`}>
                  <td className="px-5 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(q.id)}
                      className="w-4 h-4 accent-[#3c4a37] cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-3.5 cursor-pointer" onClick={() => openDetail(q)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[15px] text-[#6f7363]">
                        {q.name.charAt(0)}
                      </div>
                      <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20] hover:text-[#b58a3c] transition-colors">{q.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 cursor-pointer max-w-[280px]" onClick={() => openDetail(q)}>
                    <p className="font-[var(--font-hanken)] text-[12.5px] text-[#3f463a] line-clamp-1">{q.questionText}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full bg-[rgba(181,138,60,0.1)] text-[#b58a3c]">
                      {THEME_LABELS[q.theme] ?? q.theme}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell font-[var(--font-hanken)] text-[12px] tabular-nums text-[#9a9483]">
                    {new Date(q.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {q.status !== "answered" && (
                        <button onClick={(e) => { e.stopPropagation(); setStatus(q.id, "answered"); }}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-semibold text-[#5f7050] bg-[#eef4e8] hover:bg-[#deebd4] rounded-[7px] transition-colors">
                          Répondu
                        </button>
                      )}
                      {q.status !== "archived" && (
                        <button onClick={(e) => { e.stopPropagation(); setStatus(q.id, "archived"); }}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-medium text-[#6f7363] border border-[#e2dac9] hover:border-[#9a9483] rounded-[7px] transition-colors">
                          Archiver
                        </button>
                      )}
                      {q.status !== "pending" && (
                        <button onClick={(e) => { e.stopPropagation(); setStatus(q.id, "pending"); }}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-medium text-[#b58a3c] border border-[#e2dac9] hover:border-[#b58a3c] rounded-[7px] transition-colors">
                          Réactiver
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(q.id); }}
                        aria-label="Supprimer"
                        title="Supprimer"
                        className="p-1.5 rounded-[6px] text-[#6f7363] hover:text-[#8a2f29] hover:bg-[rgba(138,47,41,0.1)] transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length > 0 && (
          <div className="px-5 py-3 border-t border-[#e2dac9] bg-[#f9f6ef]">
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
              {sorted.length} question{sorted.length > 1 ? "s" : ""} affichée{sorted.length > 1 ? "s" : ""}
              {sorted.length !== items.length && ` sur ${items.length}`}
            </p>
          </div>
        )}
      </div>

      {/* Barre bulk actions */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#232a20] text-[#fbf9f3] px-5 py-3 rounded-full shadow-xl">
          <span className="font-[var(--font-hanken)] text-[13px]">
            {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
          </span>
          <div className="w-px h-4 bg-[rgba(255,255,255,0.2)]" />
          <button onClick={() => bulkSetStatus("answered")} className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#cda350] hover:text-[#e3c685] transition-colors">
            Marquer répondues
          </button>
          <button onClick={() => bulkSetStatus("archived")} className="font-[var(--font-hanken)] text-[13px] font-medium text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors">
            Archiver
          </button>
          <div className="w-px h-4 bg-[rgba(255,255,255,0.2)]" />
          <button onClick={() => setConfirmBulkDelete(true)} className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#8a2f29] hover:text-[#a83b34] transition-colors">
            Supprimer ({selected.size})
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-1 text-[rgba(251,249,243,0.4)] hover:text-[#fbf9f3] transition-colors" aria-label="Désélectionner">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer cette question ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        danger
        onConfirm={() => handleDeleteOne(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        isOpen={confirmBulkDelete}
        title={`Supprimer ${selected.size} question${selected.size > 1 ? "s" : ""} ?`}
        message="Cette action est irréversible."
        confirmLabel="Supprimer définitivement"
        danger
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* Modal détail question */}
      <Modal isOpen={!!detailItem} title="Détail de la question" onClose={() => setDetailItem(null)}>
        {detailItem && (() => {
          const s = statusMap[detailItem.status];
          return (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[26px] text-[#6f7363]">
                  {detailItem.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20]">{detailItem.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    <span className="text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full bg-[rgba(181,138,60,0.1)] text-[#b58a3c]">
                      {THEME_LABELS[detailItem.theme] ?? detailItem.theme}
                    </span>
                  </div>
                </div>
              </div>

              {(detailItem.email || detailItem.phone) && (
                <div className="grid grid-cols-2 gap-3">
                  {detailItem.email && (
                    <div className="bg-[#f5f1e8] rounded-[10px] p-3.5">
                      <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#9a9483] font-semibold mb-1">E-mail</p>
                      <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] font-medium break-all">{detailItem.email}</p>
                    </div>
                  )}
                  {detailItem.phone && (
                    <div className="bg-[#f5f1e8] rounded-[10px] p-3.5">
                      <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#9a9483] font-semibold mb-1">Téléphone</p>
                      <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] font-medium" dir="ltr">{detailItem.phone}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[rgba(181,138,60,0.08)] border border-[rgba(181,138,60,0.2)] rounded-[10px] p-3.5">
                <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#b58a3c] font-semibold mb-1">Question</p>
                <p className="font-[var(--font-hanken)] text-[13.5px] text-[#3f463a] leading-relaxed">{detailItem.questionText}</p>
              </div>

              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
                  Réponse (note interne)
                </label>
                <textarea
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                  rows={4}
                  placeholder="Ce qui a été répondu à Oustaz, ou un brouillon de réponse…"
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c] resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={saveAnswerNote}
                    disabled={savingNote || answerDraft === (detailItem.answerNote ?? "")}
                    className="px-4 py-2 bg-[#3c4a37] hover:bg-[#2d3829] disabled:opacity-40 disabled:cursor-not-allowed text-[#fbf9f3] font-[var(--font-hanken)] text-[12.5px] font-semibold rounded-[8px] transition-colors"
                  >
                    {savingNote ? "Enregistrement…" : "Enregistrer la réponse"}
                  </button>
                </div>
              </div>

              <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">
                Reçue le {new Date(detailItem.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {detailItem.status !== "answered" && (
                  <button onClick={() => setStatus(detailItem.id, "answered")}
                    className="py-2.5 bg-[#eef4e8] hover:bg-[#deebd4] text-[#5f7050] font-[var(--font-hanken)] font-semibold text-[13px] rounded-[9px] transition-colors">
                    Marquer répondue
                  </button>
                )}
                {detailItem.status !== "archived" && (
                  <button onClick={() => setStatus(detailItem.id, "archived")}
                    className="py-2.5 border border-[#e2dac9] hover:border-[#9a9483] text-[#6f7363] font-[var(--font-hanken)] font-medium text-[13px] rounded-[9px] transition-colors">
                    Archiver
                  </button>
                )}
                {detailItem.status !== "pending" && (
                  <button onClick={() => setStatus(detailItem.id, "pending")}
                    className="py-2.5 border border-[#e2dac9] hover:border-[#b58a3c] text-[#b58a3c] font-[var(--font-hanken)] font-medium text-[13px] rounded-[9px] transition-colors">
                    Réactiver
                  </button>
                )}
                <button onClick={() => setDetailItem(null)}
                  className="py-2.5 bg-[#f0ece3] hover:bg-[#e5e0d5] text-[#6f7363] font-[var(--font-hanken)] font-medium text-[13px] rounded-[9px] transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
