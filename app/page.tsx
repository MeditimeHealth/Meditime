import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import SearchSection from "@/components/search-section";
import ServicesSection from "@/components/services-section";
import WhyChooseSection from "@/components/why-choose-section";
import DepartmentSection from "@/components/department-section";
import MembershipSection from "@/components/membership-section";
import StatsSection from "@/components/stats-section";
import PatientReviewSection from "@/components/patient-review-section";
import HospitalPartnersSection from "@/components/hospital-partners-section";
import BlogSection from "@/components/blog-section";
import BookAppointmentSection from "@/components/book-appointment-section";
import FaqSection from "@/components/Faqsection";
import AppDownloadSection from "@/components/app-download-section";
import Footer from "@/components/footer";


export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <SearchSection />
      <ServicesSection />
      <WhyChooseSection />
      <DepartmentSection />
      <MembershipSection />
      <StatsSection />
      <PatientReviewSection />
      <HospitalPartnersSection />
      <BookAppointmentSection />
      <BlogSection />
      {/* <FaqSection /> */}
      <AppDownloadSection />
      <Footer />
    </div>
  );
}
