import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Diagnostic Tests Online | Meditime",
  description: "Browse and book diagnostic tests including blood tests, X-rays, ECG, MRI, and more. Get tested at trusted labs near you.",
};

export default function DiagnosticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
