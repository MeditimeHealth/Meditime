"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Star,
  Clock,
  Building2,
  MapPin,
  Award,
  Phone,
  Check,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";

interface Doctor {
  _id: string;
  name: string;
  qualification: string;
  specialty?: string; // Added field
  designation?: string; // Added field

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
    time: string;
  }> | {
    days: string[];
    time: string;
  };
  bio?: string;
  image?: string;
  rating?: number;
}



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

  const [departmentDiseases, setDepartmentDiseases] = useState<string[]>([]);

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
        console.log("Fetched doctor data:", data.doctor);
        
        // Fetch diseases for the doctor's department
        if (data.doctor.department) {
          fetchDepartmentDiseases(data.doctor.department);
        }
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

  const fetchDepartmentDiseases = async (departmentName: string) => {
    try {
      // First, get the department ID by name
      const deptResponse = await fetch(`/api/departments?name=${encodeURIComponent(departmentName)}`);
      const deptData = await deptResponse.json();
      
      if (deptData.departments && deptData.departments.length > 0) {
        const department = deptData.departments[0];
        
        // Then fetch diseases for this department
        const diseaseResponse = await fetch(`/api/diseases?department=${department._id}`);
        const diseaseData = await diseaseResponse.json();
        
        if (diseaseData.diseases && diseaseData.diseases.length > 0) {
          // Extract bangla names from diseases
          const diseaseBanglaNames = diseaseData.diseases
            .map((disease: { bangla: string }) => disease.bangla)
            .filter((name: string) => name); // Filter out empty names
          setDepartmentDiseases(diseaseBanglaNames);
        }
      }
    } catch (error) {
      console.error("Error fetching department diseases:", error);
    }
  };

  // Helper to calculate similarity score
  const calculateRelevanceScore = (currentDoc: Doctor, otherDoc: Doctor): number => {
    let score = 0;
    if (otherDoc.department === currentDoc.department) score += 10;
    if (otherDoc.hospital === currentDoc.hospital) score += 5;
    // Assuming same division/district implies "same area" if hospital is different
    if (otherDoc.district === currentDoc.district) score += 2;
    if (otherDoc.division === currentDoc.division) score += 1;
    return score;
  };

  const fetchRelatedDoctors = async () => {
    if (!doctor) return;
    
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok && data.doctors) {
        // Filter out current doctor
        const others = data.doctors.filter((d: Doctor) => d._id !== doctorId);
        
        // Sort by relevance score
        const sorted = others.sort((a: Doctor, b: Doctor) => {
          return calculateRelevanceScore(doctor, b) - calculateRelevanceScore(doctor, a);
        });

        setRelatedDoctors(sorted.slice(0, 3)); // Take top 3
      }
    } catch (error) {
      console.error("Error fetching related doctors:", error);
    }
  };


  // Trigger fetchRelatedDoctors when doctor is loaded
  useEffect(() => {
    if (doctor) {
      fetchRelatedDoctors();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Doctor not found</p>
            <Link href="/doctor">
              <Button>Back to Doctors</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const availabilityArray = Array.isArray(doctor.availability)
    ? doctor.availability
    : [doctor.availability];

  const newPatientFee = doctor.newPatientFee || doctor.consultationFee;
  const oldPatientFee = doctor.oldPatientFee;
  
   // Helper to format availability strictly for display
  const formatAvailability = (
    availability:
      | Array<{ days: string[]; time: string }>
      | { days: string[]; time: string },
  ): string => {
    const slots = Array.isArray(availability) ? availability : [availability];
    return slots
      .map((slot) => {
         // Simplify for card display: just show day range + time
         const sortedDays = slot.days.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
         const dayStr = sortedDays.length > 1 
            ? `${getBengaliDay(sortedDays[0])}-${getBengaliDay(sortedDays[sortedDays.length - 1])}`
            : getBengaliDay(sortedDays[0]);
         return `${dayStr} ${slot.time}`;
      })
      .join(" | ");
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 py-4">
        {/* ... (breadcrumb content same as before) ... */}
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
          {/* ... (Profile info same as updated previously) ... */}
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
                     {/* Safe rating check to avoid 0 rendering */}
                    {!!doctor.rating && doctor.rating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border-2 border-yellow-200">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl md:text-2xl font-bold text-gray-900">{doctor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                     {/* Specialty */}
                     <p className="text-primary font-bold text-lg md:text-xl">
                      {doctor.specialty}
                    </p>

                    {/* Degree/Qualification */}
                    <p
                      className="text-lg md:text-xl text-gray-700 font-semibold"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {doctor.qualification}
                    </p>

                    {/* Designation */}
                    {doctor.designation && (
                      <p
                        className="text-base md:text-lg text-gray-600 font-medium"
                        style={{
                          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        {doctor.designation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Desktop and Tablet */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diseases Treated Section - Show diseases based on department */}
            {departmentDiseases.length > 0 && (
              <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  যে সকল রোগের চিকিৎসা করা হয়
                </h2>
                <div className="bg-white p-6 rounded-xl border-2 border-primary/10 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Column */}
                    <ul className="space-y-3">
                      {departmentDiseases.slice(0, Math.ceil(departmentDiseases.length / 2)).map((disease, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-base md:text-lg font-semibold text-gray-800"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{disease}</span>
                        </li>
                      ))}
                    </ul>
                    {/* Second Column */}
                    <ul className="space-y-3">
                      {departmentDiseases.slice(Math.ceil(departmentDiseases.length / 2)).map((disease, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-base md:text-lg font-semibold text-gray-800"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{disease}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* About Section - Debugging Force Render */}
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
                    {doctor.bio ? doctor.bio : "No bio available (Debug: doctor.bio is falsy)"}
                  </p>
                </div>
              </Card>

            {/* Related Doctors - Desktop/Tablet */}
            <div className="hidden md:block">
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
                  <div className="grid grid-cols-1 gap-5">
                    {relatedDoctors.map((relatedDoctor) => (
                      <Link
                        key={relatedDoctor._id}
                        href={`/doctor/${relatedDoctor._id}`}
                        className="group block"
                      >
                         <div className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer overflow-hidden transform hover:-translate-y-1">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                          <div className="p-5">
                             <div className="flex items-center gap-4 mb-4">
                              {/* Doctor Image */}
                              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 shadow-inner shrink-0 group-hover:ring-2 ring-primary/20 transition-all">
                                {relatedDoctor.image ? (
                                  <Image
                                    src={relatedDoctor.image}
                                    alt={relatedDoctor.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <Stethoscope className="w-6 h-6 text-blue-400" />
                                  </div>
                                )}
                              </div>

                               {/* Name - Beside Photo */}
                              <div className="flex-1">
                                <h3
                                  className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors"
                                  style={{
                                    fontFamily:
                                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                  }}
                                >
                                  {relatedDoctor.name}
                                </h3>
                              </div>
                            </div>
                            
                            {/* Info Stack - Line by Line */}
                            <div className="space-y-1.5 ml-1">
                               {/* Specialty */}
                               <p className="text-primary font-medium text-sm">
                                {relatedDoctor.specialty}
                              </p>

                              {/* Qualification */}
                              <p
                                className="text-sm text-gray-600 leading-snug"
                                style={{
                                  fontFamily:
                                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                }}
                              >
                                {relatedDoctor.qualification}
                              </p>

                              {/* Designation */}
                              {relatedDoctor.designation && (
                                <p className="text-sm text-gray-500">
                                  {relatedDoctor.designation}
                                </p>
                              )}

                              {/* Hospital */}
                              {relatedDoctor.hospital && (
                                <p className="text-sm text-gray-700 font-medium">
                                  {relatedDoctor.hospital}
                                </p>
                              )}
                              
                               {/* Chamber Time */}
                              {relatedDoctor.availability && (
                                <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg inline-flex w-full">
                                  <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                                    {formatAvailability(relatedDoctor.availability)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                         </div>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Desktop */}
          <div className="hidden lg:block space-y-6">
            {/* Book Appointment */}
            <div >
              {/* <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                অ্যাপয়েন্টমেন্ট বুক করুন
              </h2> */}
              <div className="space-y-5">
                <Link href={`/doctor/${doctorId}/book`}>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    অনলাইনে বুক করুন
                  </Button>
                </Link>
              </div>
            </div>

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

            {/* Hospital Schedule */}
            <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                সময়সূচী
              </h2>
              <div className="space-y-5">
                {availabilityArray.map((slot, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border-2 border-primary/10 shadow-md last:mb-0">
                    {doctor.hospital && (
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <p
                          className="text-base md:text-lg font-bold text-gray-800"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.hospital}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {slot.days.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-full"
                        >
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <span
                            className="text-sm md:text-base font-semibold text-gray-700"
                            style={{
                              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {getBengaliDay(day)}: {slot.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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

          {/* Mobile Layout - Reordered */}
          <div className="lg:hidden space-y-6">
            {/* Fees Section - Mobile */}
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

            {/* Hospital Schedule - Mobile */}
            <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                সময়সূচী
              </h2>
              <div className="space-y-5">
                {availabilityArray.map((slot, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border-2 border-primary/10 shadow-md last:mb-0">
                    {doctor.hospital && (
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <p
                          className="text-base md:text-lg font-bold text-gray-800"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.hospital}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {slot.days.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-full"
                        >
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <span
                            className="text-sm md:text-base font-semibold text-gray-700"
                            style={{
                              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {getBengaliDay(day)}: {slot.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Book Appointment - Mobile */}
            <Card className="p-6 bg-gradient-to-br from-white to-emerald-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                অ্যাপয়েন্টমেন্ট বুক করুন
              </h2>
              <div className="space-y-5">
                <Link href={`/doctor/${doctorId}/book`}>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    অনলাইনে বুক করুন
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Related Doctors - Mobile (shown after Book Appointment) */}
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
                <div className="grid grid-cols-1 gap-5">
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
        </div>
      </div>
    </div>
  );
}

