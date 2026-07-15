"use client";

import { useState } from "react";
import Link from "next/link";
import { registrations as initialData, type Registration } from "@/data/registrations";
import { useToast } from "@/contexts/ToastContext";
import ConfirmModal from "@/components/ui/ConfirmModal";

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
  const [items, setItems] = useState<Registration[]>(initialData);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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

  function setStatus(id: string, status: Registration["status"]) {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    const labels: Record<string, string> = {
      confirmed: "Inscription confirmée",
      cancelled: "Inscription annulée",
      pending: "Inscription remise en attente",
    };
    toast(labels[status] ?? "Statut mis à jour", status === "confirmed" ? "success" : status === "cancelled" ? "error" : "info");
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
              <th onClick={() => handleSort("fullName")} className={`${thClass} px-5`}>
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
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
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
              return (
                <tr key={r.id} className="hover:bg-[#f9f6ef] transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[15px] text-[#6f7363]">
                        {r.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20]">{r.fullName}</p>
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
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === "pending" && (
                        <button onClick={() => setStatus(r.id, "confirmed")}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-semibold text-[#5f7050] bg-[#eef4e8] hover:bg-[#deebd4] rounded-[7px] transition-colors">
                          Confirmer
                        </button>
                      )}
                      {r.status === "confirmed" && (
                        <button onClick={() => setCancelId(r.id)}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-medium text-[#8a2f29] border border-[#e2dac9] hover:border-[#8a2f29] rounded-[7px] transition-colors">
                          Annuler
                        </button>
                      )}
                      {r.status === "cancelled" && (
                        <button onClick={() => setStatus(r.id, "pending")}
                          className="px-2.5 py-1.5 text-[11.5px] font-[var(--font-hanken)] font-medium text-[#b58a3c] border border-[#e2dac9] hover:border-[#b58a3c] rounded-[7px] transition-colors">
                          Réactiver
                        </button>
                      )}
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

      <ConfirmModal
        isOpen={!!cancelId}
        title="Annuler cette inscription ?"
        message="Le participant sera notifié. Vous pourrez le réactiver ultérieurement si nécessaire."
        confirmLabel="Annuler l'inscription"
        danger
        onConfirm={() => { setStatus(cancelId!, "cancelled"); setCancelId(null); }}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
