"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Stethoscope,
  Clock,
  CreditCard,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import Nav_for_details from "@/components/nav_for_details";

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const englishMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map((d) => bengaliDigits[parseInt(d)] ?? d).join("");
};

const formatDate = (dateString: string, lang: "en" | "bn"): string => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayNum = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  if (lang === "bn") {
    return `${banglaDays[day]}, ${toBengaliNumber(dayNum)} ${banglaMonths[month]}, ${toBengaliNumber(year)}`;
  }
  return `${englishDays[day]}, ${dayNum} ${englishMonths[month]}, ${year}`;
};

const patientTypeLabels: Record<string, { en: string; bn: string }> = {
  old: { en: "Existing Patient", bn: "পুরাতন রোগী" },
  new: { en: "New Patient", bn: "নতুন রোগী" },
  report: { en: "Report Review", bn: "রিপোর্ট দেখানো" },
};

const genderLabels: Record<string, { en: string; bn: string }> = {
  male: { en: "Male", bn: "পুরুষ" },
  female: { en: "Female", bn: "মহিলা" },
  other: { en: "Other", bn: "অন্যান্য" },
};

const t = {
  en: {
    checkoutTitle: "Review Your Appointment",
    checkoutSub: "Please confirm your booking details before proceeding.",
    doctorInfo: "Doctor Information",
    patientInfo: "Patient Information",
    patientName: "Patient Name",
    mobile: "Mobile Number",
    date: "Appointment Date",
    hospital: "Hospital / Chamber",
    patientType: "Patient Type",
    gender: "Gender",
    age: "Age",
    years: "years",
    affiliateCode: "Affiliate Code",
    agreeLabel: "I agree to the terms and conditions, and I understand this is a pay-later booking. I will pay when I visit.",
    payLaterBtn: "Confirm & Pay Later",
    confirming: "Confirming...",
    back: "Go Back",
    payLaterNote: "No upfront payment required. Pay at the chamber during your visit.",
    loadingDoctor: "Loading doctor details...",
  },
  bn: {
    checkoutTitle: "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন",
    checkoutSub: "এগিয়ে যাওয়ার আগে আপনার বুকিং তথ্য যাচাই করুন।",
    doctorInfo: "ডাক্তারের তথ্য",
    patientInfo: "রোগীর তথ্য",
    patientName: "রোগীর নাম",
    mobile: "মোবাইল নম্বর",
    date: "অ্যাপয়েন্টমেন্টের তারিখ",
    hospital: "চেম্বার / হাসপাতাল",
    patientType: "রোগীর ধরন",
    gender: "লিঙ্গ",
    age: "বয়স",
    years: "বছর",
    affiliateCode: "অ্যাফিলিয়েট কোড",
    agreeLabel: "আমি শর্তাবলীতে সম্মত, এবং আমি বুঝতে পারছি এটি একটি পে-লেটার বুকিং। আমি ভিজিটের সময় পেমেন্ট করব।",
    payLaterBtn: "নিশ্চিত করুন ও পরে পেমেন্ট করুন",
    confirming: "নিশ্চিত হচ্ছে...",
    back: "ফিরে যান",
    payLaterNote: "কোনো অগ্রিম পেমেন্ট নেই। চেম্বারে গিয়ে পেমেন্ট করুন।",
    loadingDoctor: "ডাক্তারের তথ্য লোড হচ্ছে...",
  },
};

