import Link from "next/link";
import { liveStatus, replays } from "@/data/live";
import Badge from "@/components/ui/Badge";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function LiveReplays() {
  return (
    <section>
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[34px] text-[#232a20] mb-5">
        Direct & Replays
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-5 md:gap-6">
        {/* Colonne gauche — aperçu live */}
        <Link href="/en-direct" className="block group">
          <div className="relative rounded-[9px] overflow-hidden min-h-[200px] md:min-h-[300px]">
            <ImagePlaceholder className="w-full h-full absolute inset-0" />

            {/* Dégradé bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,34,22,.85)] via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4">
              <Badge variant="live" />
            </div>

            {/* Play central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[64px] h-[64px] rounded-full bg-[rgba(251,249,243,0.18)] border-2 border-[rgba(251,249,243,0.55)] flex items-center justify-center text-[#fbf9f3] text-2xl group-hover:bg-[rgba(251,249,243,0.28)] transition-colors">
                ▶
              </div>
            </div>

            {/* Infos bas */}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#fbf9f3] leading-tight">
                {liveStatus.title}
              </p>
              <p className="font-[var(--font-hanken)] text-[12px] text-[rgba(251,249,243,0.7)] mt-1">
                👁 {liveStatus.viewers.toLocaleString("fr-FR")} spectateurs
              </p>
            </div>
          </div>
        </Link>

        {/* Colonne droite — replays */}
        <div className="bg-[#fbf9f3] border border-[#e2dac9] rounded-[9px] p-5">
          <h3 className="font-[var(--font-hanken)] font-semibold text-[13px] uppercase tracking-widest text-[#6f7363] mb-4">
            Revoir les directs
          </h3>
          <ul className="flex flex-col divide-y divide-[#e2dac9]">
            {replays.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {/* Miniature */}
                <div className="w-[78px] h-[48px] rounded-[5px] overflow-hidden shrink-0 relative">
                  <ImagePlaceholder className="w-full h-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-[rgba(60,74,55,0.7)] flex items-center justify-center text-[#fbf9f3] text-[11px]">
                      ▶
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-[var(--font-hanken)] font-medium text-[13.5px] text-[#232a20] leading-snug line-clamp-2">
                    {r.title}
                  </p>
                  <p className="font-[var(--font-hanken)] text-[11.5px] text-[#9a9483] mt-0.5">
                    Il y a {r.daysAgo} jours
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
