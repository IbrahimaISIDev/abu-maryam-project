"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LiveDot from "@/components/ui/LiveDot";
import BrandMark from "@/components/ui/BrandMark";

const navLinks = [
  { href: "/",            label: "Accueil" },
  { href: "/bibliotheque", label: "Bibliothèque" },
  { href: "/en-direct",   label: "En direct" },
  { href: "/evenements",  label: "Événements" },
  { href: "/a-propos",    label: "À propos" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden md:block bg-[#fbf9f3] dark:bg-[#20261b] border-b border-[#e2dac9] dark:border-[#3a4132]">
      <nav className="max-w-[1280px] mx-auto flex items-center gap-8 px-10 py-[18px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-4">
          <BrandMark size={38} />
          <div className="flex flex-col">
            <span className="font-[var(--font-cormorant)] font-bold text-[21px] leading-tight text-[#232a20] dark:text-[#f2ede0]">
              Abu Maryam{" "}
              <span className="text-[#b58a3c] dark:text-[#e3c685]">TV</span>
            </span>
            <span className="font-[var(--font-hanken)] text-[10px] tracking-[.22em] text-[#9a9483] dark:text-[#8f8973] uppercase">
              Qur&apos;an &amp; Sunna
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <ul className="flex items-center gap-6 flex-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-[var(--font-hanken)] text-[14.5px] font-medium pb-1 transition-colors ${
                    isActive
                      ? "text-[#3c4a37] dark:text-[#a9c19a] border-b-2 border-[#b58a3c]"
                      : "text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#3c4a37] dark:hover:text-[#a9c19a] transition-colors"
            aria-label="Changer de langue"
          >
            FR <span className="arabic text-[11px]">| ع</span>
          </button>

          {/* Bouton recherche */}
          <button
            className="w-[34px] h-[34px] rounded-full border border-[#d8d0bf] dark:border-[#454c3c] flex items-center justify-center text-[#6f7363] dark:text-[#b7b2a0] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
            aria-label="Rechercher"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Regarder le live */}
          <Link
            href="/en-direct"
            className="flex items-center gap-2 bg-[#8a2f29] text-[#fbf9f3] text-[13px] font-semibold font-[var(--font-hanken)] px-4 py-2 rounded-full hover:bg-[#7a2923] transition-colors"
          >
            <LiveDot />
            Regarder le live
          </Link>
        </div>
      </nav>
    </header>
  );
}
