"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ isOpen, title, onClose, children, maxWidth = "max-w-[520px]" }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
    (focusable[0] ?? dialog)?.focus();

    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(35,42,32,0.55)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative bg-[#fbf9f3] border border-[#e2dac9] rounded-[14px] shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col outline-none`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2dac9] shrink-0">
          <h2 id={titleId} className="font-[var(--font-cormorant)] font-semibold text-[22px] text-[#232a20]">
            {title}
          </h2>
          <button type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#6f7363] hover:bg-[#f0ece3] hover:text-[#232a20] transition-colors"
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
