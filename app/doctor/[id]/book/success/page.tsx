"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { CheckCircle, Calendar, MapPin, User, Phone, ArrowLeft, Home, Ticket, Printer, Stethoscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

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
              <Link href={`/doctor/${doctorId}`}>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            অ্যাপয়েন্টমেন্ট সফল!
          </h1>
        </div>

        {/* Appointment Slip - Compact Design */}
        <Card className="bg-white border-2 border-gray-300 shadow-lg overflow-hidden print:shadow-none print:border" id="appointment-slip">
          {/* Slip Header with Logo and Serial Number */}
          <div className="bg-gradient-to-r from-primary to-orange-600 text-white px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
                  <Image 
                    src="/logo.png" 
                    alt="MediTime Logo" 
                    width={40} 
                    height={40}
                    className="object-contain"
                    onError={(e) => {
                      // Fallback if logo doesn't load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    MediTime
                  </h3>
                  <p className="text-xs opacity-90" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    অ্যাপয়েন্টমেন্ট স্লিপ
                  </p>
                </div>
              </div>
              {appointment.serialNumber ? (
                <div className="text-right">
                  <p className="text-xs opacity-80 mb-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>সিরিয়াল নম্বর</p>
                  <p className="font-mono font-bold text-lg tracking-wider bg-white/20 px-2 py-1 rounded inline-block">
                    {appointment.serialNumber}
                  </p>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-xs opacity-80 mb-1 bg-yellow-500/30 px-2 py-1 rounded" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    অপেক্ষমান
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Slip Content - Compact Rows */}
          <div className="p-4 space-y-0">
            {/* Doctor Info - Highlighted */}
            {appointment.doctorId && (
              <div className="bg-blue-50 border-b border-blue-200 -mx-4 px-4 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>ডাক্তার</span>
                </div>
                <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  {appointment.doctorId.name}
                </p>
                {appointment.doctorId.qualification && (
                  <p className="text-xs text-gray-600">{appointment.doctorId.qualification}</p>
                )}
              </div>
            )}

            {/* Compact Detail Rows */}
            <div className="divide-y divide-gray-100">
              {/* Patient Name */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <span className="text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>রোগীর নাম</span>
                </div>
                <span className="font-semibold text-gray-900" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  {appointment.patientName}
                </span>
              </div>

              {/* Mobile */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>মোবাইল</span>
                </div>
                <span className="font-semibold text-gray-900">{appointment.mobileNumber}</span>
              </div>

              {/* Gender & Age - Combined Row */}
              {(appointment.gender || appointment.age) && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />
                    <span className="text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>লিঙ্গ / বয়স</span>
                  </div>
                  <span className="font-semibold text-gray-900" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    {appointment.gender ? getGenderLabel(appointment.gender) : "-"}
                    {appointment.age && ` / ${toBengaliNumber(appointment.age)} বছর`}
                  </span>
                </div>
              )}

              {/* Patient Type */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>রোগীর ধরন</span>
                <span className="font-semibold text-gray-900" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  {getPatientTypeLabel(appointment.patientType)}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-2 bg-green-50 -mx-4 px-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>তারিখ</span>
                </div>
                <span className="font-bold text-green-800" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  {formatDate(appointment.appointmentDate)}
                </span>
              </div>

              {/* Hospital */}
              <div className="flex items-center justify-between py-2 bg-purple-50 -mx-4 px-4">
                <div className="flex items-center gap-2 text-purple-700">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>হাসপাতাল</span>
                </div>
                <span className="font-bold text-purple-800 text-right max-w-[60%]" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  {appointment.hospitalName}
                </span>
              </div>

              {/* Affiliate Code if exists */}
              {/* {appointment.affiliateCode && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Ticket className="h-4 w-4" />
                    <span className="text-sm" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>রেফারেল কোড</span>
                  </div>
                  <span className="font-mono font-semibold text-gray-900">{appointment.affiliateCode}</span>
                </div>
              )} */}
            </div>

            {/* Status Badge - Compact */}
            <div className="pt-3 mt-2 border-t border-dashed border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>স্ট্যাটাস</span>
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <CheckCircle className="h-3 w-3" />
                  {appointment.status === "pending" ? "অপেক্ষমান" : appointment.status === "confirmed" ? "নিশ্চিত" : "সম্পন্ন"}
                </span>
              </div>
            </div>
          </div>

          {/* Slip Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
              এই স্লিপটি অ্যাপয়েন্টমেন্টের দিন সাথে আনুন
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
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>আপনার মোবাইল নম্বরে SMS বা কল আসতে পারে</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>বাতিল করতে হলে কমপক্ষে ২৪ ঘন্টা আগে জানান</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 print:hidden">
          <Link href={`/doctor/${doctorId}`}>
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
