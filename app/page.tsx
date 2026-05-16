import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import SearchSection from "@/components/search-section";
import ServicesSection from "@/components/services-section";
import WhyChooseSection from "@/components/why-choose-section";
import DepartmentSection from "@/components/department-section";
import MembershipSection from "@/components/membership-section";
import StatsSection from "@/components/stats-section";
import PatientReviewSection from "@/components/patient-review-section";
import ContactSection from "@/components/contact-section";
import HospitalPartnersSection from "@/components/hospital-partners-section";
import BlogSection from "@/components/blog-section";
import BookAppointmentSection from "@/components/book-appointment-section";
import FaqSection from "@/components/Faqsection";
import AppDownloadSection from "@/components/app-download-section";
import Footer from "@/components/footer";


export default function Home() {
  const baseUrl = "https://meditime.com.bd";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Meditime",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+8801946102102",
      "contactType": "customer service",
      "areaServed": "BD",
      "availableLanguage": ["Bengali", "English"]
    },
    "sameAs": [
      "https://www.facebook.com/meditimebd",
      "https://twitter.com/meditimebd",
      "https://www.linkedin.com/company/meditimebd"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/doctor?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="overflow-x-hidden relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <SearchSection />
      <ServicesSection />
      <WhyChooseSection />
      <MembershipSection />
      <DepartmentSection />

      <StatsSection />
      <PatientReviewSection />
      <ContactSection />
      <HospitalPartnersSection />
      {/* <BookAppointmentSection /> */}
      <BlogSection />
      <FaqSection />
      <AppDownloadSection />
      <Footer />
    </div>
  );
}
