"use client";

import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  isOpen, title, message, confirmLabel = "Confirmer",
  onConfirm, onCancel, danger = false,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(35,42,32,0.55)] backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] shadow-xl p-6 w-full max-w-[380px]">
        <h2 className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20] mb-1.5">
          {title}
        </h2>
        <p className="font-[var(--font-hanken)] text-[13.5px] text-[#6f7363] leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-[9px] font-[var(--font-hanken)] text-[13px] font-medium text-[#6f7363] border border-[#e2dac9] hover:bg-[#f0ece3] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-[9px] font-[var(--font-hanken)] text-[13px] font-semibold text-[#fbf9f3] transition-colors ${
              danger ? "bg-[#8a2f29] hover:bg-[#6e2520]" : "bg-[#3c4a37] hover:bg-[#2d3829]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
