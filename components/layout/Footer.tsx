import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#fbf9f3] dark:bg-[#20261b] border-t border-[#e2dac9] dark:border-[#3a4132] mt-16">
      <div className="max-w-[1280px] mx-auto px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
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

        <p className="font-[var(--font-hanken)] text-[12px] text-[#9a9483] dark:text-[#8f8973] text-center">
          Al-Qur&apos;an ak Sunna si Déginou Sahaaba yi · © 2026
        </p>
      </div>
    </footer>
  );
}
