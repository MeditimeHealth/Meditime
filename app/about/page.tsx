import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | MediTime",
  description: 'Learn about "MediTime" our mission to make quality healthcare accessible for everyone in Bangladesh through easy online booking.',
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Us",
    "url": "https://yoursite.com/about",
    "description": "Learn more about our platform and mission.",
    "publisher": {
      "@type": "MedicalOrganization",
      "name": "Meditime",
      "url": "https://yoursite.com",
      "logo": "https://yoursite.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+880-XXX-XXXXXX",
        "contactType": "customer service"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
