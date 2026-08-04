"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/contexts/DictionaryContext";
import BrandMark from "./ui/BrandMark";

export default function PWAInstallBanner() {
  const { dict } = useDictionary();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if user previously dismissed the banner
    const isDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (isDismissed === "true") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true); // Only show the banner when the direct native install is ready
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Trigger the native browser installation prompt directly
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[68px] md:bottom-6 left-4 right-4 z-40 bg-[#3c4a37] dark:bg-[#1f271c] text-[#fbf9f3] p-4 rounded-[16px] shadow-2xl border border-[#b58a3c] flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 animate-slide-up max-w-[500px] sm:max-w-none md:max-w-[700px] mx-auto">
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="shrink-0 bg-[#efe9dc] p-1.5 rounded-[12px] text-[#3c4a37]">
          <BrandMark size={32} />
        </div>
        <div>
          <h4 className="font-[var(--font-cormorant)] font-bold text-[16px] sm:text-[18px] text-[#e3c685] leading-tight">
            {dict.pwa.bannerTitle}
          </h4>
          <p className="font-[var(--font-hanken)] text-[12px] text-[#e9e3d4] mt-0.5 line-clamp-2">
            {dict.pwa.bannerDesc}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-4 py-2 text-[12.5px] font-semibold text-[#e9e3d4] hover:text-[#fbf9f3] transition-colors rounded-full"
        >
          {dict.pwa.dismissBtn}
        </button>
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-5 py-2 text-[12.5px] font-semibold bg-[#b58a3c] hover:bg-[#cda350] text-[#fbf9f3] rounded-full shadow transition-all duration-200"
        >
          {dict.pwa.installBtn}
        </button>
      </div>
    </div>
  );
}
