import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Inscription au séminaire",
  description:
    "Inscrivez-vous au prochain séminaire d'Oustaz Niang Mbaye (H.A) — places limitées, formulaire en ligne sécurisé.",
  openGraph: {
    title: "Inscription | Abu Maryam TV",
    description: "Réservez votre place pour le séminaire — formulaire d'inscription en ligne.",
  },
};
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import SeminarRecap from "@/components/inscription/SeminarRecap";
import RegistrationForm from "@/components/inscription/RegistrationForm";

export default function InscriptionPage() {
  return (
    <>
      <Navbar />
      <MobileHeader title="Inscription" />

      <main className="pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8">
          <div className="flex flex-col md:grid md:grid-cols-[400px_1fr] gap-6 md:gap-8 items-start">
            <SeminarRecap />
            <RegistrationForm />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
