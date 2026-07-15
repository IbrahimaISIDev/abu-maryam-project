"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface Ctx {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.addToast;
}

const config: Record<ToastType, { cls: string; icon: string }> = {
  success: { cls: "bg-[#3c4a37] text-[#fbf9f3] border-[rgba(205,163,80,0.25)]", icon: "✓" },
  error:   { cls: "bg-[#8a2f29] text-[#fbf9f3] border-[rgba(255,255,255,0.1)]",  icon: "✕" },
  info:    { cls: "bg-[#2d352a] text-[#cda350] border-[rgba(205,163,80,0.3)]",   icon: "ℹ" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const { cls, icon } = config[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-lg font-[var(--font-hanken)] text-[13.5px] font-medium min-w-[240px] max-w-[360px] pointer-events-auto ${cls}`}
            >
              <span className="shrink-0 w-5 h-5 rounded-full bg-[rgba(255,255,255,0.15)] flex items-center justify-center text-[10px] font-bold">
                {icon}
              </span>
              <span className="flex-1">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
