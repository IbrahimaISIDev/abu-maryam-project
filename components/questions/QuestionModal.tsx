"use client";

import React, { useState } from "react";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestionModal({ isOpen, onClose }: QuestionModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [theme, setTheme] = useState("rappel");
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, theme, questionText }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("BarakAllahu feek ! Votre question a été transmise à Oustaz.");
        setName("");
        setEmail("");
        setPhone("");
        setQuestionText("");
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 2500);
      } else {
        setErrorMsg(data.error || "Une erreur est survenue lors de la soumission.");
      }
    } catch {
      setErrorMsg("Impossible d'envoyer la question. Veuillez vérifier votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#b58a3c]/30 bg-gradient-to-b from-[#1c2419] to-[#0f140e] p-6 text-white shadow-2xl md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💬</span>
            <h3 className="font-[var(--font-cormorant)] text-xl font-bold text-[#e6cf8b] md:text-2xl">
              Poser une question à Oustaz Niang Mbaye
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-white/70">
          Posez vos questions d'ordre religieux, juridique ou pratique pour les prochaines assises et directs.
        </p>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-semibold text-emerald-300">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/60 p-4 text-xs font-semibold text-red-300">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#b58a3c]">
              Nom ou Pseudonyme *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Frère Mouhammad"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[#b58a3c] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-white/70">
                Email (optionnel)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-[#b58a3c] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70">
                Thème de la question
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#1c2419] px-3.5 py-2 text-xs text-white focus:border-[#b58a3c] focus:outline-none"
              >
                <option value="rappel">Rappel / Général</option>
                <option value="tafsir">Tafsir (Exégèse)</option>
                <option value="tawhid">Tawhid (Unicité)</option>
                <option value="akhlaq">Akhlaq (Comportement)</option>
                <option value="salat">Salat & Fiqh (Prière)</option>
                <option value="famille">Famille & Mariage</option>
                <option value="sunna">Sunna & Hadith</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#b58a3c]">
              Votre Question *
            </label>
            <textarea
              required
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Rédigez clairement votre question..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-white/40 focus:border-[#b58a3c] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#b58a3c] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#b58a3c]/30 hover:bg-[#c99b45] disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "📤 Envoyer la Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
