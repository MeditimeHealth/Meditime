import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Meditime",
  description: "Have questions or need help? Contact the Meditime support team via phone, email, or live chat. We're here to help 24/7.",
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us",
    "url": "https://yoursite.com/contact",
    "description": "Get in touch with our support team.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Your Platform Name",
      "telephone": "+880-XXX-XXXXXX",
      "email": "support@yoursite.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Main Street",
        "addressLocality": "Chattogram",
        "addressCountry": "BD"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
