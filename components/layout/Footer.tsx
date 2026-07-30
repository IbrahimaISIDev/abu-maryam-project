"use client";

import Link from "@/components/ui/LocalizedLink";
import SocialIcon from "@/components/ui/SocialIcon";
import BrandMark from "@/components/ui/BrandMark";
import { socialLinks } from "@/data/socials";
import { useDictionary } from "@/contexts/DictionaryContext";
import { formatSocialLabel } from "@/lib/format";

export default function Footer() {
  const { dict, lang } = useDictionary();

  const quickLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/bibliotheque", label: dict.nav.library },
    { href: "/en-direct", label: dict.nav.live },
    { href: "/evenements", label: dict.nav.events },
    { href: "/activites", label: dict.nav.activities },
    { href: "/a-propos", label: dict.nav.about },
  ];

  return (
    <footer className="bg-[#fbf9f3] dark:bg-[#20261b] border-t border-[#e2dac9] dark:border-[#3a4132] mt-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-10">
          {/* Marque + tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:rtl:text-right md:ltr:text-left">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <BrandMark size={30} />
              <span className="font-[var(--font-cormorant)] font-bold text-[18px] text-[#232a20] dark:text-[#f2ede0]">
                Abu Maryam <span className="text-[#b58a3c] dark:text-[#e3c685]">TV</span>
              </span>
            </Link>
            <p className="font-[var(--font-hanken)] text-[13px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed max-w-[280px]">
              {dict.footer.tagline}
            </p>
          </div>

          {/* Liens rapides */}
          <div className="flex flex-col items-center md:items-start text-center md:rtl:text-right md:ltr:text-left">
            <h3 className="font-[var(--font-hanken)] text-[11px] font-semibold uppercase tracking-widest text-[#6f7363] dark:text-[#8f8973] mb-4">
              {dict.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-[var(--font-hanken)] text-[13.5px] text-[#3f463a] dark:text-[#d8d4c4] hover:text-[#b58a3c] dark:hover:text-[#e3c685] transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex flex-col items-center md:items-start text-center md:rtl:text-right md:ltr:text-left">
            <h3 className="font-[var(--font-hanken)] text-[11px] font-semibold uppercase tracking-widest text-[#6f7363] dark:text-[#8f8973] mb-4">
              {dict.footer.followUs}
            </h3>
            <ul className="space-y-2.5">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-start gap-2.5 font-[var(--font-hanken)] text-[13.5px] text-[#3f463a] dark:text-[#d8d4c4] hover:text-[#b58a3c] dark:hover:text-[#e3c685] transition-colors"
                  >
                    <SocialIcon id={s.id} className="w-4 h-4 shrink-0" />
                    {formatSocialLabel(s.id, s.label, lang)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barre inférieure */}
        <div className="pt-6 border-t border-[#e2dac9] dark:border-[#3a4132] flex justify-center md:justify-start">
          <p className="font-[var(--font-hanken)] text-[12px] text-[#6f7363] dark:text-[#8f8973] text-center md:rtl:text-right md:ltr:text-left">
            Al-Qur&apos;an ak Sunna si Déginou Sahaaba yi · © 2026 Abu Maryam TV
          </p>
        </div>
      </div>
    </footer>
  );
}
