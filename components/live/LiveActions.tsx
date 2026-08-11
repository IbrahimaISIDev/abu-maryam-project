"use client";

import { socialLinks } from "@/data/socials";

const telegramChannel = socialLinks.find((s) => s.id === "telegram")!.href;

export default function LiveActions({
  title,
  url,
  shareLabel,
  notifyLabel,
}: {
  title: string;
  url: string;
  shareLabel: string;
  notifyLabel: string;
}) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Utilisateur a annulé la fenêtre de partage — rien à faire.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <div className="flex gap-3 mb-5">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 border border-[#d8d0bf] dark:border-[#454c3c] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
      >
        ↗ {shareLabel}
      </button>
      <a
        href={telegramChannel}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 border border-[#d8d0bf] dark:border-[#454c3c] rounded-full font-[var(--font-hanken)] text-[13px] font-medium text-[#3f463a] dark:text-[#d8d4c4] hover:border-[#b58a3c] hover:text-[#b58a3c] transition-colors"
      >
        🔔 {notifyLabel}
      </a>
    </div>
  );
}
