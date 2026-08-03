"use client";

import React, { useState } from "react";
import QuestionModal from "./QuestionModal";

export default function QuestionFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB — Mobile : bouton rond bien visible en bas à droite */}
      {/* Desktop : bouton étendu avec label */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
        {/* Mobile FAB : bouton rond */}
        <button
          onClick={() => setIsOpen(true)}
          title="Poser une question à Oustaz"
          aria-label="Poser une question à Oustaz"
          className="
            group relative flex md:hidden
            h-14 w-14
            items-center justify-center
            rounded-full
            bg-[#b58a3c]
            text-white
            shadow-2xl shadow-[#b58a3c]/50
            transition-all duration-300
            active:scale-95 hover:scale-110 hover:bg-[#c99b45]
          "
        >
          {/* Pulsation ring */}
          <span className="absolute inset-0 animate-ping rounded-full bg-[#b58a3c] opacity-25" />
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {/* Tooltip */}
          <span className="
            pointer-events-none absolute bottom-full right-0 mb-2
            whitespace-nowrap rounded-lg bg-[#232a20] px-3 py-1.5
            text-xs font-semibold text-white shadow-lg
            opacity-0 translate-y-1
            transition-all duration-200
            group-hover:opacity-100 group-hover:translate-y-0
          ">
            Poser une question
          </span>
        </button>

        {/* Desktop FAB : bouton étendu avec texte */}
        <button
          onClick={() => setIsOpen(true)}
          title="Poser une question à Oustaz"
          className="
            hidden md:flex
            items-center gap-3
            rounded-full
            border border-[#b58a3c]/40
            bg-gradient-to-r from-[#1c2419] to-[#2b3827]
            px-5 py-3
            text-sm font-bold text-[#e6cf8b]
            shadow-2xl shadow-black/40
            transition-all duration-300
            hover:scale-105 hover:border-[#b58a3c] hover:shadow-[#b58a3c]/20
          "
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b58a3c] text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          Poser une question à Oustaz
        </button>
      </div>

      <QuestionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
