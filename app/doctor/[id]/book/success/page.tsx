"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  ArrowLeft,
  Home,
  Printer,
  Stethoscope,
  Clock,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map((d) => bengaliDigits[parseInt(d)] ?? d).join("");
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayNum = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return `${banglaDays[day]}, ${toBengaliNumber(dayNum)} ${banglaMonths[month]}, ${toBengaliNumber(year)}`;
};

const getPatientTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    old: "পুরাতন রোগী",
    new: "নতুন রোগী",
    report: "রিপোর্ট দেখানো",
  };
  return labels[type] || type;
};

const getGenderLabel = (gender: string) => {
  const labels: Record<string, string> = {
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
  };
  return labels[gender] || gender;
};

const fontStyle = { fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" };

function BookingSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const doctorId = params?.id as string;
  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAppointment = useCallback(async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();
      if (response.ok && data.appointment) {
        setAppointment(data.appointment);
        if (typeof window !== "undefined") {
          localStorage.setItem("lastAppointment", JSON.stringify(data.appointment));
        }
      } else {
        // Fallback to localStorage
        const saved = typeof window !== "undefined" ? localStorage.getItem("lastAppointment") : null;
        if (saved) {
          try { setAppointment(JSON.parse(saved)); } catch { /* noop */ }
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      const saved = typeof window !== "undefined" ? localStorage.getItem("lastAppointment") : null;
      if (saved) {
        try { setAppointment(JSON.parse(saved)); } catch { /* noop */ }
      }
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    } else {
      const savedAppointment =
        typeof window !== "undefined" ? localStorage.getItem("lastAppointment") : null;
      if (savedAppointment) {
        try {
          setAppointment(JSON.parse(savedAppointment));
        } catch { /* noop */ }
      }
      setLoading(false);
    }
  }, [appointmentId, fetchAppointment]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-slate-500 text-sm" style={fontStyle}>লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2" style={fontStyle}>
            অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!
          </h1>
          <p className="text-slate-500 mb-6" style={fontStyle}>
            আপনার অ্যাপয়েন্টমেন্টের বিস্তারিত তথ্য শীঘ্রই দেখানো হবে।
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/doctor/${doctorId}`}>
              <Button variant="outline" style={fontStyle}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                ডাক্তারের প্রোফাইলে ফিরে যান
              </Button>
            </Link>
            <Link href="/">
              <Button style={fontStyle}>
                <Home className="h-4 w-4 mr-2" />
                হোমে যান
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const doc = appointment.doctorId || {};
  const docProfileSlug = doc.slug || doc._id || doctorId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Success Header */}
        <div className="text-center mb-8" id="success-header">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4 border-2 border-green-200 shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1" style={fontStyle}>
            অ্যাপয়েন্টমেন্ট সফল!
          </h1>
          <p className="text-slate-500 text-sm" style={fontStyle}>
            আপনার অ্যাপয়েন্টমেন্ট সফলভাবে নিশ্চিত করা হয়েছে
          </p>
        </div>

        {/* Appointment Slip */}
        <div id="appointment-slip-wrapper">
          <Card
            className="bg-white border border-slate-200 shadow-2xl overflow-hidden print:shadow-none print:border-2"
            id="appointment-slip"
          >
          {/* Slip Header */}
          <div className="bg-gradient-to-r from-[#00B7B5] to-teal-600 px-6 py-6 text-center">
            <h3 className="font-bold text-2xl text-white tracking-tight" style={fontStyle}>
              MediTime
            </h3>
            <p className="text-white/80 text-sm font-bold uppercase tracking-wider mt-1">
              Appointment Slip
            </p>
            {appointment.serialNumber && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/70 text-xs uppercase tracking-widest mb-1" style={fontStyle}>
                  সিরিয়াল নম্বর
                </p>
                <p className="font-mono font-bold text-2xl text-white">{appointment.serialNumber}</p>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Doctor Information */}
            <div className="pb-5 border-b border-dashed border-slate-200">
              <p className="text-[11px] text-[#00B7B5] font-bold uppercase tracking-widest mb-3" style={fontStyle}>
                ডাক্তারের তথ্য
              </p>
              <div className="flex items-start gap-4">
            

                {/* Doctor Info */}
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xl leading-tight mb-0.5" style={fontStyle}>
                    {doc.nameBn || doc.name || "—"}
                  </p>
                  {(doc.specialtyBn || doc.specialty) && (
                    <p className="text-sm text-[#00B7B5] font-semibold mb-0.5" style={fontStyle}>
                      {doc.specialtyBn || doc.specialty}
                    </p>
                  )}
                  {(doc.qualificationBn || doc.qualification) && (
                    <p className="text-sm text-slate-600 font-medium mb-0.5" style={fontStyle}>
                      {doc.qualificationBn || doc.qualification}
                    </p>
                  )}
                  {(doc.designationBn || doc.designation) && (
                    <p className="text-xs text-slate-400 font-medium" style={fontStyle}>
                      {doc.designationBn || doc.designation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <p className="text-[11px] text-[#00B7B5] font-bold uppercase tracking-widest mb-4" style={fontStyle}>
                রোগীর তথ্য
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient Name */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                    রোগীর নাম
                  </p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <p className="font-bold text-slate-800 text-sm" style={fontStyle}>
                      {appointment.patientName}
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                    মোবাইল নম্বর
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <p className="font-bold text-slate-800 text-sm">{appointment.mobileNumber}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                    অ্যাপয়েন্টমেন্টের তারিখ
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#00B7B5] flex-shrink-0" />
                    <p className="font-bold text-slate-800 text-sm" style={fontStyle}>
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                {/* Hospital */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                    চেম্বার / হাসপাতাল
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="font-bold text-slate-800 text-sm leading-snug" style={fontStyle}>
                      {appointment.hospitalName}
                    </p>
                  </div>
                </div>

                {/* Patient Type */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                    রোগীর ধরন
                  </p>
                  <p className="font-bold text-slate-800 text-sm" style={fontStyle}>
                    {getPatientTypeLabel(appointment.patientType)}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                    স্ট্যাটাস
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100"
                    style={fontStyle}
                  >
                    <CheckCircle className="h-3 w-3" />
                    {appointment.status === "pending"
                      ? "অপেক্ষমান"
                      : appointment.status === "confirmed"
                      ? "নিশ্চিত"
                      : "সম্পন্ন"}
                  </span>
                </div>

                {/* Gender (if available) */}
                {appointment.gender && (
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                      লিঙ্গ
                    </p>
                    <p className="font-bold text-slate-800 text-sm" style={fontStyle}>
                      {getGenderLabel(appointment.gender)}
                    </p>
                  </div>
                )}

                {/* Age (if available) */}
                {appointment.age && (
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider" style={fontStyle}>
                      বয়স
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <p className="font-bold text-slate-800 text-sm" style={fontStyle}>
                        {toBengaliNumber(appointment.age)} বছর
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slip Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-medium leading-relaxed" style={fontStyle}>
              আপনার অ্যাপয়েন্টমেন্ট কনফার্ম হয়েছে। অল্প সময়ের মধ্যেই আপনার সিরিয়াল নম্বরসহ একটি এসএমএস পাবেন।
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
              Your appointment has been confirmed. You will receive an SMS with your serial number shortly.
            </p>
          </div>
        </Card>
        </div>

        {/* Print Button */}
        <div className="mt-4 flex justify-center print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2 hover:border-primary hover:text-primary transition-all"
            style={fontStyle}
          >
            <Printer className="h-4 w-4" />
            প্রিন্ট করুন
          </Button>
        </div>

        {/* Important Notes */}
        <Card className="p-4 bg-amber-50 border border-amber-200 mt-6 print:hidden">
          <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2" style={fontStyle}>
            <CreditCard className="h-4 w-4 text-amber-600" />
            গুরুত্বপূর্ণ তথ্য
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-700" style={fontStyle}>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>অ্যাপয়েন্টমেন্টের তারিখে সময়মতো উপস্থিত থাকুন</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>এই স্লিপটি প্রিন্ট করে বা স্ক্রিনশট নিয়ে সাথে রাখুন</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>চেম্বারে গিয়ে পেমেন্ট করুন — কোনো অগ্রিম পেমেন্ট নেই</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 print:hidden">
          <Link href={`/doctor/${docProfileSlug}`}>
            <Button
              variant="outline"
              className="w-full sm:w-auto hover:border-primary hover:text-primary transition-all"
              style={fontStyle}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ডাক্তারের প্রোফাইল
            </Button>
          </Link>
          <Link href="/">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary"
              style={fontStyle}
            >
              <Home className="h-4 w-4 mr-2" />
              হোমে যান
            </Button>
          </Link>
        </div>
      </div>

      <Footer />

      {/* Print Styles — single page, no blank second page */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }

          /* Hide UI elements */
          nav, footer, .print\\:hidden, #success-header {
            display: none !important;
          }

          /* Force colors and backgrounds */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Reset container for print */
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Reset main content area */
          main, .min-h-screen, .max-w-2xl {
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            background: none !important;
          }

          /* Stretch the slip in print */
          #appointment-slip-wrapper {
            display: block !important;
            margin: 0 !important;
            padding: 5mm !important;
            width: 100% !important;
          }

          #appointment-slip {
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
              লোড হচ্ছে...
            </p>
          </div>
        </div>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}
