import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import SearchSection from "@/components/search-section";
import ServicesSection from "@/components/services-section";


export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <SearchSection />
      <ServicesSection />
    </div>
  );
}
