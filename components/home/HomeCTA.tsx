import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="rounded-[10px] bg-[#3c4a37] px-6 py-10 md:px-12 md:py-12 text-center">
      <p className="arabic text-[#cda350] text-[22px] mb-4">
        وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
      </p>
      <h2 className="font-[var(--font-cormorant)] font-semibold text-[28px] md:text-[36px] text-[#fbf9f3] mb-3 max-w-[600px] mx-auto">
        Commencez votre chemin vers la connaissance
      </h2>
      <p className="font-[var(--font-hanken)] text-[14.5px] text-[rgba(251,249,243,0.75)] max-w-[480px] mx-auto mb-7 leading-relaxed">
        Plus de 320 enseignements gratuits, accessibles à tout moment, pour
        apprendre à votre rythme.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/bibliotheque"
          className="bg-[#b58a3c] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[#9e7832] transition-colors"
        >
          Explorer la bibliothèque
        </Link>
        <Link
          href="/evenements"
          className="border-2 border-[#fbf9f3] text-[#fbf9f3] font-[var(--font-hanken)] font-semibold text-[14.5px] px-7 py-3.5 rounded-full hover:bg-[rgba(251,249,243,0.1)] transition-colors"
        >
          Voir les événements
        </Link>
      </div>
    </section>
  );
}
