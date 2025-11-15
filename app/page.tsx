import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import SearchSection from "@/components/search-section";
import ServicesSection from "@/components/services-section";
import WhyChooseSection from "@/components/why-choose-section";
import StatsSection from "@/components/stats-section";
import AppDownloadSection from "@/components/app-download-section";


export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <SearchSection />
      <ServicesSection />
      <WhyChooseSection />
      <StatsSection />
      <AppDownloadSection />
    </div>
  );
}
