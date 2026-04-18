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
    const id = selectedVenue?._id || "000";
    return `#MDT-${id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  }, [selectedVenue?._id]);

  const handleBook = async () => {
    setSubmitting(true);
    
    try {
      const payload = {
        patientName: checkoutData.patientName,
        mobileNumber: checkoutData.mobileNumber,
        gender: checkoutData.gender,
        age: checkoutData.age,
        patientType: checkoutData.patientType,
        appointmentDate: checkoutData.appointmentDate,
        venueId: selectedVenue._id,
        tests: bookedTests,
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

      const bookingSaved = await res.json();
      
      // Store rich data
      const bookingToSave = {
        ...bookingSaved.booking,
        bookingRef,
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
        bookingRef
      };
      await generateDiagnosticBookingPDF(fallbackBooking);
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
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col items-end gap-5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={payLater}
                    onChange={(e) => setPayLater(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-[#00B7B5] focus:ring-[#00B7B5] accent-[#00B7B5]"
                  />
                  <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">I want to pay later at the hospital desk</span>
                </label>

                {payLater ? (
                  <Button 
                    onClick={handleBook}
                    disabled={submitting}
                    className="w-full md:w-auto px-12 py-6 text-lg font-bold bg-[#00B7B5] hover:bg-[#009b9a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <CheckCircle2 className="w-6 h-6 mr-2" />}
                    Confirm Booking Now
                  </Button>
                ) : (
                  <Button 
                    disabled
                    className="w-full md:w-auto px-12 py-6 text-lg font-bold bg-slate-800 text-white rounded-xl shadow-lg transition-all opacity-50"
                  >
                    Pay ৳{totalPrice}
                  </Button>
                )}
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
