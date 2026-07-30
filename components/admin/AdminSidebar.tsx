"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import { apiRoutes } from "@/lib/api-routes";

const navItems = [
  {
    label: "Tableau de bord",
    href: "/admin/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Enseignements",
    href: "/admin/enseignements",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="6 3 20 12 6 21 6 3" />
      </svg>
    ),
  },
  {
    label: "Séries",
    href: "/admin/series",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="4" rx="1" />
        <rect x="3" y="10" width="18" height="4" rx="1" />
        <rect x="3" y="17" width="18" height="4" rx="1" />
      </svg>
    ),
  },
  {
    label: "Événements",
    href: "/admin/evenements",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Inscriptions",
    href: "/admin/inscriptions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "En direct",
    href: "/admin/direct",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 16.24a6 6 0 0 1 0-8.49M20.49 3.51a12 12 0 0 1 0 16.99M3.51 20.49a12 12 0 0 1 0-16.99" />
      </svg>
    ),
  },
  {
    label: "Paramètres",
    href: "/admin/parametres",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch(apiRoutes.adminLogout(), { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
    <GlobalSearch />
    <aside className="w-[240px] shrink-0 bg-[#232a20] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3c4a37] border border-[rgba(205,163,80,0.3)] flex items-center justify-center">
            <span className="arabic text-[#cda350] text-[16px]">أ</span>
          </div>
          <div>
            <p className="font-[var(--font-cormorant)] font-semibold text-[15px] text-[#fbf9f3] leading-none">Abu Maryam TV</p>
            <p className="font-[var(--font-hanken)] text-[10px] text-[#9a9483] mt-0.5">Back-office</p>
          </div>
        </div>
      </div>

      {/* Recherche globale ⌘K */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] text-[#9a9483] hover:text-[#d8d0bf] hover:border-[rgba(255,255,255,0.12)] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <span className="font-[var(--font-hanken)] text-[12.5px] flex-1 text-left">Rechercher…</span>
          <kbd className="text-[10px] bg-[rgba(255,255,255,0.07)] px-1.5 py-0.5 rounded font-[var(--font-hanken)]">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-[var(--font-hanken)] text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-[#3c4a37] text-[#fbf9f3]"
                  : "text-[#9a9483] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#d8d0bf]"
              }`}
            >
              <span className={isActive ? "text-[#cda350]" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pied de sidebar */}
      <div className="px-3 py-4 border-t border-[rgba(255,255,255,0.08)]">
        <div className="px-3 py-2 mb-2">
          <p className="font-[var(--font-hanken)] text-[12px] font-semibold text-[#fbf9f3]">Administrateur</p>
          <p className="font-[var(--font-hanken)] text-[11px] text-[#9a9483]">admin@abumaryam.tv</p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-[var(--font-hanken)] text-[13px] text-[#9a9483] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#d8d0bf] transition-colors mb-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Voir le site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-[var(--font-hanken)] text-[13px] text-[#9a9483] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#d8d0bf] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </aside>
    </>
  );
}
