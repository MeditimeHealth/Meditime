"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { CheckCircle, Calendar, Clock, MapPin, User, Phone, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

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

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = params?.id as string;
  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  }, [appointmentId]);

  const fetchAppointment = async () => {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6 animate-pulse">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1
            className="text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!
          </h1>
          <p
            className="text-xl text-gray-600"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে
          </p>
        </div>

        {/* Appointment Details Card */}
        <Card className="p-8 bg-white border-2 border-green-200 shadow-xl mb-8">
          <h2
            className="text-2xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            অ্যাপয়েন্টমেন্টের বিস্তারিত
          </h2>

          <div className="space-y-6">
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    রোগীর নাম
                  </p>
                  <p
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    {appointment.patientName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    মোবাইল নম্বর
                  </p>
                  <p
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    {appointment.mobileNumber}
                  </p>
                </div>
              </div>

              {appointment.age && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p
                      className="text-sm text-gray-500 mb-1"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      বয়স
                    </p>
                    <p
                      className="text-lg font-bold text-gray-900"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      {toBengaliNumber(appointment.age)} বছর
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p
                    className="text-sm text-gray-500 mb-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    রোগীর ধরন
                  </p>
                  <p
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    {getPatientTypeLabel(appointment.patientType)}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Date & Time */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p
                      className="text-sm text-gray-500 mb-1"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      অ্যাপয়েন্টমেন্ট তারিখ
                    </p>
                    <p
                      className="text-lg font-bold text-gray-900"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p
                      className="text-sm text-gray-500 mb-1"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      চেম্বার
                    </p>
                    <p
                      className="text-lg font-bold text-gray-900"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      {appointment.chamberName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            {appointment.doctorId && (
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
                  <p
                    className="text-sm text-gray-500 mb-2"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    ডাক্তার
                  </p>
                  <p
                    className="text-xl font-bold text-gray-900 mb-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    {appointment.doctorId.name}
                  </p>
                  {appointment.doctorId.qualification && (
                    <p
                      className="text-base text-gray-600"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      {appointment.doctorId.qualification}
                      {appointment.doctorId.department && `, ${appointment.doctorId.department}`}
                    </p>
                  )}
                  {appointment.doctorId.hospital && (
                    <p
                      className="text-sm text-gray-500 mt-1"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      {appointment.doctorId.hospital}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex items-center justify-center">
                <span
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold bg-green-100 text-green-800 border-2 border-green-300"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <CheckCircle className="h-5 w-5" />
                  {appointment.status === "pending" ? "অপেক্ষমান" : appointment.status === "confirmed" ? "নিশ্চিত" : "সম্পন্ন"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="p-6 bg-yellow-50 border-2 border-yellow-200 mb-8">
          <h3
            className="text-lg font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            গুরুত্বপূর্ণ তথ্য
          </h3>
          <ul className="space-y-2 text-gray-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold mt-1">•</span>
              <span>অ্যাপয়েন্টমেন্টের তারিখে সময়মতো উপস্থিত থাকুন</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold mt-1">•</span>
              <span>আপনার মোবাইল নম্বরে একটি SMS বা কল আসতে পারে</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold mt-1">•</span>
              <span>কোন পরিবর্তন প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold mt-1">•</span>
              <span>অ্যাপয়েন্টমেন্ট বাতিল করতে হলে কমপক্ষে ২৪ ঘন্টা আগে জানান</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/doctor/${doctorId}`}>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ডাক্তারের প্রোফাইলে ফিরে যান
            </Button>
          </Link>
          <Link href="/">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            >
              <Home className="h-4 w-4 mr-2" />
              হোমে যান
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

