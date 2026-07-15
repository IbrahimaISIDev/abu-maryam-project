import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import BibliothequeCatalogue from "@/components/bibliotheque/BibliothequeCatalogue";

export const metadata: Metadata = {
  title: "Bibliothèque",
  description:
    "320+ enseignements islamiques d'Oustaz Niang Mbaye (H.A) — tafsir, tawhid, khoutbas, conférences et séries de cours en wolof et en français.",
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

      <main className="pb-20 md:pb-0">
        <BibliothequeCatalogue />
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
