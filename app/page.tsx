import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import PopularTests from "@/components/popular-tests";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <PopularTests />
    </div>
  );
}
