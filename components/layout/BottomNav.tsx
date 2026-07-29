"use client";

import Link from "@/components/ui/LocalizedLink";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/contexts/DictionaryContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { dict, lang } = useDictionary();

  const navItems = [
    {
      href: "/",
      label: dict.bottomNav.home,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <path d="M9 22V12h6v10" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      href: "/bibliotheque",
      label: dict.bottomNav.library,
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    {
      href: "/en-direct",
      label: dict.bottomNav.live,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="5 3 19 12 5 21 5 3" fill={active ? "currentColor" : "none"} />
        </svg>
      ),
    },
    {
      href: "/evenements",
      label: dict.bottomNav.events,
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      href: "/a-propos",
      label: dict.bottomNav.profile,
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fbf9f3] dark:bg-[#20261b] border-t border-[#e2dac9] dark:border-[#3a4132] pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon }) => {
          const localizedHref = href === "/" ? `/${lang}` : `/${lang}${href}`;
          const isActive = pathname === localizedHref;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 min-w-[48px] py-1 ${
                  isActive ? "text-[#3c4a37] dark:text-[#a9c19a]" : "text-[#6f7363] dark:text-[#8f8973]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {icon(isActive)}
                <span className="text-[10px] font-[var(--font-hanken)] font-medium">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
