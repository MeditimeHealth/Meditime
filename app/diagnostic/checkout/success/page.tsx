"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { ArrowLeft, Loader2, CheckCircle2, Download } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/lib/toast";

import { generateDiagnosticBookingPDF } from "@/lib/diagnostic-pdf";
import DiagnosticInvoice from "@/components/diagnostic/DiagnosticInvoice";

export default function DiagnosticSuccessPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookedTests, setBookedTests] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
  const [checkoutData, setCheckoutData] = useState<any | null>(null);
  
  const [payLater, setPayLater] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [savedBookingData, setSavedBookingData] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTests = localStorage.getItem("diagnosticCart");
      const savedVenue = localStorage.getItem("diagnosticVenue");
      const savedCheckout = localStorage.getItem("diagnosticCheckout");
      
      if (savedTests && savedVenue && savedCheckout) {
        setBookedTests(JSON.parse(savedTests));
        setSelectedVenue(JSON.parse(savedVenue));
        setCheckoutData(JSON.parse(savedCheckout));
      } else {
        showToast.error("Missing booking data. Redirecting...");
        router.push("/diagnostic");
      }
      setLoading(false);
    }
  }, [router]);

  const bookingRef = useMemo(() => {
    return savedBookingData?.bookingId || "";
  }, [savedBookingData]);

  const handleBook = async () => {
    setSubmitting(true);
    
    try {
      const userData = localStorage.getItem("user");
      let userId = null;
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id || user._id;
      }

      const payload = {
        userId,
        patientName: checkoutData.patientName,
        mobileNumber: checkoutData.mobileNumber,
        gender: checkoutData.gender,
        age: checkoutData.age,
        patientType: checkoutData.patientType,
        appointmentDate: checkoutData.appointmentDate,
        venueId: selectedVenue._id,
        tests: bookedTests,
        affiliateCode: checkoutData.affiliateCode,
        totalPrice: bookedTests.reduce((a: number, b: any) => a + (b.price || 0), 0)
      };

      const res = await fetch("/api/diagnostic/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to secure diagnostic booking.");
      }

      const responseData = await res.json();
      const confirmedBooking = responseData.booking;
      
      // Store rich data 
      const bookingToSave = {
        ...confirmedBooking, 
        bookingId: confirmedBooking.bookingId,
        venueId: selectedVenue,
        tests: bookedTests
      };
      
      const prevBookings = JSON.parse(localStorage.getItem("myDiagnosticBookings") || "[]");
      localStorage.setItem("myDiagnosticBookings", JSON.stringify([bookingToSave, ...prevBookings]));
      
      showToast.success("Booking confirmed successfully!");
      setBookingComplete(true);
      setSavedBookingData(bookingToSave);
      setSubmitting(false);

      localStorage.removeItem("diagnosticCart");
      localStorage.removeItem("diagnosticVenue");
      localStorage.removeItem("diagnosticCheckout");

      // Auto-download PDF
      setTimeout(() => {
        generateDiagnosticBookingPDF(bookingToSave);
      }, 500);
      
    } catch (error) {
      console.error(error);
      showToast.error("System encountered an error finalizing the booking.");
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (savedBookingData) {
      await generateDiagnosticBookingPDF(savedBookingData);
    } else {
      // Fallback object construct if state is lost somehow but data is still active
      const fallbackBooking = {
        patientName: checkoutData?.patientName,
        mobileNumber: checkoutData?.mobileNumber,
        appointmentDate: checkoutData?.appointmentDate,
        venueId: selectedVenue,
        tests: bookedTests,
        totalPrice: bookedTests.reduce((a: number, b: any) => a + (b.price || 0), 0),
        bookingId: bookingRef, 
      };
      await generateDiagnosticBookingPDF(fallbackBooking as any);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B7B5]" />
      </div>
    );
  }

  if (!selectedVenue || !checkoutData) return null;

  const totalPrice = bookedTests.reduce((a: number, b: any) => a + (b.price || 0), 0);

  // Collect unique recommendations for on-screen display
  const uniqueRecs = Array.from(new Set(bookedTests.flatMap((t: any) => t.recommendations || []))).slice(0, 4) as string[];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          {!bookingComplete ? (
            <Link href="/diagnostic/checkout">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Edit
              </Button>
            </Link>
          ) : (
            <Link href="/diagnostic">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Diagnostics
              </Button>
            </Link>
          )}
        </div>

        {/* Invoice Preview Component */}
        <DiagnosticInvoice 
          selectedVenue={selectedVenue}
          checkoutData={checkoutData}
          bookedTests={bookedTests}
          totalPrice={totalPrice}
          bookingRef={bookingRef}
          uniqueRecs={uniqueRecs}
        />

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          {/* Download Button - Only after booking success */}
          {bookingComplete && (
            <div className="flex justify-center">
              <Button 
                onClick={handleDownloadPDF}
                className="gap-3 bg-[#FF6B00] hover:bg-[#E65D00] text-white font-bold text-lg px-12 py-6 rounded-2xl shadow-xl shadow-[#FF6B00]/20 hover:shadow-2xl hover:shadow-[#FF6B00]/30 transition-all"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </Button>
            </div>
          )}

          {/* Pay Later / Confirm */}
          {!bookingComplete && (
            <Card className="p-6 border border-slate-200 shadow-sm bg-white">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                {/* Left side */}
                <div className="flex-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={payLater}
                      onChange={(e) => setPayLater(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#00B7B5] focus:ring-[#00B7B5] accent-[#00B7B5]"
                    />
                    <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                      I want to pay later at the hospital desk
                    </span>
                  </label>
                </div>

                {/* Right side */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {payLater ? (
                    <Button 
                      onClick={handleBook}
                      disabled={submitting}
                      className="w-full sm:w-auto px-8 py-6 text-base md:text-lg font-bold bg-[#00B7B5] hover:bg-[#009b9a] text-white rounded-xl shadow-lg transition-all"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                      Confirm Booking
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full sm:w-auto px-8 py-6 text-base md:text-lg font-bold bg-slate-800 text-white rounded-xl shadow-lg transition-all opacity-50 cursor-not-allowed"
                    >
                      Pay Now ৳{totalPrice}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {bookingComplete && (
            <div className="bg-green-50 text-green-700 border border-green-200 p-6 rounded-2xl flex items-center justify-center gap-3 text-center">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <p className="font-bold">Your booking has been confirmed successfully! Present this summary at the hospital.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
