"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRoutes } from "@/lib/api-routes";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiRoutes.adminLogin(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur de connexion");
      } else {
        router.push(from);
        router.refresh();
      }
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#2d352a] rounded-[16px] p-6 border border-[rgba(255,255,255,0.06)]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@abumaryam.tv"
            className="w-full px-4 py-3 bg-[#232a20] border border-[rgba(255,255,255,0.1)] rounded-[10px] font-[var(--font-hanken)] text-[14px] text-[#fbf9f3] placeholder:text-[#6f7363] focus:outline-none focus:border-[#b58a3c] transition-colors"
          />
        </div>
        <div>
          <label className="block font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#9a9483] uppercase tracking-wider mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-[#232a20] border border-[rgba(255,255,255,0.1)] rounded-[10px] font-[var(--font-hanken)] text-[14px] text-[#fbf9f3] placeholder:text-[#6f7363] focus:outline-none focus:border-[#b58a3c] transition-colors"
          />
        </div>

        {error && (
          <p className="font-[var(--font-hanken)] text-[13px] text-[#c0392b] bg-[rgba(192,57,43,0.1)] px-3 py-2 rounded-[8px]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#b58a3c] hover:bg-[#9e7832] disabled:opacity-50 rounded-[10px] font-[var(--font-hanken)] text-[14px] font-semibold text-[#fbf9f3] transition-colors"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#232a20] px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3c4a37] border border-[rgba(205,163,80,0.3)] mb-4">
            <span className="arabic text-[#cda350] text-[28px]">أ</span>
          </div>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[26px] text-[#fbf9f3]">
            Abu Maryam TV
          </h1>
          <p className="font-[var(--font-hanken)] text-[13px] text-[#9a9483] mt-1">
            Accès administrateur
          </p>
        </div>

        <Suspense fallback={<div className="h-[200px] bg-[#2d352a] rounded-[16px] animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center font-[var(--font-hanken)] text-[12px] text-[#6f7363] mt-6">
          Accès réservé à l&apos;équipe Abu Maryam TV
        </p>
      </div>
    </div>
  );
}
