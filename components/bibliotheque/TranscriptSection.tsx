import type { Teaching } from "@/lib/types";

const DIACRITICS = /[̀-ͯ]/g;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function TranscriptSection({ teaching }: { teaching: Teaching }) {
  if (!teaching.transcript) {
    return (
      <div className="border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] p-5 bg-[#fbf9f3] dark:bg-[#20261b]">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20] dark:text-[#f2ede0] mb-1.5">
          Transcription
        </h2>
        <p className="font-[var(--font-hanken)] text-[13.5px] text-[#9a9483] dark:text-[#8f8973] italic">
          Bientôt disponible pour cet enseignement.
        </p>
      </div>
    );
  }

  const href = `data:text/plain;charset=utf-8,${encodeURIComponent(teaching.transcript)}`;

  return (
    <details className="group border border-[#e2dac9] dark:border-[#3a4132] rounded-[13px] overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none bg-[#f5f1e8] dark:bg-[#242b1e] select-none">
        <span className="font-[var(--font-cormorant)] font-semibold text-[20px] text-[#232a20] dark:text-[#f2ede0]">
          Transcription
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <a
            href={href}
            download={`${slugify(teaching.title)}-transcription.txt`}
            className="font-[var(--font-hanken)] text-[12.5px] font-medium text-[#b58a3c] dark:text-[#e3c685] hover:text-[#9e7832] transition-colors"
          >
            Télécharger (.txt)
          </a>
          <svg className="transition-transform group-open:rotate-180 text-[#232a20] dark:text-[#f2ede0]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </summary>
      <div className="px-5 py-4 border-t border-[#e2dac9] dark:border-[#3a4132] bg-[#fbf9f3] dark:bg-[#20261b]">
        {teaching.transcript.split("\n\n").map((para, i) => (
          <p key={i} className="font-[var(--font-hanken)] text-[14px] text-[#3f463a] dark:text-[#d8d4c4] leading-relaxed mb-3 last:mb-0">
            {para}
          </p>
        ))}
      </div>
    </details>
  );
}
