import type { Metadata } from "next";
import Link from "next/link";
import { teachings } from "@/data/teachings";
import { seriesList } from "@/data/series";
import { registrations } from "@/data/registrations";
import { seminar } from "@/data/events";

export const metadata: Metadata = { title: "Tableau de bord" };

const statCards = [
  {
    label: "Enseignements",
    value: teachings.length,
    sub: `${teachings.filter((t) => t.type === "video").length} vidéos · ${teachings.filter((t) => t.type === "audio").length} audios`,
    href: "/admin/enseignements",
    color: "#3c4a37",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="6 3 20 12 6 21 6 3" />
      </svg>
    ),
  },
  {
    label: "Séries",
    value: seriesList.length,
    sub: `${seriesList.reduce((s, r) => s + r.totalEpisodes, 0)} épisodes au total`,
    href: "/admin/series",
    color: "#b58a3c",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="4" rx="1" />
        <rect x="3" y="10" width="18" height="4" rx="1" />
        <rect x="3" y="17" width="18" height="4" rx="1" />
      </svg>
    ),
  },
  {
    label: "Inscriptions",
    value: registrations.length,
    sub: `${registrations.filter((r) => r.status === "confirmed").length} confirmées · ${registrations.filter((r) => r.status === "pending").length} en attente`,
    href: "/admin/inscriptions",
    color: "#5f7050",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Prochain séminaire",
    value: new Date(seminar.dateStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    sub: seminar.location,
    href: "/admin/evenements",
    color: "#8a2f29",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const recent = [...registrations]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  const recentTeachings = teachings.slice(0, 5);

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-8">
        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
          Tableau de bord
        </p>
        <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">
          Bienvenue, Administrateur
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] p-5 hover:border-[#d0c9b8] hover:shadow-sm transition-all group">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: card.color }}
              >
                {card.icon}
              </div>
              <p className="font-[var(--font-cormorant)] font-semibold text-[34px] text-[#232a20] leading-none mb-1">
                {card.value}
              </p>
              <p className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#3f463a] mb-0.5">
                {card.label}
              </p>
              <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">
                {card.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Deux colonnes : dernières inscriptions + derniers enseignements */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Dernières inscriptions */}
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2dac9]">
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20]">
              Dernières inscriptions
            </h2>
            <Link href="/admin/inscriptions" className="font-[var(--font-hanken)] text-[12px] font-medium text-[#b58a3c] hover:text-[#9e7832]">
              Voir tout →
            </Link>
          </div>
          <ul className="divide-y divide-[#f0ece3]">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[15px] text-[#6f7363]">
                  {r.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20] truncate">{r.fullName}</p>
                  <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">{r.city}</p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>

        {/* Derniers enseignements */}
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2dac9]">
            <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20]">
              Derniers enseignements
            </h2>
            <Link href="/admin/enseignements" className="font-[var(--font-hanken)] text-[12px] font-medium text-[#b58a3c] hover:text-[#9e7832]">
              Voir tout →
            </Link>
          </div>
          <ul className="divide-y divide-[#f0ece3]">
            {recentTeachings.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-[6px] bg-[#3c4a37] flex items-center justify-center shrink-0 text-[#cda350] text-[12px]">
                  {t.type === "video" ? "▶" : "♪"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20] truncate">{t.title}</p>
                  <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">{t.duration} · {t.theme}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${t.type === "video" ? "bg-[rgba(60,74,55,0.1)] text-[#3c4a37]" : "bg-[rgba(181,138,60,0.1)] text-[#b58a3c]"}`}>
                  {t.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Confirmé", cls: "bg-[#eef4e8] text-[#5f7050]" },
    pending:   { label: "En attente", cls: "bg-[rgba(181,138,60,0.1)] text-[#b58a3c]" },
    cancelled: { label: "Annulé", cls: "bg-[rgba(138,47,41,0.08)] text-[#8a2f29]" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`shrink-0 text-[10.5px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}
