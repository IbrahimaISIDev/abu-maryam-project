"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SearchContextValue {
  isOpen: boolean;
  query: string;
  setQuery: (q: string) => void;
  selected: number;
  setSelected: (s: number | ((prev: number) => number)) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const openSearch = useCallback(() => {
    setQuery("");
    setSelected(0);
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => setIsOpen(false), []);

  // Lit `isOpen` depuis la fermeture plutôt qu'un updater fonctionnel :
  // réinitialiser query/selected dans un updater de setIsOpen serait un
  // effet de bord dans une fonction censée rester pure.
  const toggleSearch = useCallback(() => {
    if (!isOpen) {
      setQuery("");
      setSelected(0);
    }
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <SearchContext.Provider
      value={{ isOpen, query, setQuery, selected, setSelected, openSearch, closeSearch, toggleSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be inside SearchProvider");
  return ctx;
}
