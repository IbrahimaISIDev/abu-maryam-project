"use client";

import { type ReactNode, useEffect } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, title, onClose, children, maxWidth = "max-w-[520px]" }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(35,42,32,0.55)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className={`relative bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2dac9] shrink-0">
          <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20]">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#9a9483] hover:bg-[#f0ece3] hover:text-[#232a20] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