function CheckoutContent() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;
  const { language } = useLanguage();
  const txt = t[language];
  const fontStyle = {};

  const [booking, setBooking] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pending booking from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("pendingBooking");
      if (data) {
        try {
          setBooking(JSON.parse(data));
        } catch {
          setError("Invalid booking data. Please go back and try again.");
        }
      } else {
        router.replace(`/doctor/${doctorId}/book`);
      }
    }
  }, [doctorId, router]);

  // Fetch doctor details from API using the URL param (slug or id)
  const fetchDoctor = useCallback(async () => {
    try {
      setDoctorLoading(true);
      const decodedId = decodeURIComponent(doctorId);
      const response = await fetch(`/api/doctors/${encodeURIComponent(decodedId)}`);
      const data = await response.json();
      console.log(data)
      if (response.ok && data.doctor) {
        setDoctor(data.doctor);
      }
    } catch (err) {
      console.error("Error fetching doctor:", err);
    } finally {
      setDoctorLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId, fetchDoctor]);

  const handleConfirm = async () => {
    if (!agreed || !booking) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: booking.doctorId,
          patientName: booking.patientName,
          mobileNumber: booking.mobileNumber,
          gender: booking.gender,
          age: booking.age,
          patientType: booking.patientType,
          hospitalName: booking.hospitalName,
          appointmentDate: booking.appointmentDate,
          userId: booking.userId,
          affiliateCode: booking.affiliateCode,
        }),
      });

      const data = await response.json();
      if (response.ok && data.appointment) {
        if (typeof window !== "undefined") {
          localStorage.setItem("lastAppointment", JSON.stringify(data.appointment));
          localStorage.removeItem("pendingBooking");
        }
        router.push(`/doctor/${doctorId}/book/success?appointmentId=${data.appointment._id}`);
      } else {
        setError(data.error || "Failed to book appointment. Please try again.");
      }
    } catch (err) {
      console.error("Error confirming appointment:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Nav_for_details />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Nav_for_details />

   

      <div className="max-w-3xl mt-16 mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Page heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 border-2 border-primary/20">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1" style={fontStyle}>
            {txt.checkoutTitle}
          </h1>
          <p className="text-slate-500 text-sm" style={fontStyle}>
            {txt.checkoutSub}
          </p>
        </div>

        {/* Appointment Preview Card */}
        <Card className="bg-white border border-slate-200 shadow-2xl overflow-hidden mb-6">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#00B7B5] to-teal-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight" style={fontStyle}>
                  MediTime
                </h2>
                <p className="text-white/80 text-xs font-medium tracking-wider uppercase">
                  Appointment Preview
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Doctor Section — fetched from API */}
            <div className="pb-5 border-b border-dashed border-slate-200">
              <p
                className="text-[11px] text-[#00B7B5] font-bold uppercase tracking-widest mb-3"
                style={fontStyle}
              >
                {txt.doctorInfo}
              </p>

              {doctorLoading ? (
                <div className="flex items-center gap-3 py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm text-slate-400" style={fontStyle}>
                    {txt.loadingDoctor}
                  </p>
                </div>
              ) : doctor ? (
                <div className="flex items-start gap-4">
                  {/* Doctor Image */}
                  {doctor.image ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
                      <Image
                        src={doctor.image}
                        alt={doctor.name || "Doctor"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-teal-100 border-2 border-slate-100 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-7 w-7 text-primary" />
                    </div>
                  )}

                  {/* Doctor Info */}
                  <div>
                    <p className="font-bold text-slate-900 text-lg leading-tight" style={fontStyle}>
                      {language === "bn" ? (doctor.nameBn || "") : (doctor.name || "")}
                    </p>
                    {(language === "bn" ? doctor.specialtyBn : doctor.specialty) && (
                      <p className="text-sm text-[#00B7B5] font-semibold mt-0.5" style={fontStyle}>
                        {language === "bn" ? (doctor.specialtyBn || "") : (doctor.specialty || "")}
                      </p>
                    )}
                    {(language === "bn" ? doctor.qualificationBn : doctor.qualification) && (
                      <p className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
                        {language === "bn" ? (doctor.qualificationBn || "") : (doctor.qualification || "")}
                      </p>
                    )}
                    {(language === "bn" ? doctor.designationBn : doctor.designation) && (
                      <p className="text-xs text-slate-400 mt-0.5" style={fontStyle}>
                        {language === "bn" && doctor.designationBn
                          ? doctor.designationBn
                          : doctor.designation}
                      </p>
                    )}
                    {doctor.hospital && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-red-400" />
                        <p className="text-xs text-slate-500" style={fontStyle}>
                          {doctor.hospital}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400" style={fontStyle}>
                  Doctor details unavailable
                </p>
              )}
            </div>

            {/* Patient / Booking Details */}
            <div>
              <p
                className="text-[11px] text-[#00B7B5] font-bold uppercase tracking-widest mb-4"
                style={fontStyle}
              >
                {txt.patientInfo}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Patient Name */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <User className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                      {txt.patientName}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5" style={fontStyle}>
                      {booking.patientName}
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                      {txt.mobile}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">
                      {booking.mobileNumber}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="h-4 w-4 text-[#00B7B5] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                      {txt.date}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5" style={fontStyle}>
                      {formatDate(booking.appointmentDate, language)}
                    </p>
                  </div>
                </div>

                {/* Hospital */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                      {txt.hospital}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5" style={fontStyle}>
                      {booking.hospitalName}
                    </p>
                  </div>
                </div>

                {/* Patient Type */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                      {txt.patientType}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5" style={fontStyle}>
                      {patientTypeLabels[booking.patientType]?.[language] || booking.patientType}
                    </p>
                  </div>
                </div>

                {/* Gender */}
                {booking.gender && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <User className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                        {txt.gender}
                      </p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5" style={fontStyle}>
                        {genderLabels[booking.gender]?.[language] || booking.gender}
                      </p>
                    </div>
                  </div>
                )}

                {/* Age */}
                {booking.age && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <Clock className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider" style={fontStyle}>
                        {txt.age}
                      </p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5" style={fontStyle}>
                        {language === "bn" ? toBengaliNumber(booking.age) : booking.age}{" "}
                        {txt.years}
                      </p>
                    </div>
                  </div>
                )}

                {/* Affiliate Code */}
                {booking.affiliateCode && (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                    <CreditCard className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple-500 font-bold uppercase tracking-wider" style={fontStyle}>
                        {txt.affiliateCode}
                      </p>
                      <p className="font-semibold text-purple-800 text-sm mt-0.5 font-mono">
                        {booking.affiliateCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pay Later Notice */}
          <div className="bg-amber-50 border-t border-amber-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium" style={fontStyle}>
                {txt.payLaterNote}
              </p>
            </div>
          </div>
        </Card>

        {/* Agreement Checkbox */}
        <div className="mb-5">
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <label
                htmlFor="agree-checkbox"
                className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center cursor-pointer select-none ${
                  agreed
                    ? "bg-primary border-primary"
                    : "bg-white border-slate-300 hover:border-primary"
                }`}
              >
                {agreed && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </label>
            </div>
            <label
              htmlFor="agree-checkbox"
              className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
              style={fontStyle}
            >
              {txt.agreeLabel}
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600" style={fontStyle}>
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/doctor/${doctorId}/book`} className="sm:flex-1">
            <Button
              variant="outline"
              className="w-full border-2 border-slate-300 hover:border-primary hover:text-primary transition-all"
              style={fontStyle}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {txt.back}
            </Button>
          </Link>

          <Button
            onClick={handleConfirm}
            disabled={!agreed || submitting}
            className={`sm:flex-[2] font-bold py-3 text-base shadow-lg transition-all duration-300 ${
              agreed && !submitting
                ? "bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white hover:shadow-xl"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            style={fontStyle}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {txt.confirming}
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                {txt.payLaterBtn}
              </>
            )}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
