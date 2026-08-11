"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Registration } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import { apiRoutes } from "@/lib/api-routes";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";

const statusMap: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmé",   cls: "bg-[#eef4e8] text-[#5f7050]" },
  pending:   { label: "En attente", cls: "bg-[rgba(181,138,60,0.1)] text-[#b58a3c]" },
  cancelled: { label: "Annulé",     cls: "bg-[rgba(138,47,41,0.08)] text-[#8a2f29]" },
};
const paymentMap: Record<string, { label: string; cls: string }> = {
  paid:   { label: "Payé",     cls: "text-[#5f7050]" },
  unpaid: { label: "Non payé", cls: "text-[#b58a3c]" },
  free:   { label: "Gratuit",  cls: "text-[#9a9483]" },
};

type SortKey = "fullName" | "city" | "status" | "paymentStatus" | "registeredAt";

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1 text-[10px] transition-colors ${active ? "text-[#b58a3c]" : "text-[#c8c0b0] group-hover:text-[#9a9483]"}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

function exportCSV(data: Registration[]) {
  const headers = ["Nom", "Email", "Téléphone", "Ville", "Statut", "Paiement", "Date d'inscription", "Notes"];
  const rows = data.map((r) => [
    r.fullName, r.email, r.phone, r.city,
    statusMap[r.status]?.label ?? r.status,
    paymentMap[r.paymentStatus]?.label ?? r.paymentStatus,
    new Date(r.registeredAt).toLocaleDateString("fr-FR"),
    r.notes ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inscriptions-abu-maryam-tv-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InscriptionsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [detailItem, setDetailItem] = useState<Registration | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch(apiRoutes.inscription())
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { registrations: Registration[] }) => {
        if (!cancelled) setItems(data.registrations);
      })
      .catch(() => {
        if (!cancelled) toast("Impossible de charger les inscriptions", "error");
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

  const filtered = items.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.city.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let v = 0;
    if (sortKey === "registeredAt") {
      v = new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
    } else {
      v = String(a[sortKey]).localeCompare(String(b[sortKey]), "fr");
    }
    return sortDir === "asc" ? v : -v;
  });

  const counts = {
    all: items.length,
    confirmed: items.filter((r) => r.status === "confirmed").length,
    pending: items.filter((r) => r.status === "pending").length,
    cancelled: items.filter((r) => r.status === "cancelled").length,
  };

  async function setStatus(id: string, status: Registration["status"]) {
    const labels: Record<string, string> = {
      confirmed: "Inscription confirmée",
      cancelled: "Inscription annulée",
      pending: "Inscription remise en attente",
    };
    try {
      const res = await fetch(apiRoutes.registration(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      if (detailItem?.id === id) setDetailItem((prev) => (prev ? { ...prev, status } : prev));
      toast(labels[status] ?? "Statut mis à jour", status === "confirmed" ? "success" : status === "cancelled" ? "error" : "info");
    } catch {
      toast("Échec de la mise à jour du statut", "error");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === sorted.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((r) => r.id)));
    }
  }

  async function bulkSetStatus(status: Registration["status"]) {
    const ids = Array.from(selected);
    const count = ids.length;
    const labels: Record<string, string> = {
      confirmed: `${count} inscription${count > 1 ? "s" : ""} confirmée${count > 1 ? "s" : ""}`,
      cancelled: `${count} inscription${count > 1 ? "s" : ""} annulée${count > 1 ? "s" : ""}`,
    };
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(apiRoutes.registration(id), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      setItems((prev) => prev.map((r) => (selected.has(r.id) ? { ...r, status } : r)));
      toast(labels[status] ?? "Statut mis à jour", status === "confirmed" ? "success" : "error");
    } catch {
      toast("Échec de la mise à jour groupée", "error");
    }
    setSelected(new Set());
  }

  async function handleDeleteOne(id: string) {
    try {
      const res = await fetch(apiRoutes.registration(id), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((r) => r.id !== id));
      if (detailItem?.id === id) setDetailItem(null);
      toast("Inscription supprimée", "success");
    } catch {
      toast("Échec de la suppression", "error");
    }
    setDeleteId(null);
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    const count = ids.length;
    try {
      const res = await fetch(apiRoutes.registrations(), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
      toast(`${count} inscription${count > 1 ? "s" : ""} supprimée${count > 1 ? "s" : ""}`, "success");
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
            {" / "}Inscriptions
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">Inscriptions</h1>
          <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] mt-1">
            Séminaire — {items.length} inscrits au total
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
          {(["all", "confirmed", "pending", "cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full font-[var(--font-hanken)] text-[12.5px] font-medium transition-colors ${filter === f ? "bg-[#fbf9f3] text-[#232a20] shadow-sm" : "text-[#6f7363] hover:text-[#3f463a]"}`}
            >
              {f === "all" ? "Tous" : statusMap[f].label} · {counts[f]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-[320px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9483]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, email, ville…"
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
              <th onClick={() => handleSort("fullName")} className={`${thClass} px-2`}>
                Nom <SortIcon active={sortKey === "fullName"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider hidden md:table-cell">
                Contact
              </th>
              <th onClick={() => handleSort("city")} className={`${thClass} hidden lg:table-cell`}>
                Ville <SortIcon active={sortKey === "city"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("status")} className={`${thClass}`}>
                Statut <SortIcon active={sortKey === "status"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("paymentStatus")} className={`${thClass} hidden xl:table-cell`}>
                Paiement <SortIcon active={sortKey === "paymentStatus"} dir={sortDir} />
              </th>
              <th onClick={() => handleSort("registeredAt")} className={`${thClass} hidden lg:table-cell`}>
                Date <SortIcon active={sortKey === "registeredAt"} dir={sortDir} />
              </th>
              <th className="text-right px-5 py-3 font-[var(--font-hanken)] text-[11px] font-semibold text-[#9a9483] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ece3]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center">
                  <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Chargement des inscriptions…</p>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d8d0bf" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucun résultat</p>
                    <button onClick={() => { setSearch(""); setFilter("all"); }}
                      className="font-[var(--font-hanken)] text-[12.5px] text-[#b58a3c] hover:text-[#9e7832]">
                      Réinitialiser les filtres
                    </button>
                  </div>
                </td>
              </tr>
            ) : sorted.map((r) => {
              const s = statusMap[r.status];
              const p = paymentMap[r.paymentStatus];
              const isChecked = selected.has(r.id);
              return (
                <tr
                  key={r.id}
                  className={`hover:bg-[#f9f6ef] transition-colors group ${isChecked ? "bg-[#f5f1e8]" : ""}`}
                >
                  <td className="px-5 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(r.id)}
                      className="w-4 h-4 accent-[#3c4a37] cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-3.5 cursor-pointer" onClick={() => setDetailItem(r)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[15px] text-[#6f7363]">
                        {r.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20] hover:text-[#b58a3c] transition-colors">{r.fullName}</p>
                        {r.notes && <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483] italic">{r.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="font-[var(--font-hanken)] text-[12.5px] text-[#3f463a]">{r.email}</p>
                    <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">{r.phone}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell font-[var(--font-hanken)] text-[13px] text-[#6f7363]">{r.city}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className={`px-4 py-3.5 hidden xl:table-cell font-[var(--font-hanken)] text-[12.5px] font-semibold ${p.cls}`}>{p.label}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell font-[var(--font-hanken)] text-[12px] tabular-nums text-[#9a9483]">
                    {new Date(r.registeredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={buildWhatsAppContactLink(r.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-[6px] text-[#25D366] hover:bg-[rgba(37,211,102,0.1)] transition-colors"
                        title="Contacter sur WhatsApp"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.103 1.514 5.817L.057 23.882l6.22-1.432A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.494-5.28-1.366l-.38-.225-3.692.85.895-3.576-.246-.394A9.931 9.931 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                      </a>
                      {r.status === "pending" && (
                        <button onClick={(e) => { e.stopPropagation(); setStatus(r.id, "confirmed"); }}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-semibold text-[#5f7050] bg-[#eef4e8] hover:bg-[#deebd4] rounded-[7px] transition-colors">
                          Confirmer
                        </button>
                      )}
                      {r.status === "confirmed" && (
                        <button onClick={(e) => { e.stopPropagation(); setCancelId(r.id); }}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-medium text-[#8a2f29] border border-[#e2dac9] hover:border-[#8a2f29] rounded-[7px] transition-colors">
                          Annuler
                        </button>
                      )}
                      {r.status === "cancelled" && (
                        <button onClick={(e) => { e.stopPropagation(); setStatus(r.id, "pending"); }}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-medium text-[#b58a3c] border border-[#e2dac9] hover:border-[#b58a3c] rounded-[7px] transition-colors">
                          Réactiver
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }}
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
              {sorted.length} inscription{sorted.length > 1 ? "s" : ""} affichée{sorted.length > 1 ? "s" : ""}
              {sorted.length !== items.length && ` sur ${items.length}`}
            </p>
          </div>
        )}
      </div>

      {/* Barre bulk actions */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#232a20] text-[#fbf9f3] px-5 py-3 rounded-full shadow-xl">
          <span className="font-[var(--font-hanken)] text-[13px]">
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="w-px h-4 bg-[rgba(255,255,255,0.2)]" />
          <button
            onClick={() => bulkSetStatus("confirmed")}
            className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#cda350] hover:text-[#e3c685] transition-colors"
          >
            Confirmer tous
          </button>
          <button
            onClick={() => bulkSetStatus("cancelled")}
            className="font-[var(--font-hanken)] text-[13px] font-medium text-[rgba(251,249,243,0.6)] hover:text-[#fbf9f3] transition-colors"
          >
            Annuler tous
          </button>
          <div className="w-px h-4 bg-[rgba(255,255,255,0.2)]" />
          <button
            onClick={() => setConfirmBulkDelete(true)}
            className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#8a2f29] hover:text-[#a83b34] transition-colors"
          >
            Supprimer ({selected.size})
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-1 text-[rgba(251,249,243,0.4)] hover:text-[#fbf9f3] transition-colors"
            aria-label="Désélectionner"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelId}
        title="Annuler cette inscription ?"
        message="Le participant sera notifié. Vous pourrez le réactiver ultérieurement si nécessaire."
        confirmLabel="Annuler l'inscription"
        danger
        onConfirm={() => { setStatus(cancelId!, "cancelled"); setCancelId(null); }}
        onCancel={() => setCancelId(null)}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        title="Supprimer cette inscription ?"
        message="Cette action est irréversible. L'inscription sera définitivement supprimée de la base de données."
        confirmLabel="Supprimer"
        danger
        onConfirm={() => handleDeleteOne(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        isOpen={confirmBulkDelete}
        title={`Supprimer ${selected.size} inscription${selected.size > 1 ? "s" : ""} ?`}
        message="Cette action est irréversible. Les inscriptions sélectionnées seront définitivement supprimées."
        confirmLabel="Supprimer définitivement"
        danger
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* Modal détail inscription */}
      <Modal
        isOpen={!!detailItem}
        title="Détail de l'inscription"
        onClose={() => setDetailItem(null)}
      >
        {detailItem && (() => {
          const s = statusMap[detailItem.status];
          const p = paymentMap[detailItem.paymentStatus];
          return (
            <div className="p-6 space-y-5">
              {/* En-tête participant */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[26px] text-[#6f7363]">
                  {detailItem.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20]">
                    {detailItem.fullName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${s.cls}`}>
                      {s.label}
                    </span>
                    <span className={`font-[var(--font-hanken)] text-[12px] font-semibold ${p.cls}`}>
                      {p.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Infos contact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f5f1e8] rounded-[10px] p-3.5">
                  <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#9a9483] font-semibold mb-1">Téléphone</p>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] font-medium">{detailItem.phone}</p>
                </div>
                <div className="bg-[#f5f1e8] rounded-[10px] p-3.5">
                  <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#9a9483] font-semibold mb-1">E-mail</p>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] font-medium break-all">{detailItem.email}</p>
                </div>
                <div className="bg-[#f5f1e8] rounded-[10px] p-3.5">
                  <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#9a9483] font-semibold mb-1">Ville</p>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] font-medium">{detailItem.city}</p>
                </div>
                <div className="bg-[#f5f1e8] rounded-[10px] p-3.5">
                  <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#9a9483] font-semibold mb-1">Inscrit le</p>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#232a20] font-medium">
                    {new Date(detailItem.registeredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {detailItem.notes && (
                <div className="bg-[rgba(181,138,60,0.08)] border border-[rgba(181,138,60,0.2)] rounded-[10px] p-3.5">
                  <p className="font-[var(--font-hanken)] text-[10px] uppercase tracking-wider text-[#b58a3c] font-semibold mb-1">Note</p>
                  <p className="font-[var(--font-hanken)] text-[13.5px] text-[#3f463a] italic">{detailItem.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={buildWhatsAppContactLink(detailItem.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#1ea853] text-white font-[var(--font-hanken)] font-semibold text-[14px] rounded-[10px] transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.103 1.514 5.817L.057 23.882l6.22-1.432A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.494-5.28-1.366l-.38-.225-3.692.85.895-3.576-.246-.394A9.931 9.931 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Contacter sur WhatsApp
                </a>
                <div className="grid grid-cols-2 gap-2">
                  {detailItem.status === "pending" && (
                    <button
                      onClick={() => setStatus(detailItem.id, "confirmed")}
                      className="py-2.5 bg-[#eef4e8] hover:bg-[#deebd4] text-[#5f7050] font-[var(--font-hanken)] font-semibold text-[13px] rounded-[9px] transition-colors"
                    >
                      Confirmer
                    </button>
                  )}
                  {detailItem.status === "confirmed" && (
                    <button
                      onClick={() => { setCancelId(detailItem.id); setDetailItem(null); }}
                      className="py-2.5 border border-[#e2dac9] hover:border-[#8a2f29] text-[#8a2f29] font-[var(--font-hanken)] font-medium text-[13px] rounded-[9px] transition-colors"
                    >
                      Annuler l&apos;inscription
                    </button>
                  )}
                  {detailItem.status === "cancelled" && (
                    <button
                      onClick={() => setStatus(detailItem.id, "pending")}
                      className="py-2.5 border border-[#e2dac9] hover:border-[#b58a3c] text-[#b58a3c] font-[var(--font-hanken)] font-medium text-[13px] rounded-[9px] transition-colors"
                    >
                      Réactiver
                    </button>
                  )}
                  <button
                    onClick={() => setDetailItem(null)}
                    className="py-2.5 bg-[#f0ece3] hover:bg-[#e5e0d5] text-[#6f7363] font-[var(--font-hanken)] font-medium text-[13px] rounded-[9px] transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
