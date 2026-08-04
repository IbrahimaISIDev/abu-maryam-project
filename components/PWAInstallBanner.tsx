"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/contexts/DictionaryContext";
import BrandMark from "./ui/BrandMark";

export default function PWAInstallBanner() {
  const { dict, lang } = useDictionary();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode (already installed and running as app)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as any).standalone === true;
    if (isStandalone) return;

    // Check if user has previously dismissed the banner
    const isDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (isDismissed === "true") return;

    // Show the banner on first visit if not standalone and not dismissed
    setIsVisible(true);

    // Detect if the user is on iOS
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(checkIOS);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else {
      // Fallback instruction for browsers without automatic prompt (e.g. Safari on iOS)
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
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

      {/* Modal d'instructions d'installation (iOS ou navigateurs sans prompt direct) */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-[420px] bg-[#fbf9f3] dark:bg-[#20261b] rounded-[18px] p-6 shadow-2xl border border-[#e2dac9] dark:border-[#3a4132] animate-scale-in text-center">
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-[#6f7363] dark:text-[#b7b2a0] hover:text-[#232a20] dark:hover:text-[#fbf9f3] p-1"
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="w-14 h-14 bg-[#3c4a37] dark:bg-[#1f271c] text-[#e3c685] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#b58a3c]">
              <BrandMark size={28} />
            </div>

            <h3 className="font-[var(--font-cormorant)] font-bold text-[22px] text-[#232a20] dark:text-[#f2ede0] mb-2">
              {lang === "ar" ? "كيفية التثبيت" : "Comment installer ?"}
            </h3>

            {isIOS ? (
              <div className="text-right rtl:text-right ltr:text-left space-y-4 my-4 font-[var(--font-hanken)] text-[14px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed">
                {lang === "ar" ? (
                  <>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">١</span>
                      <span>اضغط على زر المشاركة 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mx-1.5 text-[#b58a3c]">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        في متصفح Safari.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">٢</span>
                      <span>قم بالتمرير لأسفل واختيار <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">1</span>
                      <span>Appuyez sur le bouton de partage 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mx-1.5 text-[#b58a3c]">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        en bas du navigateur Safari.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">2</span>
                      <span>Faites défiler l&apos;écran vers le bas puis sélectionnez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.</span>
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-right rtl:text-right ltr:text-left space-y-4 my-4 font-[var(--font-hanken)] text-[14px] text-[#6f7363] dark:text-[#b7b2a0] leading-relaxed">
                {lang === "ar" ? (
                  <>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">١</span>
                      <span>اضغط على أيقونة القائمة (٣ نقاط) في أعلى أو أسفل المتصفح.</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">٢</span>
                      <span>اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong>.</span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">1</span>
                      <span>Ouvrez le menu de votre navigateur (les 3 points en haut à droite).</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <span className="bg-[#b58a3c] text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 font-bold mt-0.5">2</span>
                      <span>Sélectionnez <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.</span>
                    </p>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowInstructions(false);
                handleDismiss();
              }}
              className="mt-4 w-full py-2.5 text-[14px] font-semibold bg-[#3c4a37] hover:bg-[#4d5d47] text-white rounded-[9px] transition-colors"
            >
              {lang === "ar" ? "فهمت" : "J'ai compris"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
