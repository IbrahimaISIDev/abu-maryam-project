"use client";

import { useId, useState, type ReactNode } from "react";
import { glossary, glossaryAr } from "@/lib/glossary";
import type { Locale } from "@/lib/i18n";

interface GlossaryTermProps {
  term: string;
  children: ReactNode;
  className?: string;
  lang?: Locale;
}

export default function GlossaryTerm({ term, children, className = "", lang = "fr" }: GlossaryTermProps) {
  const definition = (lang === "ar" ? glossaryAr : glossary)[term.toLowerCase()];
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  if (!definition) return <span className={className}>{children}</span>;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={`border-b border-dotted border-current cursor-help ${className}`}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      >
        {children}
      </button>
      {open && (
        <span
          role="tooltip"
          id={tooltipId}
          className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-[220px] max-w-[70vw] px-3 py-2 rounded-[8px] bg-[#232a20] text-[#fbf9f3] text-[12px] font-[var(--font-hanken)] leading-relaxed shadow-lg pointer-events-none"
        >
          {definition}
        </span>
      )}
    </span>
  );
}
