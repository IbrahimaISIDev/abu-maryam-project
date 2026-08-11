"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AgendaItem, Registration, Seminar, Replay } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import { computeAgendaStatus } from "@/lib/activities";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { apiRoutes } from "@/lib/api-routes";

const AGENDA_TYPES: AgendaItem["type"][] = ["séminaire", "conférence", "khoutba", "cours", "tafsir"];

function formatAgendaDate(item: AgendaItem): string {
  const startStr = new Date(item.dateStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  if (!item.dateEnd || item.dateEnd === item.dateStart) return startStr;
  const endStr = new Date(item.dateEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${startStr} → ${endStr}`;
}

export default function EvenementsAdminPage() {
  const toast = useToast();
  const [sem, setSem] = useState<Seminar | null>(null);
  const [semEdit, setSemEdit] = useState<Seminar | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [replays, setReplays] = useState<Replay[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAgenda, setEditAgenda] = useState<AgendaItem | null>(null);
  const [newAgenda, setNewAgenda] = useState(false);
  const [deleteAgendaId, setDeleteAgendaId] = useState<string | null>(null);
  const [newReplayTitle, setNewReplayTitle] = useState("");
  const [newReplayUrl, setNewReplayUrl] = useState("");
  const [deleteReplayId, setDeleteReplayId] = useState<string | null>(null);
  const [agendaSortDir, setAgendaSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiRoutes.seminar()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.agenda()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.inscription()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.replays()).then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(
        ([seminarData, agendaData, regData, replaysData]: [
          { seminar: Seminar | null },
          { agendaItems: AgendaItem[] },
          { registrations: Registration[] },
          { replays: Replay[] },
        ]) => {
          if (cancelled) return;
          setSem(seminarData.seminar);
          setAgenda(agendaData.agendaItems);
          setRegistrations(regData.registrations);
          setReplays(replaysData.replays);
        }
      )
      .catch(() => {
        if (!cancelled) toast("Impossible de charger les événements", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function addReplay() {
    if (!newReplayTitle.trim() || !newReplayUrl.trim()) {
      toast("Titre et URL YouTube requis", "error");
      return;
    }
    try {
      const res = await fetch(apiRoutes.replays(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newReplayTitle, youtubeUrlOrId: newReplayUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReplays((prev) => [...prev, data.replay]);
      setNewReplayTitle("");
      setNewReplayUrl("");
      toast("Replay ajouté", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de l'ajout", "error");
    }
  }

  async function deleteReplay() {
    const id = deleteReplayId;
    if (!id) return;
    try {
      const res = await fetch(apiRoutes.replayItem(id), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setReplays((prev) => prev.filter((r) => r.id !== id));
      toast("Replay supprimé", "success");
    } catch {
      toast("Échec de la suppression", "error");
    }
    setDeleteReplayId(null);
  }

  const confirmed = registrations.filter((r) => r.status === "confirmed").length;
  const capacity = sem?.totalPlaces ?? 150;
  const pct = Math.round((confirmed / capacity) * 100);

  const sortedAgenda = [...agenda].sort((a, b) => {
    const v = a.dateStart.localeCompare(b.dateStart);
    return agendaSortDir === "asc" ? v : -v;
  });

  async function saveSeminar() {
    if (!semEdit) return;
    try {
      const res = await fetch(apiRoutes.seminar(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(semEdit),
      });
      if (!res.ok) throw new Error();
      const { seminar } = await res.json();
      setSem(seminar);
      toast("Séminaire mis à jour", "success");
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
    setSemEdit(null);
  }

  async function saveAgendaEdit() {
    if (!editAgenda) return;
    try {
      const res = await fetch(apiRoutes.agendaItem(editAgenda.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAgenda),
      });
      if (!res.ok) throw new Error();
      const { agendaItem } = await res.json();
      setAgenda((prev) => prev.map((a) => (a.id === agendaItem.id ? agendaItem : a)));
      toast("Créneau mis à jour", "success");
    } catch {
      toast("Échec de l'enregistrement", "error");
    }
    setEditAgenda(null);
  }

  async function addAgendaItem() {
    if (!editAgenda) return;
    try {
      const res = await fetch(apiRoutes.agenda(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAgenda),
      });
      if (!res.ok) throw new Error();
      const { agendaItem } = await res.json();
      setAgenda((prev) => [...prev, agendaItem]);
      toast("Créneau ajouté", "success");
    } catch {
      toast("Échec de l'ajout", "error");
    }
    setEditAgenda(null);
    setNewAgenda(false);
  }

  async function deleteAgendaItem() {
    const id = deleteAgendaId;
    if (!id) return;
    try {
      const res = await fetch(apiRoutes.agendaItem(id), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAgenda((prev) => prev.filter((a) => a.id !== id));
      toast("Créneau supprimé", "success");
    } catch {
      toast("Échec de la suppression", "error");
    }
    setDeleteAgendaId(null);
  }

  function openNewAgenda() {
    setNewAgenda(true);
    setEditAgenda({
      id: "",
      type: "cours",
      title: "",
      location: "",
      dateStart: new Date().toISOString().slice(0, 10),
      isFeatured: false,
    });
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
            <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
            {" / "}Événements
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">Événements</h1>
        </div>
      </div>

      {/* Card séminaire */}
      {loading ? (
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] overflow-hidden mb-6 animate-pulse">
          <div className="bg-[#3c4a37] px-6 py-5">
            <div className="h-3 w-36 bg-[rgba(251,249,243,0.15)] rounded-full mb-3" />
            <div className="h-6 w-64 max-w-full bg-[rgba(251,249,243,0.15)] rounded mb-2" />
            <div className="h-3 w-48 bg-[rgba(251,249,243,0.12)] rounded mb-1.5" />
            <div className="h-3 w-32 bg-[rgba(251,249,243,0.12)] rounded" />
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-6 mb-5">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-7 w-10 bg-[#e2dac9] rounded mb-1.5" />
                  <div className="h-2.5 w-20 bg-[#e2dac9] rounded" />
                </div>
              ))}
            </div>
            <div className="h-2.5 w-full bg-[#e2dac9] rounded-full" />
          </div>
        </div>
      ) : sem ? (
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] overflow-hidden mb-6">
        <div className="bg-[#3c4a37] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block font-[var(--font-hanken)] text-[10px] uppercase tracking-widest text-[#cda350] font-semibold bg-[rgba(205,163,80,0.15)] px-2 py-0.5 rounded-full mb-2">
                Prochain séminaire
              </span>
              <h2 className="font-[var(--font-cormorant)] font-semibold text-[24px] text-[#fbf9f3] mb-1">{sem.title}</h2>
              <p className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.7)]">
                {new Date(sem.dateStart).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {sem.dateEnd && ` → ${new Date(sem.dateEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
              </p>
              <p className="font-[var(--font-hanken)] text-[13px] text-[rgba(251,249,243,0.7)]">{sem.location}</p>
            </div>
            <button
              onClick={() => setSemEdit({ ...sem })}
              className="shrink-0 px-4 py-2 bg-[rgba(251,249,243,0.1)] hover:bg-[rgba(251,249,243,0.18)] border border-[rgba(251,249,243,0.2)] rounded-[9px] font-[var(--font-hanken)] text-[13px] font-medium text-[#fbf9f3] transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-6 mb-5">
            <div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20] leading-none">{confirmed}</p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">Inscrits confirmés</p>
            </div>
            <div className="w-px h-10 bg-[#e2dac9]" />
            <div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20] leading-none">{Math.max(0, capacity - confirmed)}</p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">Places restantes</p>
            </div>
            <div className="w-px h-10 bg-[#e2dac9]" />
            <div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20] leading-none">{capacity}</p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">Capacité totale</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">Taux de remplissage</span>
              <span className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#b58a3c]">{pct}%</span>
            </div>
            <div className="h-2.5 bg-[#e2dac9] rounded-full overflow-hidden">
              <div className="h-full bg-[#b58a3c] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
      ) : null}

      {/* Agenda */}
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2dac9]">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20]">Programme</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAgendaSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="flex items-center gap-1.5 font-[var(--font-hanken)] text-[12.5px] font-medium text-[#6f7363] hover:text-[#3f463a] transition-colors"
              title="Inverser l'ordre des créneaux"
            >
              <span>{agendaSortDir === "asc" ? "Plus proche → plus lointain" : "Plus lointain → plus proche"}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${agendaSortDir === "desc" ? "rotate-180" : ""}`}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
            <button
              onClick={openNewAgenda}
              className="font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#b58a3c] hover:text-[#9e7832] transition-colors"
            >
              + Ajouter un créneau
            </button>
          </div>
        </div>
        {loading ? (
          <ul className="divide-y divide-[#f0ece3]">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-[92px] shrink-0"><div className="h-3 w-14 bg-[#e2dac9] rounded mx-auto" /></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 w-1/2 bg-[#e2dac9] rounded" />
                  <div className="h-2.5 w-1/3 bg-[#e2dac9] rounded" />
                </div>
                <div className="h-5 w-16 bg-[#e2dac9] rounded-full shrink-0" />
                <div className="w-[72px] shrink-0" />
              </li>
            ))}
          </ul>
        ) : agenda.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucun créneau pour l&apos;instant</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#f0ece3]">
            {sortedAgenda.map((item) => {
              const status = computeAgendaStatus(item);
              const isLive = status === "live";
              return (
              <li
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  isLive ? "bg-[rgba(181,138,60,0.06)] hover:bg-[rgba(181,138,60,0.1)]" : "hover:bg-[#f9f6ef]"
                }`}
              >
                <div className="w-[92px] shrink-0 text-center">
                  <span className="font-[var(--font-hanken)] text-[11px] font-semibold tabular-nums text-[#b58a3c]">
                    {formatAgendaDate(item)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20] line-clamp-1">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`shrink-0 text-[10px] font-semibold font-[var(--font-hanken)] px-1.5 py-0.5 rounded capitalize ${
                        item.type === "séminaire" ? "bg-[rgba(181,138,60,0.12)] text-[#b58a3c]" : "bg-[rgba(60,74,55,0.08)] text-[#3c4a37]"
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] truncate">{item.location}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 text-[10.5px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${
                    isLive ? "bg-[rgba(181,138,60,0.18)] text-[#9e7832]" : status === "upcoming" ? "bg-[#eef4e8] text-[#5f7050]" : "bg-[#f0ece3] text-[#9a9483]"
                  }`}
                >
                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-[#b58a3c] animate-pulse" />}
                  {status === "upcoming" ? "À venir" : isLive ? "En cours" : "Passé"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditAgenda({ ...item })}
                    aria-label="Modifier"
                    title="Modifier"
                    className="w-8 h-8 flex items-center justify-center text-[#6f7363] hover:text-[#b58a3c] hover:bg-[rgba(181,138,60,0.1)] rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#b58a3c]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteAgendaId(item.id)}
                    aria-label="Supprimer"
                    title="Supprimer"
                    className="w-8 h-8 flex items-center justify-center text-[#6f7363] hover:text-[#8a2f29] hover:bg-[rgba(138,47,41,0.1)] rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8a2f29]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Replays */}
      <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden mt-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2dac9]">
          <div>
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20]">Replays</h2>
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] mt-0.5">
              À relier ensuite à un événement passé depuis son bouton « Modifier ».
            </p>
          </div>
        </div>
        <div className="px-5 py-4 border-b border-[#e2dac9] flex flex-col sm:flex-row gap-2">
          <input
            value={newReplayTitle}
            onChange={(e) => setNewReplayTitle(e.target.value)}
            placeholder="Titre du replay"
            className="flex-1 px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
          />
          <input
            value={newReplayUrl}
            onChange={(e) => setNewReplayUrl(e.target.value)}
            placeholder="URL ou ID YouTube"
            dir="ltr"
            className="flex-1 px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
          />
          <button
            onClick={addReplay}
            className="shrink-0 px-4 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] font-[var(--font-hanken)] text-[13px] font-semibold rounded-[9px] transition-colors"
          >
            + Ajouter
          </button>
        </div>
        {loading ? (
          <ul className="divide-y divide-[#f0ece3]">
            {[0, 1].map((i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-3 animate-pulse">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-3.5 w-2/5 bg-[#e2dac9] rounded" />
                  <div className="h-2.5 w-1/4 bg-[#e2dac9] rounded" />
                </div>
                <div className="w-8 h-8 shrink-0" />
              </li>
            ))}
          </ul>
        ) : replays.length === 0 ? (
          <p className="font-[var(--font-hanken)] text-[13.5px] text-[#9a9483] py-8 text-center">Aucun replay pour l&apos;instant</p>
        ) : (
          <ul className="divide-y divide-[#f0ece3]">
            {replays.map((r) => (
              <li key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#f9f6ef] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20]">{r.title}</p>
                  <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483]" dir="ltr">{r.youtubeId ?? "—"}</p>
                </div>
                <button
                  onClick={() => setDeleteReplayId(r.id)}
                  aria-label="Supprimer"
                  title="Supprimer"
                  className="w-8 h-8 shrink-0 flex items-center justify-center text-[#6f7363] hover:text-[#8a2f29] hover:bg-[rgba(138,47,41,0.1)] rounded-[7px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8a2f29]"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal édition séminaire */}
      <Modal isOpen={!!semEdit} title="Modifier le séminaire" onClose={() => setSemEdit(null)}>
        {semEdit && (
          <div className="p-6 space-y-4">
            {(["title", "location"] as const).map((field) => (
              <div key={field}>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5 capitalize">
                  {field === "title" ? "Titre" : "Lieu"}
                </label>
                <input
                  value={semEdit[field]}
                  onChange={(e) => setSemEdit({ ...semEdit, [field]: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Date début</label>
                <input type="date" value={semEdit.dateStart} onChange={(e) => setSemEdit({ ...semEdit, dateStart: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                />
              </div>
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Date fin</label>
                <input type="date" value={semEdit.dateEnd ?? ""} onChange={(e) => setSemEdit({ ...semEdit, dateEnd: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                />
              </div>
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Capacité totale</label>
              <input type="number" min={1} value={semEdit.totalPlaces ?? 0} onChange={(e) => setSemEdit({ ...semEdit, totalPlaces: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Date limite d&apos;inscription</label>
              <input type="date" value={semEdit.registrationDeadline ?? ""} onChange={(e) => setSemEdit({ ...semEdit, registrationDeadline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSemEdit(null)} className="flex-1 py-2.5 border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-medium text-[#6f7363] hover:bg-[#f0ece3] transition-colors">Annuler</button>
              <button onClick={saveSeminar} className="flex-1 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#fbf9f3] transition-colors">Enregistrer</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal créneau agenda */}
      <Modal isOpen={!!editAgenda} title={newAgenda ? "Ajouter un créneau" : "Modifier le créneau"} onClose={() => { setEditAgenda(null); setNewAgenda(false); }}>
        {editAgenda && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Titre</label>
              <input value={editAgenda.title} onChange={(e) => setEditAgenda({ ...editAgenda, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Type</label>
                <select value={editAgenda.type} onChange={(e) => setEditAgenda({ ...editAgenda, type: e.target.value as AgendaItem["type"] })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                >
                  {AGENDA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Date de début</label>
                <input type="date" value={editAgenda.dateStart} onChange={(e) => setEditAgenda({ ...editAgenda, dateStart: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                />
              </div>
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
                Date de fin (optionnel — pour un événement sur plusieurs jours)
              </label>
              <input type="date" value={editAgenda.dateEnd ?? ""} onChange={(e) => setEditAgenda({ ...editAgenda, dateEnd: e.target.value || null })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Lieu</label>
              <input value={editAgenda.location} onChange={(e) => setEditAgenda({ ...editAgenda, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              />
            </div>
            <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
              Le statut « À venir / Passé » se calcule automatiquement à partir de la date — pas besoin de le renseigner.
            </p>
            <div>
              <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
                Replay lié (optionnel — affiché une fois l&apos;événement passé)
              </label>
              <select
                value={editAgenda.replayId ?? ""}
                onChange={(e) => setEditAgenda({ ...editAgenda, replayId: e.target.value || null })}
                className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
              >
                <option value="">— Aucun —</option>
                {replays.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setEditAgenda(null); setNewAgenda(false); }} className="flex-1 py-2.5 border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-medium text-[#6f7363] hover:bg-[#f0ece3] transition-colors">Annuler</button>
              <button onClick={newAgenda ? addAgendaItem : saveAgendaEdit} className="flex-1 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#fbf9f3] transition-colors">
                {newAgenda ? "Ajouter" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteAgendaId}
        title="Supprimer ce créneau ?"
        message="Ce créneau sera retiré du programme de l'événement."
        confirmLabel="Supprimer"
        danger
        onConfirm={deleteAgendaItem}
        onCancel={() => setDeleteAgendaId(null)}
      />

      <ConfirmModal
        isOpen={!!deleteReplayId}
        title="Supprimer ce replay ?"
        message="Les créneaux qui y sont reliés perdront ce lien."
        confirmLabel="Supprimer"
        danger
        onConfirm={deleteReplay}
        onCancel={() => setDeleteReplayId(null)}
      />
    </div>
  );
}
