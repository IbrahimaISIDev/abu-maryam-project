"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AgendaItem, Registration, Seminar } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";
import { computeAgendaStatus } from "@/lib/activities";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { apiRoutes } from "@/lib/api-routes";

const AGENDA_TYPES: AgendaItem["type"][] = ["séminaire", "conférence", "khoutba", "cours", "tafsir"];

export default function EvenementsAdminPage() {
  const toast = useToast();
  const [sem, setSem] = useState<Seminar | null>(null);
  const [semEdit, setSemEdit] = useState<Seminar | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAgenda, setEditAgenda] = useState<AgendaItem | null>(null);
  const [newAgenda, setNewAgenda] = useState(false);
  const [deleteAgendaId, setDeleteAgendaId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiRoutes.seminar()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.agenda()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.inscription()).then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(
        ([seminarData, agendaData, regData]: [
          { seminar: Seminar | null },
          { agendaItems: AgendaItem[] },
          { registrations: Registration[] },
        ]) => {
          if (cancelled) return;
          setSem(seminarData.seminar);
          setAgenda(agendaData.agendaItems);
          setRegistrations(regData.registrations);
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

  const confirmed = registrations.filter((r) => r.status === "confirmed").length;
  const capacity = sem?.totalPlaces ?? 150;
  const pct = Math.round((confirmed / capacity) * 100);

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
        <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-10 text-center">Chargement…</p>
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
          <button
            onClick={openNewAgenda}
            className="font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#b58a3c] hover:text-[#9e7832] transition-colors"
          >
            + Ajouter un créneau
          </button>
        </div>
        {loading ? (
          <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-12 text-center">Chargement…</p>
        ) : agenda.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483]">Aucun créneau pour l&apos;instant</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#f0ece3]">
            {agenda.map((item) => {
              const status = computeAgendaStatus(item);
              return (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-[#f9f6ef] transition-colors">
                <div className="w-[80px] shrink-0 text-center">
                  <span className="font-[var(--font-hanken)] text-[11px] font-semibold tabular-nums text-[#b58a3c]">
                    {new Date(item.dateStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20]">{item.title}</p>
                  <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">{item.location} · <span className="capitalize">{item.type}</span></p>
                </div>
                <span className={`shrink-0 text-[10.5px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${status !== "past" ? "bg-[#eef4e8] text-[#5f7050]" : "bg-[#f0ece3] text-[#9a9483]"}`}>
                  {status === "upcoming" ? "À venir" : status === "live" ? "En cours" : "Passé"}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditAgenda({ ...item })}
                    className="font-[var(--font-hanken)] text-[12px] text-[#b58a3c] hover:text-[#9e7832] transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setDeleteAgendaId(item.id)}
                    className="font-[var(--font-hanken)] text-[12px] text-[#8a2f29] hover:text-[#6e2520] transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
              );
            })}
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
                <label className="block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" value={editAgenda.dateStart} onChange={(e) => setEditAgenda({ ...editAgenda, dateStart: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] focus:outline-none focus:border-[#b58a3c]"
                />
              </div>
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
    </div>
  );
}
