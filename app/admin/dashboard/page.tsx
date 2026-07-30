import type { Metadata } from "next";
import Link from "next/link";
import { getAllTeachingsAdmin, getAllSeries, getRegistrations, getSeminar, getLiveStatus } from "@/lib/db/queries";
import { daysUntil } from "@/lib/activities";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const [teachings, seriesList, registrations, seminar, liveStatus] = await Promise.all([
    getAllTeachingsAdmin(),
    getAllSeries(),
    getRegistrations(),
    getSeminar(),
    getLiveStatus(),
  ]);

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
      value: seminar ? new Date(seminar.dateStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—",
      sub: seminar?.location ?? "Aucun séminaire configuré",
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

  const daysUntilSeminar = seminar ? daysUntil(seminar.dateStart) : null;
  const seminarImminent = daysUntilSeminar !== null && daysUntilSeminar >= 0 && daysUntilSeminar <= 14;

  const recent = [...registrations]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  const recentTeachings = teachings.slice(0, 5);

  return (
    <div className="p-8">
      {/* Alerte séminaire imminent */}
      {seminarImminent && seminar && (
        <div className="mb-6 flex items-center gap-3 bg-[rgba(138,47,41,0.07)] border border-[rgba(138,47,41,0.25)] rounded-[12px] px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-[rgba(138,47,41,0.12)] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a2f29" strokeWidth="2">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[var(--font-hanken)] text-[13.5px] font-semibold text-[#8a2f29]">
              Séminaire dans {daysUntilSeminar === 0 ? "aujourd'hui !" : `${daysUntilSeminar} jour${daysUntilSeminar > 1 ? "s" : ""}`}
            </p>
            <p className="font-[var(--font-hanken)] text-[12px] text-[#6f7363]">
              {seminar.title} · {seminar.remainingPlaces} places restantes · deadline inscription {new Date(seminar.registrationDeadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </p>
          </div>
          <Link
            href="/admin/evenements"
            className="shrink-0 font-[var(--font-hanken)] text-[12.5px] font-semibold text-[#8a2f29] hover:text-[#6d2421] transition-colors"
          >
            Gérer →
          </Link>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] uppercase tracking-widest mb-1">
            Tableau de bord
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[32px] text-[#232a20]">
            Bienvenue, Administrateur
          </h1>
        </div>

        {/* Statut du direct */}
        <Link href="/admin/direct">
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] border transition-colors ${
            liveStatus.isLive
              ? "bg-[rgba(138,47,41,0.07)] border-[rgba(138,47,41,0.25)] hover:border-[rgba(138,47,41,0.5)]"
              : "bg-[#fbf9f3] border-[#e2dac9] hover:border-[#d0c9b8]"
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${liveStatus.isLive ? "bg-[#c0392b] animate-pulse" : "bg-[#d8d0bf]"}`} />
            <div>
              <p className={`font-[var(--font-hanken)] text-[12.5px] font-semibold ${liveStatus.isLive ? "text-[#8a2f29]" : "text-[#9a9483]"}`}>
                {liveStatus.isLive ? "En direct" : "Hors ligne"}
              </p>
              {liveStatus.isLive && (
                <p className="font-[var(--font-hanken)] text-[11px] text-[#6f7363] max-w-[180px] truncate">
                  {liveStatus.title}
                </p>
              )}
            </div>
          </div>
        </Link>
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
            {recent.map((r) => {
              return (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3 group">
                  <div className="w-8 h-8 rounded-full bg-[#e9e3d4] flex items-center justify-center shrink-0 font-[var(--font-cormorant)] font-semibold text-[15px] text-[#6f7363]">
                    {r.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-[var(--font-hanken)] text-[13px] font-semibold text-[#232a20] truncate">{r.fullName}</p>
                    <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">{r.city}</p>
                  </div>
                  <a
                    href={buildWhatsAppContactLink(r.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-[5px] text-[#25D366] hover:bg-[rgba(37,211,102,0.1)] transition-all"
                    title="WhatsApp"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.103 1.514 5.817L.057 23.882l6.22-1.432A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.7-.494-5.28-1.366l-.38-.225-3.692.85.895-3.576-.246-.394A9.931 9.931 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                  </a>
                  <StatusBadge status={r.status} />
                </li>
              );
            })}
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
                <div className="flex items-center gap-1.5 shrink-0">
                  {t.published === false && (
                    <span className="text-[10px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full bg-[rgba(154,148,131,0.15)] text-[#9a9483]">
                      Brouillon
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold font-[var(--font-hanken)] px-2 py-0.5 rounded-full ${t.type === "video" ? "bg-[rgba(60,74,55,0.1)] text-[#3c4a37]" : "bg-[rgba(181,138,60,0.1)] text-[#b58a3c]"}`}>
                    {t.type}
                  </span>
                </div>
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
