import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Medi Time",
  description: "Have questions or need help? Contact the Medi Time support team via phone, email, or live chat. We're here to help 24/7.",
};

export default function ContactPage() {
  return <ContactClient />;
}
