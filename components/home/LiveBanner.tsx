import Link from "@/components/ui/LocalizedLink";
import { liveStatus } from "@/data/live";
import type { Dictionary } from "@/dictionaries/types";

export default function LiveBanner({ dict }: { dict: Dictionary["home"] }) {
  if (!liveStatus.isLive) return null;

  return (
    <div className="bg-[#232a20] text-[#fbf9f3]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-2.5 flex items-center gap-3">
        <span className="relative flex shrink-0">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#c0392b] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c0392b]" />
        </span>
        <p className="font-[var(--font-hanken)] text-[12.5px] font-medium flex-1 truncate">
          <span className="font-semibold text-[#cda350]">{dict.liveBannerLabel}</span>
          {" — "}
          {liveStatus.title}
        </p>
        <Link
          href="/en-direct"
          className="shrink-0 font-[var(--font-hanken)] text-[12px] font-semibold text-[#cda350] hover:text-[#e3c685] transition-colors whitespace-nowrap"
        >
          {dict.liveBannerWatch}
        </Link>
      </div>
    </div>
  );
}
