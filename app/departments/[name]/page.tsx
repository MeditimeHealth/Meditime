"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  Clock,
  Building2,
  MapPin,
  Award,
  Stethoscope,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;


  phoneNumber: string;
  email?: string;
  hospital?: string;
  division?: string;
  district?: string;
  thana?: string;
  department?: string;
  consultationFee: number;
  oldPatientFee?: number;
  newPatientFee?: number;
  diseases?: string[];
  slotDuration?: number;
  availability:
    | Array<{
        days: string[];
        startTime: string;
        endTime: string;
      }>
    | {
        days: string[];
        startTime: string;
        endTime: string;
      };

  bio?: string;
  image?: string;
  rating?: number;
}

const banglaLabels = {
  findDoctor: "ডাক্তার খুঁজুন",
  searchPlaceholder: "নাম, বিশেষতা, হাসপাতাল দিয়ে খুঁজুন...",
  noDoctors: "এই বিভাগে কোন ডাক্তার পাওয়া যায়নি",
  loading: "ডাক্তার লোড হচ্ছে...",
  bookAppointment: "বুক অ্যাপয়েন্টমেন্ট",

  availability: "সময়সূচী",
  found: "খুঁজে পাওয়া গেছে",
  doctors: "জন ডাক্তার",
  departmentNotFound: "বিভাগ পাওয়া যায়নি",
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => bengaliDigits[parseInt(digit)])
    .join("");
};

// Convert time to Bengali format
const formatTimeToBengali = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const hourStr = toBengaliNumber(hours);
  const minuteStr = minutes > 0 ? ` ${toBengaliNumber(minutes)} মিনিট` : "";
  return `${hourStr}টা${minuteStr}`;
};

// Get Bengali day name
const getBengaliDay = (day: string): string => {
  const dayIndex = daysOfWeek.indexOf(day);
  return dayIndex >= 0 ? banglaDays[dayIndex] : day;
};

// Format availability in Bengali
const formatAvailability = (
  availability:
    | Array<{
        days: string[];
        startTime: string;
        endTime: string;
      }>
    | { days: string[]; startTime: string; endTime: string; }
): string => {
  const slots = Array.isArray(availability) ? availability : [availability];

  return slots
    .map((slot) => {
      const sortedDays = slot.days.sort((a, b) => {
        return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
      });

      let timeRange = "";
      if (sortedDays.length === 1) {
        const day = getBengaliDay(sortedDays[0]);
        const startTime = formatTimeToBengali(slot.startTime);
        const endTime = formatTimeToBengali(slot.endTime);
        timeRange = `${day} ${startTime} থেকে ${endTime}`;
      } else {
        const firstDay = getBengaliDay(sortedDays[0]);
        const lastDay = getBengaliDay(sortedDays[sortedDays.length - 1]);
        const startTime = formatTimeToBengali(slot.startTime);
        const endTime = formatTimeToBengali(slot.endTime);
        timeRange = `${firstDay} থেকে ${lastDay} ${startTime} থেকে ${endTime}`;
      }

      return timeRange;
    })
    .join("। ");
};

export default function DepartmentDoctorsPage() {
  const params = useParams();
  const departmentName = decodeURIComponent(params.name as string);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [departmentName]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok) {
        // Filter doctors by department
        const departmentDoctors = (data.doctors || []).filter(
          (doctor: Doctor) => doctor.department === departmentName
        );
        setDoctors(departmentDoctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search query
  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;

    const query = searchQuery.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.hospital?.toLowerCase().includes(query) ||
        doctor.qualification.toLowerCase().includes(query) ||
        doctor.bio?.toLowerCase().includes(query)
    );
  }, [doctors, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-xl font-semibold text-gray-700">
              {banglaLabels.loading}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[400px] md:h-[500px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/50 to-primary-dark/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=1920&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {departmentName}
              </h1>
              <p
                className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                এই বিভাগের সকল বিশেষজ্ঞ ডাক্তার দেখুন এবং অ্যাপয়েন্টমেন্ট বুক করুন
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={banglaLabels.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 text-center"
        >
          <p
            className="text-lg text-gray-600"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            {filteredDoctors.length} {banglaLabels.doctors}{" "}
            {banglaLabels.found}
          </p>
        </motion.div>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Stethoscope className="h-24 w-24 text-gray-300 mx-auto" />
              </div>
              <h3
                className="text-2xl font-semibold text-gray-700 mb-4"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {banglaLabels.noDoctors}
              </h3>
              <p
                className="text-gray-500 mb-8"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                দয়া করে অন্য বিভাগ দেখুন অথবা পরে আবার চেষ্টা করুন
              </p>
              <Link href="/departments">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  সকল বিভাগ দেখুন
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <Link href={`/doctor/${doctor._id}`}>
                  <Card className="p-6 bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 h-full cursor-pointer">
                    <div className="space-y-4">
                      {/* Doctor Image */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                        {doctor.image ? (
                          <Image
                            src={doctor.image}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.3"/>
                              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1"/>
                              <path d="M15 3v2M15 7v2M13 5h4" stroke="#4A90A4" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Doctor Name */}
                      <h3
                        className="text-xl font-bold text-[#2C5282]"
                        style={{
                          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        {doctor.name}
                      </h3>

                      {/* Position & Qualification */}
                      <p
                        className="text-sm text-[#4A90A4] leading-relaxed"
                        style={{
                          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        {doctor.qualification || "বিশেষজ্ঞ"}
                      </p>

                      {/* Department */}
                      {doctor.department && (
                        <p
                          className="text-sm text-[#4A90A4]"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.department}
                        </p>
                      )}

                      {/* Red Divider Line */}
                      <div className="w-12 h-0.5 bg-[#8B4513] my-3"></div>

                      {/* Hospital Name */}
                      {doctor.hospital && (
                        <p
                          className="text-base font-semibold text-gray-700 leading-relaxed"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.hospital}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
