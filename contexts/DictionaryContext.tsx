"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "@/dictionaries/types";
import type { Locale } from "@/lib/i18n";

interface DictionaryContextValue {
  dict: Dictionary;
  lang: Locale;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({
  dict,
  lang,
  children,
}: {
  dict: Dictionary;
  lang: Locale;
  children: ReactNode;
}) {
  return <DictionaryContext.Provider value={{ dict, lang }}>{children}</DictionaryContext.Provider>;
}

export function useDictionary() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) throw new Error("useDictionary must be inside DictionaryProvider");
  return ctx;
}
