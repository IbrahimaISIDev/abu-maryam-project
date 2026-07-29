"use client";

import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import Link from "@/components/ui/LocalizedLink";
import { useDictionary } from "@/contexts/DictionaryContext";

export default function NotFound() {
  const { dict } = useDictionary();

  return (
    <>
      <Navbar />
      <MobileHeader title={dict.notFound.badge} />

      <main id="main-content" className="pb-20 md:pb-0">
        <div className="max-w-[600px] mx-auto px-6 py-20 md:py-32 text-center">
          <p className="arabic text-[#b58a3c] dark:text-[#e3c685] text-[20px] mb-6">
            وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ
          </p>
          <p className="font-[var(--font-hanken)] text-[13px] font-semibold uppercase tracking-widest text-[#6f7363] dark:text-[#8f8973] mb-3">
            {dict.notFound.badge}
          </p>
          <p className="font-[var(--font-cormorant)] font-semibold text-[110px] leading-none text-[#3c4a37] dark:text-[#a9c19a] mb-2 tabular-nums">
            404
          </p>
          <h1 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] dark:text-[#f2ede0] leading-tight mb-4">
            {dict.notFound.title}
          </h1>
          <p className="font-[var(--font-hanken)] text-[14.5px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed mb-9 max-w-[440px] mx-auto">
            {dict.notFound.message}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[#9e7832] transition-colors"
            >
              {dict.notFound.backHome}
            </Link>
            <Link
              href="/bibliotheque"
              className="border-2 border-[#3c4a37] dark:border-[#a9c19a] text-[#3c4a37] dark:text-[#a9c19a] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[rgba(60,74,55,0.06)] dark:hover:bg-[rgba(169,193,154,0.08)] transition-colors"
            >
              {dict.home.exploreLibrary}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
