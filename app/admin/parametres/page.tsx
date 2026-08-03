"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";
import { apiRoutes } from "@/lib/api-routes";

export default function ParametresPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDesc, setSiteDesc] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);
  const [liveCheckEnabled, setLiveCheckEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState<{ start: number; end: number }[]>([{ start: 0, end: 5 }]);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(apiRoutes.adminProfile()).then((res) => (res.ok ? res.json() : Promise.reject())),
      fetch(apiRoutes.adminSettings()).then((res) => (res.ok ? res.json() : Promise.reject())),
    ])
      .then(([profileData, settingsData]) => {
        if (cancelled) return;
        setDisplayName(profileData.profile.displayName);
        setEmail(profileData.profile.email);
        const s = settingsData.settings;
        setSiteName(s?.siteName ?? "Abu Maryam TV");
        setSiteDesc(s?.siteDescription ?? "");
        setNotifEmail(s?.notifyByEmail ?? true);
        setNotifWhatsapp(s?.notifyByWhatsapp ?? false);
        setLiveCheckEnabled(s?.liveCheckEnabled ?? true);
        setQuietHours(s?.liveCheckQuietHours?.length ? s.liveCheckQuietHours : [{ start: 0, end: 5 }]);
      })
      .catch(() => {
        if (!cancelled) toast("Impossible de charger les paramètres", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function saveProfile() {
    if (!displayName.trim() || !email.trim()) {
      toast("Nom et e-mail requis", "error");
      return;
    }
    try {
      const res = await fetch(apiRoutes.adminProfile(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast("Profil mis à jour", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de l'enregistrement", "error");
    }
  }

  async function saveSite() {
    try {
      const res = await fetch(apiRoutes.adminSettings(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName, siteDescription: siteDesc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast("Paramètres du site sauvegardés", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de l'enregistrement", "error");
    }
  }

  async function toggleNotif(key: "notifyByEmail" | "notifyByWhatsapp", nextValue: boolean, label: string) {
    const setter = key === "notifyByEmail" ? setNotifEmail : setNotifWhatsapp;
    setter(nextValue);
    try {
      const res = await fetch(apiRoutes.adminSettings(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: nextValue }),
      });
      if (!res.ok) throw new Error();
      toast(nextValue ? `${label} activé` : `${label} désactivé`, "info");
    } catch {
      setter(!nextValue);
      toast("Échec de la mise à jour", "error");
    }
  }

  async function toggleLiveCheckEnabled(nextValue: boolean) {
    setLiveCheckEnabled(nextValue);
    try {
      const res = await fetch(apiRoutes.adminSettings(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveCheckEnabled: nextValue }),
      });
      if (!res.ok) throw new Error();
      toast(nextValue ? "Détection automatique activée" : "Détection automatique désactivée", "info");
    } catch {
      setLiveCheckEnabled(!nextValue);
      toast("Échec de la mise à jour", "error");
    }
  }

  function updateQuietHour(index: number, patch: Partial<{ start: number; end: number }>) {
    setQuietHours((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addQuietHourRange() {
    setQuietHours((prev) => [...prev, { start: 22, end: 23 }]);
  }

  function removeQuietHourRange(index: number) {
    setQuietHours((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveQuietHours() {
    const invalid = quietHours.some((r) => r.start === r.end);
    if (invalid) {
      toast("Une plage ne peut pas avoir la même heure de début et de fin", "error");
      return;
    }
    try {
      const res = await fetch(apiRoutes.adminSettings(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveCheckQuietHours: quietHours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast("Heures creuses sauvegardées", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de l'enregistrement", "error");
    }
  }

  async function changePassword() {
    if (!currentPw) { toast("Mot de passe actuel requis", "error"); return; }
    if (newPw.length < 8) { toast("Le nouveau mot de passe doit faire au moins 8 caractères", "error"); return; }
    if (newPw !== confirmPw) { toast("Les mots de passe ne correspondent pas", "error"); return; }
    try {
      const res = await fetch(apiRoutes.adminPassword(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Échec de la mise à jour");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast("Mot de passe mis à jour", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Échec de la mise à jour", "error");
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c] transition-colors";
  const labelCls = "block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5";

  if (loading) {
    return (
      <div className="p-8 max-w-[760px]">
        <p className="font-[var(--font-hanken)] text-[14px] text-[#9a9483] py-20 text-center">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[760px]">
      {/* En-tête */}
      <div className="mb-8">
        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
          <Link href="/admin/dashboard" className="hover:text-[#b58a3c] transition-colors">Admin</Link>
          {" / "}Paramètres
        </p>
        <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">Paramètres</h1>
      </div>

      <div className="space-y-6">
        {/* Profil administrateur */}
        <section className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-5">
            Profil administrateur
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Nom affiché</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="Nom affiché" />
            </div>
            <div>
              <label className={labelCls}>Adresse e-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@abumaryam.tv" />
              <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] mt-1.5">
                Utilisée pour se connecter à l&apos;admin — pense à bien la retenir après modification.
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={saveProfile}
                className="px-5 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] font-[var(--font-hanken)] text-[13.5px] font-semibold rounded-[9px] transition-colors">
                Enregistrer
              </button>
            </div>
          </div>
        </section>

        {/* Mot de passe */}
        <section className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-5">
            Changer le mot de passe
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Mot de passe actuel</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className={inputCls} placeholder="Minimum 8 caractères" autoComplete="new-password" />
            </div>
            <div>
              <label className={labelCls}>Confirmer le nouveau mot de passe</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className={inputCls} placeholder="Répéter le mot de passe" autoComplete="new-password" />
            </div>
            <div className="flex justify-end">
              <button onClick={changePassword}
                className="px-5 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] font-[var(--font-hanken)] text-[13.5px] font-semibold rounded-[9px] transition-colors">
                Mettre à jour
              </button>
            </div>
          </div>
        </section>

        {/* Paramètres du site */}
        <section className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-5">
            Paramètres du site
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Nom du site</label>
              <input value={siteName} onChange={(e) => setSiteName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} rows={3}
                className={`${inputCls} resize-none`} />
            </div>
            <div className="flex justify-end">
              <button onClick={saveSite}
                className="px-5 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] font-[var(--font-hanken)] text-[13.5px] font-semibold rounded-[9px] transition-colors">
                Enregistrer
              </button>
            </div>
          </div>
        </section>

        {/* Détection automatique du direct */}
        <section className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-1">
            Détection automatique du direct
          </h2>
          <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483] mb-5">
            Vérifie automatiquement si la chaîne YouTube (configurée dans « En direct ») diffuse — voir
            GUIDE_YOUTUBE_API_KEY.md pour l&apos;activer.
          </p>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20]">Activée</p>
                <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">
                  À désactiver si aucune activité n&apos;est prévue (vacances, pause) — évite de consommer le
                  quota pour rien
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLiveCheckEnabled(!liveCheckEnabled)}
                className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${liveCheckEnabled ? "bg-[#3c4a37]" : "bg-[#d8d0bf]"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${liveCheckEnabled ? "left-4" : "left-0.5"}`} />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>Heures creuses (aucune diffusion attendue)</label>
                <button type="button" onClick={addQuietHourRange}
                  className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#b58a3c] hover:text-[#9e7832] transition-colors">
                  + Ajouter une plage
                </button>
              </div>
              <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] mb-3">
                Aucune vérification pendant ces plages (heure du Sénégal) — le quota économisé resserre
                l&apos;intervalle de vérification le reste du temps.
              </p>
              {quietHours.length === 0 ? (
                <p className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483]">Aucune plage définie.</p>
              ) : (
                <div className="space-y-2">
                  {quietHours.map((range, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select value={range.start} onChange={(e) => updateQuietHour(i, { start: Number(e.target.value) })}
                        className={`${inputCls} w-auto`}>
                        {Array.from({ length: 24 }, (_, h) => (
                          <option key={h} value={h}>{String(h).padStart(2, "0")}h</option>
                        ))}
                      </select>
                      <span className="font-[var(--font-hanken)] text-[12.5px] text-[#9a9483]">à</span>
                      <select value={range.end} onChange={(e) => updateQuietHour(i, { end: Number(e.target.value) })}
                        className={`${inputCls} w-auto`}>
                        {Array.from({ length: 24 }, (_, h) => (
                          <option key={h} value={h}>{String(h).padStart(2, "0")}h</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeQuietHourRange(i)}
                        aria-label="Supprimer cette plage"
                        className="ml-auto w-8 h-8 flex items-center justify-center text-[#8a2f29] hover:bg-[rgba(138,47,41,0.08)] rounded-[7px] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={saveQuietHours}
                className="px-5 py-2.5 bg-[#3c4a37] hover:bg-[#2d3829] text-[#fbf9f3] font-[var(--font-hanken)] text-[13.5px] font-semibold rounded-[9px] transition-colors">
                Enregistrer les heures creuses
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-5">
            Notifications
          </h2>
          <div className="space-y-4">
            {(
              [
                { key: "notifyByEmail" as const, label: "Nouvelle inscription", sub: "Recevoir un e-mail à chaque nouvelle inscription", value: notifEmail },
                { key: "notifyByWhatsapp" as const, label: "Rappel WhatsApp", sub: "Recevoir un message WhatsApp 48h avant le séminaire", value: notifWhatsapp },
              ]
            ).map(({ key, label, sub, value }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20]">{label}</p>
                  <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">{sub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotif(key, !value, label)}
                  className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${value ? "bg-[#3c4a37]" : "bg-[#d8d0bf]"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? "left-4" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Zone danger */}
        <section className="bg-[rgba(138,47,41,0.04)] border border-[rgba(138,47,41,0.2)] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#8a2f29] mb-2">Zone de danger</h2>
          <p className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] mb-4">
            Ces actions sont irréversibles. Procédez avec précaution.
          </p>
          <button
            onClick={() => toast("Contactez le développeur pour cette action.", "error")}
            className="px-5 py-2.5 border border-[rgba(138,47,41,0.4)] text-[#8a2f29] font-[var(--font-hanken)] text-[13.5px] font-semibold rounded-[9px] hover:bg-[rgba(138,47,41,0.06)] transition-colors"
          >
            Réinitialiser toutes les données
          </button>
        </section>
      </div>
    </div>
  );
}
