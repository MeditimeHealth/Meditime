"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { ArrowLeft, MapPin, Loader2, Building2, Activity } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/lib/toast";

import DiagnosticCalendarPicker from "@/components/diagnostic/DiagnosticCalendarPicker";
import DiagnosticPatientForm from "@/components/diagnostic/DiagnosticPatientForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { convertToBengaliNumber } from "@/lib/utils";

export default function DiagnosticCheckoutPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [bookedTests, setBookedTests] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);

  // Form data
  const [patientName, setPatientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [patientType, setPatientType] = useState<"old" | "new" | "report">("new");
  const [affiliateCode, setAffiliateCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTests = localStorage.getItem("diagnosticCart");
      const savedVenue = localStorage.getItem("diagnosticVenue");

      if (savedTests && savedVenue) {
        setBookedTests(JSON.parse(savedTests));
        setSelectedVenue(JSON.parse(savedVenue));
      } else {
        showToast.error("No tests or venue selected. Redirecting...");
        router.push("/diagnostic");
      }
      setLoading(false);
    }
  }, [router]);

  // Auto-populate user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.fullName) setPatientName(user.fullName);
          if (user.phoneNumber) setMobileNumber(user.phoneNumber);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue || !selectedDate) {
      alert("Please select a date");
      return;
    }

    setSubmitting(true);
    try {
      const checkoutData = {
        patientName,
        mobileNumber,
        gender,
        age,
        patientType,
        affiliateCode,
        appointmentDate: selectedDate.toISOString()
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("diagnosticCheckout", JSON.stringify(checkoutData));
      }

      router.push(`/diagnostic/checkout/success`);
    } catch (error) {
      console.error("Error confirming details:", error);
      alert("Failed to proceed to success page");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00B7B5]" />
        </div>
      </div>
    );
  }

  if (!selectedVenue || bookedTests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">No data found</p>
            <Link href="/diagnostic">
              <Button>Back to Diagnostics</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href={`/diagnostic`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span >
                  {t("back", language)}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hospital Info & Calendar */}
          <div className="lg:col-span-2 space-y-6">

            {/* Selected Tests Summary */}
            <Card className="p-6 bg-gradient-to-br from-white to-[#00B7B5]/5 border-2 border-[#00B7B5]/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B7B5]/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <h2
                className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2"

              >
                <div className="p-2 bg-[#00B7B5]/10 text-[#00B7B5] rounded-xl"><Activity className="w-5 h-5" /></div>
                {t("selectedTests", language)}
              </h2>

              <div className="space-y-4">
                {bookedTests.map((test: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 sm:p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800">
                        {language === 'bn' && test.nameBn ? test.nameBn : test.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {language === 'bn' ? test.name : (test.nameBn || '')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">৳{convertToBengaliNumber(test.price || 0, language)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center p-4 bg-[#00B7B5]/10 rounded-xl border border-[#00B7B5]/20">
                <p className="font-bold text-lg text-slate-700" >{t("totalAmount", language)}</p>
                <p className="text-2xl font-black text-[#00B7B5]">৳{convertToBengaliNumber(bookedTests.reduce((a, b) => a + (b.price || 0), 0), language)}</p>
              </div>
            </Card>

            {/* Hospital Info Display */}
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-[#0088FF]/20 shadow-xl">
              <h2
                className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2"

              >
                <div className="p-2 bg-[#0088FF]/10 text-[#0088FF] rounded-xl"><MapPin className="w-5 h-5" /></div>
                {t("selectedHospital", language)}
              </h2>
              <div className="relative">
                <div className="p-4 bg-[#0088FF] text-white rounded-xl border-2 border-[#0088FF] shadow-lg">
                  <p className="text-xl font-semibold flex items-center gap-2" >
                    <Building2 className="h-6 w-6" />
                    {selectedVenue.name}
                  </p>
                  <p className="text-white/80 text-sm mt-1">{selectedVenue.address || selectedVenue.thana?.name}</p>
                </div>
              </div>
            </Card>

            {/* Calendar */}
            <DiagnosticCalendarPicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />

          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <DiagnosticPatientForm
              patientName={patientName}
              setPatientName={setPatientName}
              mobileNumber={mobileNumber}
              setMobileNumber={setMobileNumber}
              gender={gender}
              setGender={setGender}
              age={age}
              setAge={setAge}
              patientType={patientType}
              setPatientType={setPatientType}
              affiliateCode={affiliateCode}
              setAffiliateCode={setAffiliateCode}
              selectedDate={selectedDate}
              submitting={submitting}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
