import Link from "next/link";

export default function MobileHeader({ title }: { title?: string }) {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-[#fbf9f3] dark:bg-[#20261b] border-b border-[#e2dac9] dark:border-[#3a4132] px-4 py-3 flex items-center justify-between">
      {title ? (
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[#3c4a37] dark:text-[#a9c19a]" aria-label="Retour">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="font-[var(--font-hanken)] font-semibold text-[16px] text-[#232a20] dark:text-[#f2ede0]">
            {title}
          </span>
        </div>
      ) : (
        <Link href="/" className="flex items-center gap-2">
          <div className="w-[32px] h-[32px] rounded-full bg-[#3c4a37] flex items-center justify-center">
            <span className="arabic text-[#cda350] text-[15px] leading-none" aria-hidden="true">
              أ
            </span>
          </div>
          <span className="font-[var(--font-cormorant)] font-bold text-[18px] text-[#232a20] dark:text-[#f2ede0]">
            Abu Maryam <span className="text-[#b58a3c] dark:text-[#e3c685]">TV</span>
          </span>
        </Link>
      )}

      <div className="flex items-center gap-2">
        <button className="w-[32px] h-[32px] flex items-center justify-center text-[#6f7363] dark:text-[#b7b2a0]" aria-label="Rechercher">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
        <button className="w-[32px] h-[32px] flex items-center justify-center text-[#6f7363] dark:text-[#b7b2a0]" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
