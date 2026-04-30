"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CheckCircle, Calendar, MapPin, User, Phone, ArrowLeft, Home, Ticket, Printer, Stethoscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const banglaDays = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"];

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map(digit => bengaliDigits[parseInt(digit)]).join("");
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
  const labels = {
    old: "পুরাতন রোগী",
    new: "নতুন রোগী",
    report: "রিপোর্ট দেখানো",
  };
  return labels[type as keyof typeof labels] || type;
};

const getGenderLabel = (gender: string) => {
  const labels = {
    male: "পুরুষ",
    female: "মহিলা",
    other: "অন্যান্য",
  };
  return labels[gender as keyof typeof labels] || gender;
};


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
        // Save to localStorage as backup
        if (typeof window !== "undefined") {
          localStorage.setItem("lastAppointment", JSON.stringify(data.appointment));
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    } else {
      // If no appointment ID, try to get from localStorage (fallback)
      const savedAppointment = typeof window !== "undefined" 
        ? localStorage.getItem("lastAppointment")
        : null;
      if (savedAppointment) {
        try {
          setAppointment(JSON.parse(savedAppointment));
          setLoading(false);
        } catch (error) {
          console.error("Error parsing saved appointment:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [appointmentId, fetchAppointment]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            >
              অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!
            </h1>
            <p
              className="text-gray-600 mb-8"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            >
              আপনার অ্যাপয়েন্টমেন্টের বিস্তারিত তথ্য শীঘ্রই দেখানো হবে।
            </p>
            <div className="flex gap-4 justify-center">
              <Link href={`/doctor/${appointment.doctorId?.slug || appointment.doctorId?._id || doctorId}`}>
                <Button
                  variant="outline"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ডাক্তারের প্রোফাইলে ফিরে যান
                </Button>
              </Link>
              <Link href="/">
                <Button
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  হোমে যান
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4 border-2 border-green-100 shadow-sm">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            অ্যাপয়েন্টমেন্ট সফল!
          </h1>
          <p className="text-slate-500 text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>আপনার অ্যাপয়েন্টমেন্ট সফলভাবে নিশ্চিত করা হয়েছে</p>
        </div>

        {/* Appointment Slip - Professional Compact Design */}
        <Card className="bg-white border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-2" id="appointment-slip">
          {/* Slip Header - No image, MediTime in brand color, Appointment Slip in black */}
          <div className="bg-white border-b border-dashed border-slate-200 px-6 py-6 text-center">
            <h3 className="font-bold text-2xl tracking-tight" style={{ color: '#00B7B5', fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
              MediTime
            </h3>
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
              Appointment Slip
            </p>
            {appointment.serialNumber && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>সিরিয়াল নম্বর</p>
                <p className="font-mono font-bold text-2xl text-slate-900">{appointment.serialNumber}</p>
              </div>
            )}
          </div>

          {/* Slip Content */}
          <div className="p-6 space-y-6">
            {/* Section 1: Doctor Information */}
            {appointment.doctorId && (
              <div className="pb-5 border-b border-slate-100">
                <p className="text-[11px] text-[#00B7B5] font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>ডাক্তারের তথ্য</p>
                <p className="font-bold text-slate-900 text-xl mb-0.5" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  {appointment.doctorId.name}
                </p>
                {appointment.doctorId.specialty && (
                  <p className="text-sm text-[#00B7B5] font-semibold mb-0.5">{appointment.doctorId.specialty}</p>
                )}
                {appointment.doctorId.qualification && (
                  <p className="text-sm text-slate-600 font-medium mb-0.5">{appointment.doctorId.qualification}</p>
                )}
                {appointment.doctorId.designation && (
                  <p className="text-xs text-slate-400 font-medium">{appointment.doctorId.designation}</p>
                )}
              </div>
            )}

            {/* Section 2: Patient Information */}
            <div>
              <p className="text-[11px] text-[#00B7B5] font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>রোগীর তথ্য</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>রোগীর নাম</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <p className="font-bold text-slate-800" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>{appointment.patientName}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>মোবাইল নম্বর</p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <p className="font-bold text-slate-800">{appointment.mobileNumber}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>অ্যাপয়েন্টমেন্টের তারিখ</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#00B7B5]" />
                    <p className="font-bold text-slate-800" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>{formatDate(appointment.appointmentDate)}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>চেম্বার / হাসপাতাল</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-red-400 mt-0.5" />
                    <p className="font-bold text-slate-800" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>{appointment.hospitalName}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>রোগীর ধরন</p>
                  <p className="font-bold text-slate-800" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>{getPatientTypeLabel(appointment.patientType)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>স্ট্যাটাস</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    <CheckCircle className="h-3 w-3" />
                    {appointment.status === "pending" ? "অপেক্ষমান" : appointment.status === "confirmed" ? "নিশ্চিত" : "সম্পন্ন"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Slip Footer - Confirmation text */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-medium leading-relaxed" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
              আপনার অ্যাপয়েন্টমেন্ট কনফার্ম হয়েছে। অল্প সময়ের মধ্যেই আপনার সিরিয়াল নম্বরসহ একটি এসএমএস পাবেন।
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
              Your appointment has been confirmed. You will receive an SMS with your serial number shortly.
            </p>
          </div>
        </Card>

        {/* Print Button */}
        <div className="mt-4 flex justify-center print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            <Printer className="h-4 w-4" />
            প্রিন্ট করুন
          </Button>
        </div>

        {/* Important Notes - Compact */}
        <Card className="p-4 bg-yellow-50 border border-yellow-200 mt-6 print:hidden">
          <h3
            className="text-sm font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            গুরুত্বপূর্ণ তথ্য
          </h3>
          <ul className="space-y-1 text-xs text-gray-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>অ্যাপয়েন্টমেন্টের তারিখে সময়মতো উপস্থিত থাকুন</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 print:hidden">
          <Link href={`/doctor/${appointment.doctorId?.slug || appointment.doctorId?._id || doctorId}`}>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ডাক্তারের প্রোফাইল
            </Button>
          </Link>
          <Link href="/">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-orange-600"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            >
              <Home className="h-4 w-4 mr-2" />
              হোমে যান
            </Button>
          </Link>
        </div>
      </div>
      <Footer />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #appointment-slip, #appointment-slip * {
            visibility: visible;
          }
          #appointment-slip {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 80mm;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
