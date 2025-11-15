"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import {
  Star,
  Clock,
  Building2,
  MapPin,
  Award,
  Phone,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

interface Doctor {
  _id: string;
  name: string;
  qualification: string;
  currentPosition?: string;
  experience: number;
  hospital?: string;
  division?: string;
  district?: string;
  thana?: string;
  department?: string;
  oldPatientFee?: number;
  newPatientFee?: number;
  consultationFee: number;
  diseases?: string[];
  availability: Array<{
    days: string[];
    startTime: string;
    endTime: string;
    chamber?: string;
  }> | {
    days: string[];
    startTime: string;
    endTime: string;
    chamber?: string;
  };
  bio?: string;
  image?: string;
  rating?: number;
}

const STATIC_PHONE_NUMBERS = [
  "০৯৬১৩৮২০৫৯৫",
  "০১৯৪৬১০২১০২",
  "০১৯০৬৩৯৯৪৯৬",
  "০১৯০৬৩৯৯৪৯৭",
];

const banglaDays = [
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
  "রবিবার",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getBengaliDay = (day: string): string => {
  const index = daysOfWeek.indexOf(day);
  return index >= 0 ? banglaDays[index] : day;
};

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [relatedDoctors, setRelatedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
      fetchRelatedDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`);
      const data = await response.json();
      if (response.ok && data.doctor) {
        setDoctor(data.doctor);
      } else {
        router.push("/doctor");
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      router.push("/doctor");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok && data.doctors) {
        // Get doctors from same department or hospital, exclude current doctor
        const related = data.doctors
          .filter((d: Doctor) => d._id !== doctorId)
          .slice(0, 6);
        setRelatedDoctors(related);
      }
    } catch (error) {
      console.error("Error fetching related doctors:", error);
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

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Doctor not found</p>
            <Link href="/doctor">
              <Button>Back to Doctors</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availabilityArray = Array.isArray(doctor.availability)
    ? doctor.availability
    : [doctor.availability];

  const newPatientFee = doctor.newPatientFee || doctor.consultationFee;
  const oldPatientFee = doctor.oldPatientFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-base md:text-lg font-semibold text-gray-700">
            <Link href="/" className="hover:text-primary transition-colors" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>হোম</Link>
            <span className="text-gray-400">/</span>
            <Link href="/doctor" className="hover:text-primary transition-colors" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>বিশেষজ্ঞ ডাক্তার</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>{doctor.name}</span>
          </div>
        </div>
      </div>

      {/* Facebook-style Cover Photo - Fixed Static */}
      <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary">
        {/* Static Cover Image */}
        <div className="absolute inset-0">
          <Image
            src="/slide.jpg"
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      </div>

      {/* Profile Section - Facebook Style */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Profile Picture - Positioned over cover */}
            <div className="absolute -top-24 md:-top-32 left-0">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-6 border-white shadow-2xl bg-white ring-4 ring-white">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white text-5xl md:text-6xl font-bold">
                    {doctor.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info - Below profile picture */}
            <div className="pt-28 md:pt-36 pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1
                      className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {doctor.name}
                    </h1>
                    {doctor.rating && doctor.rating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border-2 border-yellow-200">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl md:text-2xl font-bold text-gray-900">{doctor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p
                      className="text-lg md:text-xl lg:text-2xl text-gray-700 font-semibold"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {[
                        doctor.currentPosition,
                        doctor.qualification,
                        doctor.department
                      ].filter(Boolean).join(", ")}
                    </p>
                    {doctor.hospital && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <p
                          className="text-base md:text-lg lg:text-xl text-gray-600"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.hospital}
                        </p>
                      </div>
                    )}
                    {doctor.experience && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <p
                          className="text-base md:text-lg lg:text-xl text-gray-600"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.experience} বছর অভিজ্ঞতা
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diseases Treated Section */}
            {doctor.diseases && doctor.diseases.length > 0 && (
              <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  যে সকল রোগের চিকিৎসা করা হয়
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctor.diseases.map((disease, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-primary/10 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Check className="h-6 w-6 text-primary shrink-0" />
                      <span
                        className="text-base md:text-lg font-semibold text-gray-800"
                        style={{
                          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        {disease}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* About Section */}
            {doctor.bio && (
              <Card className="p-8 bg-gradient-to-br from-white to-green-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  {doctor.name} সম্পর্কে
                </h2>
                <div className="bg-white p-6 rounded-xl border-2 border-primary/10 shadow-md">
                  <p
                    className="text-base md:text-lg text-gray-800 leading-relaxed whitespace-pre-line"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {doctor.bio}
                  </p>
                </div>
              </Card>
            )}

            {/* Related Doctors */}
            {relatedDoctors.length > 0 && (
              <Card className="p-8 bg-gradient-to-br from-white to-purple-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  সংশ্লিষ্ট ডাক্তার
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedDoctors.map((relatedDoctor) => (
                    <Link
                      key={relatedDoctor._id}
                      href={`/doctor/${relatedDoctor._id}`}
                      className="group"
                    >
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-all shadow-md hover:shadow-xl"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-200 ring-2 ring-primary/20">
                            {relatedDoctor.image ? (
                              <Image
                                src={relatedDoctor.image}
                                alt={relatedDoctor.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white text-2xl font-bold">
                                {relatedDoctor.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="text-base md:text-lg font-bold text-gray-900 truncate group-hover:text-primary"
                              style={{
                                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {relatedDoctor.name}
                            </h3>
                            <p
                              className="text-sm md:text-base text-gray-600 truncate"
                              style={{
                                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {[
                                relatedDoctor.currentPosition,
                                relatedDoctor.qualification,
                                relatedDoctor.department
                              ].filter(Boolean).join(", ")}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Fees Section */}
            <Card className="p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                ডাক্তারের পরামর্শ ফি
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-primary/10 shadow-md">
                  <span
                    className="text-base md:text-lg font-bold text-gray-800"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    নতুন রোগী
                  </span>
                  <span
                    className="text-xl md:text-2xl font-bold text-primary"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ৳{newPatientFee}
                  </span>
                </div>
                {oldPatientFee && (
                  <div className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-primary/10 shadow-md">
                    <span
                      className="text-base md:text-lg font-bold text-gray-800"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      পুরাতন রোগী
                    </span>
                    <span
                      className="text-xl md:text-2xl font-bold text-primary"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      ৳{oldPatientFee}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Chamber Schedule */}
            <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                চেম্বার সময়সূচী
              </h2>
              <div className="space-y-5">
                {availabilityArray.map((slot, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border-2 border-primary/10 shadow-md last:mb-0">
                    {slot.chamber && (
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <p
                          className="text-base md:text-lg font-bold text-gray-800"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {slot.chamber}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {slot.days.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <span
                            className="text-sm md:text-base font-semibold text-gray-700"
                            style={{
                              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {getBengaliDay(day)}: {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Book Appointment */}
            <Card className="p-6 bg-gradient-to-br from-white to-emerald-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                বুক অ্যাপয়েন্টমেন্ট
              </h2>
              <div className="space-y-5">
                <div>
                  <p
                    className="text-base md:text-lg font-bold text-gray-800 mb-4"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    কল করুন
                  </p>
                  <div className="space-y-3">
                    {STATIC_PHONE_NUMBERS.map((number, index) => (
                      <a
                        key={index}
                        href={`tel:${number.replace(/[০-৯]/g, (char) => {
                          const bangla = "০১২৩৪৫৬৭৮৯";
                          const english = "0123456789";
                          return english[bangla.indexOf(char)];
                        })}`}
                        className="flex items-center gap-3 p-4 bg-white hover:bg-primary/10 rounded-xl border-2 border-primary/20 hover:border-primary/50 transition-all shadow-md hover:shadow-lg"
                      >
                        <Phone className="h-5 w-5 text-primary shrink-0" />
                        <span
                          className="text-base md:text-lg font-bold text-primary"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {number}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="pt-5 border-t-2 border-gray-300 bg-white p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p
                      className="text-sm md:text-base font-semibold text-gray-700"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      কল করার সময়
                    </p>
                  </div>
                  <p
                    className="text-sm md:text-base text-gray-600"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    সময়ঃ সকাল ৬:০০টা হতে ৯:০০টা শনিবার হতে বৃহস্পতিবার
                  </p>
                </div>
              </div>
            </Card>

            {/* Doctor Rating */}
            {/* {doctor.rating && doctor.rating > 0 && (
              <Card className="p-6 bg-white border-2 border-primary/10 shadow-lg">
                <h2
                  className="text-xl font-bold text-gray-900 mb-4"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  ডাক্তার রেটিং
                </h2>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 ${
                          star <= Math.round(doctor.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className="text-2xl font-bold text-gray-900 mb-1"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {doctor.rating.toFixed(2)}
                  </p>
                  <p
                    className="text-sm text-gray-600"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ৫ এর ভেতর {doctor.rating.toFixed(2)}
                  </p>
                  <Button
                    className="mt-4 w-full"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    রেট ডাক্তার
                  </Button>
                </div>
              </Card>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}

