import { schedule } from "@/data/live";
import { getReplays } from "@/lib/db/queries";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";
import { formatDaysAgo, formatDayShort } from "@/lib/format";
import { getScheduleTitle, getScheduleSubtitle, getReplayTitle } from "@/lib/content-i18n";
import { buildYoutubeThumbnailUrl, buildYoutubeWatchUrl } from "@/lib/youtube";

export default async function LiveSidebar({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const replays = await getReplays();
  return (
    <aside className="space-y-5">
      {/* Programme à venir */}
      <div className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[9px] p-5">
        <h3 className="font-[var(--font-hanken)] font-semibold text-[11px] tracking-widest uppercase text-[#7d5f26] dark:text-[#e3c685] mb-4">
          {dict.live.upcomingProgram}
        </h3>
        <ul className="space-y-4">
          {schedule.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="text-center shrink-0">
                <p className="font-[var(--font-hanken)] text-[11px] font-semibold text-[#6f7363] dark:text-[#8f8973] uppercase">
                  {formatDayShort(item.dayShort, lang)}
                </p>
                <p className="font-[var(--font-hanken)] text-[12.5px] font-bold text-[#3c4a37] dark:text-[#a9c19a]">
                  {item.time}
                </p>
              </div>
              <div className="border-l border-[#e2dac9] dark:border-[#3a4132] pl-3 min-w-0">
                <p className="font-[var(--font-hanken)] font-semibold text-[13.5px] text-[#232a20] dark:text-[#f2ede0] leading-snug">
                  {getScheduleTitle(item, lang)}
                </p>
                <p className="font-[var(--font-hanken)] text-[12px] text-[#6f7363] dark:text-[#8f8973] mt-0.5">
                  {getScheduleSubtitle(item, lang)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Revoir les directs */}
      <div className="bg-[#fbf9f3] dark:bg-[#20261b] border border-[#e2dac9] dark:border-[#3a4132] rounded-[9px] p-5">
        <h3 className="font-[var(--font-hanken)] font-semibold text-[11px] tracking-widest uppercase text-[#7d5f26] dark:text-[#e3c685] mb-4">
          {dict.live.rewatchLives}
        </h3>
        <ul className="space-y-3 divide-y divide-[#e2dac9] dark:divide-[#3a4132]">
          {replays.map((r) => {
            const thumbSrc = r.thumbnail ?? (r.youtubeId ? buildYoutubeThumbnailUrl(r.youtubeId, "mqdefault") : null);
            const content = (
              <>
                <div className="w-[78px] h-[48px] rounded-[5px] overflow-hidden shrink-0 relative">
                  {thumbSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlaceholder className="w-full h-full" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-[rgba(60,74,55,0.7)] flex items-center justify-center text-[#fbf9f3] text-[10px]">
                      ▶
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-[var(--font-hanken)] font-medium text-[13px] text-[#232a20] dark:text-[#f2ede0] leading-snug line-clamp-2">
                    {getReplayTitle(r, lang)}
                  </p>
                  <p className="font-[var(--font-hanken)] text-[11.5px] text-[#6f7363] dark:text-[#8f8973] mt-0.5">
                    {formatDaysAgo(r.daysAgo, lang)}
                  </p>
                </div>
              </>
            );
            return (
              <li key={r.id} className="pt-3 first:pt-0">
                {r.youtubeId ? (
                  <a
                    href={buildYoutubeWatchUrl(r.youtubeId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="flex items-center gap-3">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
