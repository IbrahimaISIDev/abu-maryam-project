import Link from "next/link";
import SocialIcon from "@/components/ui/SocialIcon";
import { socialLinks } from "@/data/socials";

export default function Footer() {
  return (
    <footer className="bg-[#fbf9f3] dark:bg-[#20261b] border-t border-[#e2dac9] dark:border-[#3a4132] mt-16">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-full bg-[#3c4a37] flex items-center justify-center">
            <span className="arabic text-[#cda350] text-[14px] leading-none" aria-hidden="true">
              أ
            </span>
          </div>
          <span className="font-[var(--font-cormorant)] font-bold text-[18px] text-[#232a20] dark:text-[#f2ede0]">
            Abu Maryam <span className="text-[#b58a3c] dark:text-[#e3c685]">TV</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="w-[34px] h-[34px] rounded-full border border-[#d8d0bf] dark:border-[#454c3c] flex items-center justify-center text-[#6f7363] dark:text-[#b7b2a0] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
            >
              <SocialIcon id={s.id} className="w-4 h-4" />
            </a>
          ))}
        </div>

        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] dark:text-[#8f8973] text-center">
          Al-Qur&apos;an ak Sunna si Déginou Sahaaba yi · © 2026
        </p>
      </div>
    </footer>
  );
}
