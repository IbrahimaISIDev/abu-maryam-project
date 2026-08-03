"use client";

import React, { useEffect, useState } from "react";

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

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: status as any } : q))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette question ?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesStatus = filterStatus === "all" || q.status === filterStatus;
    const matchesSearch =
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.theme.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-[1280px] p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2dac9] dark:border-[#3a4132] pb-5">
        <div>
          <h1 className="font-[var(--font-cormorant)] text-3xl font-bold text-[#232a20] dark:text-[#f2ede0]">
            💬 Questions des Auditeurs
          </h1>
          <p className="font-[var(--font-hanken)] text-xs text-[#6f7363] dark:text-[#8f8973]">
            Gérez et préparez les questions posées par la communauté pour les assises de science d'Oustaz.
          </p>
        </div>

        <button
          onClick={fetchQuestions}
          className="rounded-xl border border-[#d8d0bf] bg-white px-4 py-2 text-xs font-semibold text-[#3c4a37] shadow-sm hover:bg-[#fbf9f3] dark:border-[#454c3c] dark:bg-[#20261b] dark:text-[#f2ede0]"
        >
          🔄 Rafraîchir
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "Toutes" },
            { id: "pending", label: "En attente ⏳" },
            { id: "answered", label: "Répondues ✅" },
            { id: "archived", label: "Archivées 📁" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                filterStatus === tab.id
                  ? "bg-[#3c4a37] text-white dark:bg-[#b58a3c]"
                  : "bg-white text-[#6f7363] border border-[#d8d0bf] hover:bg-[#fbf9f3] dark:bg-[#20261b] dark:text-[#b7b2a0] dark:border-[#454c3c]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Rechercher par nom, thème, mot-clé..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-[#d8d0bf] bg-white px-4 py-2 text-xs text-[#232a20] placeholder-[#9a9483] focus:border-[#b58a3c] focus:outline-none dark:border-[#454c3c] dark:bg-[#20261b] dark:text-[#f2ede0]"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6f7363]">
          Chargement des questions en cours...
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8d0bf] py-12 text-center text-xs text-[#6f7363] dark:border-[#454c3c]">
          Aucune question ne correspond à vos critères.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="relative flex flex-col justify-between rounded-2xl border border-[#e2dac9] bg-white p-5 shadow-sm transition hover:shadow-md dark:border-[#3a4132] dark:bg-[#20261b]"
            >
              <div className="space-y-3">
                {/* Status Badge & Theme */}
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-[#b58a3c]/15 px-3 py-1 font-semibold uppercase text-[#b58a3c]">
                    🏷️ {q.theme}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 font-semibold text-xs ${
                      q.status === "answered"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : q.status === "archived"
                        ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {q.status === "answered"
                      ? "Répondu"
                      : q.status === "archived"
                      ? "Archivé"
                      : "En attente"}
                  </span>
                </div>

                {/* Question Text */}
                <blockquote className="font-[var(--font-hanken)] text-sm font-medium text-[#232a20] dark:text-[#f2ede0]">
                  « {q.questionText} »
                </blockquote>

                {/* Author Info */}
                <div className="flex flex-wrap items-center gap-3 border-t border-[#e2dac9]/60 dark:border-[#3a4132]/60 pt-3 text-xs text-[#6f7363] dark:text-[#8f8973]">
                  <span className="font-semibold text-[#3c4a37] dark:text-[#a9c19a]">
                    👤 {q.name}
                  </span>
                  {q.email && <span>📧 {q.email}</span>}
                  {q.phone && <span>📞 {q.phone}</span>}
                  <span className="ml-auto text-[11px]">
                    📅 {new Date(q.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#e2dac9]/60 dark:border-[#3a4132]/60 pt-3 text-xs">
                {q.status !== "answered" && (
                  <button
                    onClick={() => handleUpdateStatus(q.id, "answered")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
                  >
                    ✓ Marquer répondu
                  </button>
                )}
                {q.status !== "archived" && (
                  <button
                    onClick={() => handleUpdateStatus(q.id, "archived")}
                    className="rounded-lg border border-[#d8d0bf] bg-white px-3 py-1.5 font-semibold text-[#6f7363] hover:bg-gray-50 dark:border-[#454c3c] dark:bg-[#20261b] dark:text-[#b7b2a0]"
                  >
                    📁 Archiver
                  </button>
                )}
                {q.status !== "pending" && (
                  <button
                    onClick={() => handleUpdateStatus(q.id, "pending")}
                    className="rounded-lg border border-[#d8d0bf] bg-white px-3 py-1.5 font-semibold text-[#6f7363] hover:bg-gray-50 dark:border-[#454c3c] dark:bg-[#20261b] dark:text-[#b7b2a0]"
                  >
                    ⏳ Repasser en attente
                  </button>
                )}
                <button
                  onClick={() => handleDelete(q.id)}
                  className="rounded-lg bg-red-100 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300"
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
