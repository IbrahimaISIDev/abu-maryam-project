import type { Metadata } from "next";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import BibliothequeCatalogue from "@/components/bibliotheque/BibliothequeCatalogue";
import { teachings } from "@/data/teachings";

export const metadata: Metadata = {
  title: "Bibliothèque",
  description:
    `${teachings.length} enseignements islamiques d'Oustaz Niang Mbaye (H.A) — tafsir, tawhid, khoutbas, conférences et séries de cours en wolof et en arabe.`,
  openGraph: {
    title: "Bibliothèque des enseignements | Abu Maryam TV",
    description:
      "Cours islamiques, khoutbas et conférences — classés par thème, à écouter à votre rythme.",
  },
};

export default function BibliothequePage() {
  return (
    <>
      <Navbar />
      <MobileHeader title="Bibliothèque" />

      <main id="main-content" className="pb-20 md:pb-0">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <BibliothequeCatalogue />
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
