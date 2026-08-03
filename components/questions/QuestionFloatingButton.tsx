"use client";

import React, { useState } from "react";
import QuestionModal from "./QuestionModal";

export default function QuestionFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full border border-[#b58a3c]/40 bg-gradient-to-r from-[#1c2419] to-[#2b3827] px-5 py-3 text-xs font-bold text-[#e6cf8b] shadow-2xl transition-all duration-300 hover:scale-105 hover:border-[#b58a3c] hover:shadow-[#b58a3c]/20 md:bottom-8 md:right-8"
        title="Poser une question à Oustaz"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#b58a3c] text-white text-xs">
          💬
        </span>
        <span className="hidden sm:inline">Poser une question</span>
      </button>

      <QuestionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
