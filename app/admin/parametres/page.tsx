"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

export default function ParametresPage() {
  const toast = useToast();

  const [displayName, setDisplayName] = useState("Administrateur");
  const [email, setEmail] = useState("admin@abumaryam.tv");
  const [siteName, setSiteName] = useState("Abu Maryam TV");
  const [siteDesc, setSiteDesc] = useState("Plateforme islamique d'Oustaz Niang Mbaye (H.A)");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  function saveProfile() {
    if (!displayName.trim() || !email.trim()) {
      toast("Nom et e-mail requis", "error");
      return;
    }
    toast("Profil mis à jour", "success");
  }

  function saveSite() {
    toast("Paramètres du site sauvegardés", "success");
  }

  function changePassword() {
    if (!currentPw) { toast("Mot de passe actuel requis", "error"); return; }
    if (newPw.length < 8) { toast("Le nouveau mot de passe doit faire au moins 8 caractères", "error"); return; }
    if (newPw !== confirmPw) { toast("Les mots de passe ne correspondent pas", "error"); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast("Mot de passe mis à jour", "success");
  }

  const inputCls = "w-full px-4 py-2.5 bg-[#f5f1e8] border border-[#d8d0bf] rounded-[9px] font-[var(--font-hanken)] text-[13.5px] text-[#232a20] placeholder:text-[#9a9483] focus:outline-none focus:border-[#b58a3c] transition-colors";
  const labelCls = "block font-[var(--font-hanken)] text-[12px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5";

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

        {/* Notifications */}
        <section className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] p-6">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-5">
            Notifications
          </h2>
          <div className="space-y-4">
            {[
              { label: "Nouvelle inscription", sub: "Recevoir un e-mail à chaque nouvelle inscription", value: notifEmail, set: setNotifEmail },
              { label: "Rappel WhatsApp", sub: "Recevoir un message WhatsApp 48h avant le séminaire", value: notifWhatsapp, set: setNotifWhatsapp },
            ].map(({ label, sub, value, set }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#232a20]">{label}</p>
                  <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483]">{sub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { set(!value); toast(value ? `${label} désactivé` : `${label} activé`, "info"); }}
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
