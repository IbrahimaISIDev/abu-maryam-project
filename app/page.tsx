import Navbar from "@/components/layout/Navbar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import SeminarBanner from "@/components/home/SeminarBanner";
import TeachingsGrid from "@/components/home/TeachingsGrid";
import LiveReplays from "@/components/home/LiveReplays";
import ThemeGrid from "@/components/home/ThemeGrid";
import HomeCTA from "@/components/home/HomeCTA";
import ContinueListening from "@/components/home/ContinueListening";
import LiveBanner from "@/components/home/LiveBanner";

export default function HomePage() {
  return (
    <>
      <LiveBanner />
      <Navbar />
      <MobileHeader />

      <main className="pb-20 md:pb-0">
        <Hero />

        <div className="max-w-[1280px] mx-auto px-5 md:px-10 space-y-12 md:space-y-14 py-10 md:py-14">
          <SeminarBanner />
          <ContinueListening />
          <TeachingsGrid />
          <LiveReplays />
          <ThemeGrid />
          <HomeCTA />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
