"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Link from "@/components/ui/LocalizedLink";
import BrandMark from "@/components/ui/BrandMark";
import { useSearch } from "@/contexts/SearchContext";
import { useDictionary } from "@/contexts/DictionaryContext";
import { switchLocalePath } from "@/lib/i18n";

export default function MobileHeader({ title }: { title?: string }) {
  const { openSearch } = useSearch();
  const { dict, lang } = useDictionary();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-50 bg-[#fbf9f3] dark:bg-[#20261b] border-b border-[#e2dac9] dark:border-[#3a4132] px-4 py-3 flex items-center justify-between">
      {title ? (
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#3c4a37] dark:text-[#a9c19a]" aria-label={dict.mobileHeader.back}>
            <svg className="rtl:-scale-x-100" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="font-[var(--font-hanken)] font-semibold text-[16px] text-[#232a20] dark:text-[#f2ede0]">
            {title}
          </span>
        </div>
      ) : (
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={32} />
          <span className="font-[var(--font-cormorant)] font-bold text-[18px] text-[#232a20] dark:text-[#f2ede0]">
            Abu Maryam <span className="text-[#b58a3c] dark:text-[#e3c685]">TV</span>
          </span>
        </Link>
      )}

      <div className="flex items-center gap-2">
        <button type="button" onClick={openSearch} className="w-[32px] h-[32px] flex items-center justify-center text-[#6f7363] dark:text-[#b7b2a0]" aria-label={dict.mobileHeader.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-[32px] h-[32px] flex items-center justify-center text-[#6f7363] dark:text-[#b7b2a0]"
            aria-label={dict.mobileHeader.menu}
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-label={lang === "ar" ? "إغلاق القائمة" : "Fermer le menu"}
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute z-50 top-[calc(100%+8px)] right-0 rtl:right-auto rtl:left-0 w-[180px] bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[12px] shadow-lg overflow-hidden">
                <p className="px-4 pt-3 pb-1 font-[var(--font-hanken)] text-[10.5px] uppercase tracking-widest font-semibold text-[#6f7363] dark:text-[#8f8973]">
                  {lang === "ar" ? "اللغة" : "Langue"}
                </p>
                <div className="flex items-center gap-3 px-4 pb-3">
                  <NextLink
                    href={switchLocalePath(pathname, "", "fr")}
                    onClick={() => setMenuOpen(false)}
                    aria-label="Passer en français"
                    className={`flex items-center gap-1.5 text-[14px] font-[var(--font-hanken)] font-medium transition-opacity ${lang === "fr" ? "opacity-100" : "opacity-45"}`}
                  >
                    <span className="text-[18px] leading-none">🇫🇷</span> Français
                  </NextLink>
                </div>
                <div className="flex items-center gap-3 px-4 pb-3">
                  <NextLink
                    href={switchLocalePath(pathname, "", "ar")}
                    onClick={() => setMenuOpen(false)}
                    aria-label="التبديل إلى العربية"
                    className={`flex items-center gap-1.5 text-[14px] font-[var(--font-hanken)] font-medium transition-opacity ${lang === "ar" ? "opacity-100" : "opacity-45"}`}
                  >
                    <span className="text-[18px] leading-none">🇸🇦</span> العربية
                  </NextLink>
                </div>
                <div className="border-t border-[#e2dac9] dark:border-[#3a4132] py-1">
                  <Link
                    href="/activites"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[13.5px] font-[var(--font-hanken)] font-medium text-[#6f7363] dark:text-[#b7b2a0] hover:bg-[rgba(0,0,0,0.02)]"
                  >
                    {dict.nav.activities}
                  </Link>
                  <Link
                    href="/a-propos"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-[13.5px] font-[var(--font-hanken)] font-medium text-[#6f7363] dark:text-[#b7b2a0] hover:bg-[rgba(0,0,0,0.02)]"
                  >
                    {dict.nav.about}
                  </Link>
                </div>
                <Link
                  href="/en-direct"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 border-t border-[#e2dac9] dark:border-[#3a4132] text-[13.5px] font-[var(--font-hanken)] font-semibold text-[#8a2f29] dark:text-[#e08b81]"
                >
                  {dict.nav.watchLive}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
