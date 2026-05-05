"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  Clock,
  Users,
  Award,
  Search,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { motion } from "framer-motion";

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
  availability: Array<{
    days: string[];
    startTime?: string;
    endTime?: string;
    time?: string;
    timeBn?: string;
  }> | {
    days: string[];
    startTime?: string;
    endTime?: string;
    time?: string;
    timeBn?: string;
  };
  bio?: string;
  image?: string;
  rating?: number;
}

interface Hospital {
  slug: string;
  _id: string;
  name: string;
  thana?: {
    _id: string;
    name: string;
    district?: {
      _id: string;
      name: string;
      division?: {
        _id: string;
        name: string;
      };
    };
  };
  address?: string;
  phone?: string;
  email?: string;
}

type SortOption =
  | "name"

  | "consultationFee"
  | "rating"
  | "specialty";
type SortDirection = "asc" | "desc";

const banglaLabels = {
  back: "হাসপাতালে ফিরুন",
  hospitalNotFound: "হাসপাতাল পাওয়া যায়নি",
  notFoundDesc: "আপনি যে হাসপাতাল খুঁজছেন তা বিদ্যমান নেই।",
  doctorsAt: "এই হাসপাতালের ডাক্তার",
  doctorsAvailable: "জন ডাক্তার উপলব্ধ",
  noDoctors: "এই হাসপাতালে কোন ডাক্তার পাওয়া যায়নি",
  checkLater: "পরবর্তীতে আবার চেক করুন",
  sortBy: "সাজান",
  name: "নাম",

  consultationFee: "কনসালটেশন ফি",
  rating: "রেটিং",
  specialty: "বিশেষতা",
  bookAppointment: "বুক অ্যাপয়েন্টমেন্ট",
  location: "অবস্থান",
  address: "ঠিকানা",
  contact: "যোগাযোগ",
  email: "ইমেইল",
  phone: "ফোন",
  availability: "হাসপাতাল সময়সূচী",
  loading: "হাসপাতালের তথ্য লোড হচ্ছে...",
};

const daysOfWeek = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const banglaDays = [
  "শনিবার",
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
];

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map(digit => bengaliDigits[parseInt(digit)]).join("");
};

// Convert time to Bengali format (e.g., "10:00" -> "১০টা")
const formatTimeToBengali = (time: string): string => {
  if (!time || typeof time !== "string" || !time.includes(":")) {
    return time || "";
  }
  try {
    const parts = time.split(":");
    if (parts.length < 2) return time;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return time;

    const hourStr = toBengaliNumber(hours);
    const minuteStr = minutes > 0 ? ` ${toBengaliNumber(minutes)} মিনিট` : "";
    return `${hourStr}টা${minuteStr}`;
  } catch (e) {
    console.error("Error formatting time:", e);
    return time;
  }
};

// Get Bengali day name
const getBengaliDay = (day: string): string => {
  const dayIndex = daysOfWeek.indexOf(day);
  return dayIndex >= 0 ? banglaDays[dayIndex] : day;
};

// Check if days are consecutive
const areDaysConsecutive = (sortedDays: string[]): boolean => {
  if (sortedDays.length <= 1) return true;
  for (let i = 1; i < sortedDays.length; i++) {
    const prevIndex = daysOfWeek.indexOf(sortedDays[i - 1]);
    const currIndex = daysOfWeek.indexOf(sortedDays[i]);
    if (currIndex - prevIndex !== 1) return false;
  }
  return true;
};

// Format availability in Bengali
const formatAvailability = (availability: any): string => {
  // Handle backward compatibility - convert old format to array
  const slots = Array.isArray(availability) ? availability : [availability];

  return slots.map(slot => {
    if (!slot || !slot.days || !Array.isArray(slot.days)) return "";

    const sortedDays = [...slot.days].sort((a, b) => {
      return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
    });

    let timeRange = "";

    // Check for new format fields first
    if (slot.timeBn && slot.timeBn.trim() !== "") {
      timeRange = slot.timeBn;
    } else if (slot.time && slot.time.trim() !== "") {
      timeRange = slot.time;
    } else if (slot.startTime && slot.endTime) {
      // Old format fallback
      const startTime = formatTimeToBengali(slot.startTime);
      const endTime = formatTimeToBengali(slot.endTime);
      timeRange = `${startTime} থেকে ${endTime}`;
    }

    const consecutive = areDaysConsecutive(sortedDays);

    if (sortedDays.length === 1) {
      const day = getBengaliDay(sortedDays[0]);
      return `${day} ${timeRange}`;
    } else if (consecutive) {
      const firstDay = getBengaliDay(sortedDays[0]);
      const lastDay = getBengaliDay(sortedDays[sortedDays.length - 1]);
      return `${firstDay} থেকে ${lastDay} ${timeRange}`;
    } else {
      const daysList = sortedDays.map(d => getBengaliDay(d)).join(", ");
      return `${daysList} ${timeRange}`;
    }
  }).filter(Boolean).join("। ");
};

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalSlug = decodeURIComponent(params.slug as string);

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHospitalAndDoctors = useCallback(async () => {
    try {
      setLoading(true);

      const hospitalsResponse = await fetch("/api/locations/hospitals");
      const hospitalsData = await hospitalsResponse.json();

      if (hospitalsResponse.ok) {
        setAllHospitals(hospitalsData.hospitals);
        const foundHospital = hospitalsData.hospitals.find(
          (h: Hospital) => h.slug == hospitalSlug
        );
        setHospital(foundHospital || null);
      }

      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();

      if (doctorsResponse.ok) {
        const hospitalDoctors = doctorsData.doctors.filter(
          (doctor: Doctor) => doctor.hospital === hospital?.name
        );
        setDoctors(hospitalDoctors);
        console.log(doctorsData)
      }
    } catch (error) {
      console.error("Error fetching hospital and doctors:", error);
    } finally {
      setLoading(false);
    }
  }, [hospitalSlug]);

  useEffect(() => {
    fetchHospitalAndDoctors();
  }, [fetchHospitalAndDoctors]);

  const getHospitalLocationString = (hospital: Hospital | null): string => {
    if (!hospital) return "";
    const parts: string[] = [];
    if (hospital.thana?.district?.division?.name) {
      parts.push(hospital.thana.district.division.name);
    }
    if (hospital.thana?.district?.name) {
      parts.push(hospital.thana.district.name);
    }
    if (hospital.thana?.name) {
      parts.push(hospital.thana.name);
    }
    return parts.join(", ");
  };

  // Get recommended hospitals from the same location
  const recommendedHospitals = useMemo(() => {
    if (!hospital || !allHospitals.length) return [];

    const currentThanaId = hospital.thana?._id;
    const currentDistrictId = hospital.thana?.district?._id;
    const currentDivisionId = hospital.thana?.district?.division?._id;

    return allHospitals
      .filter((h) => {
        // Exclude current hospital
        if (h.name === hospital.name) return false;

        // Match by thana (most specific)
        if (currentThanaId && h.thana?._id === currentThanaId) return true;

        // Match by district if thana doesn't match
        if (currentDistrictId && h.thana?.district?._id === currentDistrictId) return true;

        // Match by division if district doesn't match
        if (currentDivisionId && h.thana?.district?.division?._id === currentDivisionId) return true;

        return false;
      })
      .slice(0, 3); // Limit to 3 recommendations
  }, [hospital, allHospitals]);

  const sortedDoctors = useMemo(() => {
    const sorted = [...doctors];

    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;

        case "consultationFee":
          aVal = a.consultationFee;
          bVal = b.consultationFee;
          break;
        case "rating":
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case "specialty":
          aVal = a.specialty.toLowerCase();
          bVal = b.specialty.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [doctors, sortBy, sortDirection]);

  // Filter doctors based on search query
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return sortedDoctors;

    const query = searchQuery.toLowerCase().trim();
    return sortedDoctors.filter((doctor) => {
      const nameMatch = doctor.name.toLowerCase().includes(query);
      const specialtyMatch = doctor.specialty?.toLowerCase().includes(query);
      const qualificationMatch = doctor.qualification?.toLowerCase().includes(query);
      const departmentMatch = doctor.department?.toLowerCase().includes(query);
      return nameMatch || specialtyMatch || qualificationMatch || departmentMatch;
    });
  }, [sortedDoctors, searchQuery]);

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

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-7xl mt-28 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 text-center shadow-xl">
              <Building2 className="h-20 w-20 mx-auto text-gray-400 mb-6" />
              <h2
                className="text-3xl font-bold text-gray-900 mb-4"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {banglaLabels.hospitalNotFound}
              </h2>
              <p
                className="text-lg text-gray-600 mb-8"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {banglaLabels.notFoundDesc}
              </p>
              <Button
                onClick={() => router.push("/hospital")}
                variant="outline"
                className="text-lg px-6 py-3"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {banglaLabels.back}
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <div className="max-w-7xl mt-28 mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <Button
                variant="outline"
                onClick={() => router.push("/hospital")}
                className="text-base px-5 py-2.5 shadow-md hover:shadow-lg transition-all"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {banglaLabels.back}
              </Button>
            </motion.div>

            {/* Hospital Header - Modern Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-white border-2 border-primary/20 shadow-xl">
                <div className="flex flex-col md:flex-row gap-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg"
                  >
                    <Building2 className="h-16 w-16 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h1
                      className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"

                    >
                      {hospital.name}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getHospitalLocationString(hospital) && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-gray-200"
                        >
                          <MapPin className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                          <div>
                            <p
                              className="text-sm font-semibold text-gray-500 mb-1"
                              style={{
                                fontFamily:
                                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {banglaLabels.location}
                            </p>
                            <p
                              className="text-base font-medium text-gray-800"
                              style={{
                                fontFamily:
                                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {getHospitalLocationString(hospital)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {hospital.address && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-gray-200"
                        >
                          <MapPin className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                          <div>
                            <p
                              className="text-sm font-semibold text-gray-500 mb-1"
                              style={{
                                fontFamily:
                                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {banglaLabels.address}
                            </p>
                            <p
                              className="text-base font-medium text-gray-800"
                              style={{
                                fontFamily:
                                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {hospital.address}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {/* {hospital.phone && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-gray-200"
                    >
                      <Phone className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                          {banglaLabels.phone}
                        </p>
                        <a href={`tel:${hospital.phone}`} className="text-base font-medium text-primary hover:underline">
                          {hospital.phone}
                        </a>
                      </div>
                    </motion.div>
                  )} */}
                      {/* {hospital.email && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-gray-200"
                    >
                      <Mail className="h-6 w-6 shrink-0 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                          {banglaLabels.email}
                        </p>
                        <a href={`mailto:${hospital.email}`} className="text-base font-medium text-primary hover:underline">
                          {hospital.email}
                        </a>
                      </div>
                    </motion.div>
                  )} */}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Doctors Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="mb-8">
                {/* Hospital Description Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-10"
                >
                  <Card className="p-8 bg-gradient-to-br from-white via-primary/5 to-white border-2 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="space-y-4">
                      <h3
                        className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3"
                        style={{
                          fontFamily:
                            "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        হাসপাতাল সম্পর্কে
                      </h3>
                      <div
                        className="text-base md:text-lg leading-relaxed text-gray-700 space-y-4"
                        style={{
                          fontFamily:
                            "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        <p className="text-justify">
                          {hospital.name} একটি আধুনিক ও উন্নত চিকিৎসা সেবা প্রদানকারী
                          স্বাস্থ্যসেবা প্রতিষ্ঠান। আমাদের হাসপাতালে অভিজ্ঞ ও দক্ষ
                          চিকিৎসকগণ সর্বোচ্চ মানের চিকিৎসা সেবা প্রদান করে থাকেন।
                          আধুনিক চিকিৎসা সরঞ্জাম ও প্রযুক্তির সমন্বয়ে আমরা রোগীদের
                          জন্য সর্বোত্তম চিকিৎসা নিশ্চিত করি।
                        </p>
                        {/* <p className="text-justify">
                      আমাদের হাসপাতালে বিভিন্ন বিশেষজ্ঞ ডাক্তারদের পরামর্শ গ্রহণ
                      করা যায় এবং উন্নতমানের ডায়াগনস্টিক সেবা পাওয়া যায়।
                      রোগীদের সুবিধার জন্য আমরা সহজ অ্যাপয়েন্টমেন্ট সিস্টেম
                      এবং নিয়মিত চিকিৎসা পরামর্শ প্রদান করে থাকি। আপনার
                      স্বাস্থ্যসেবার প্রয়োজন মেটাতে আমরা সর্বদা প্রস্তুত।
                    </p> */}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Doctors Header with Search Box */}
                <div className="flex flex-col  items-start  justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h2
                      className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3"

                    >
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      {hospital.name}'s Doctors list
                    </h2>
                  </div>

                  {/* Search Box */}
                  <div className="w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="ডাক্তার খুঁজুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full md:w-80 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                       
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sort Controls - Modern Design */}
                {/* <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md border border-gray-200">
              <label
                htmlFor="sortBy"
                className="text-base font-semibold text-gray-700 whitespace-nowrap"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {banglaLabels.sortBy}:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                <option value="name">{banglaLabels.name}</option>
                <option value="experience">{banglaLabels.experience}</option>
                <option value="consultationFee">
                  {banglaLabels.consultationFee}
                </option>
                <option value="rating">{banglaLabels.rating}</option>
                <option value="specialty">{banglaLabels.specialty}</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="px-4 py-2 text-lg"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div> */}
              </div>

              {/* Doctors Grid */}
              {filteredDoctors.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-16 text-center shadow-xl bg-gradient-to-br from-gray-50 to-white">
                    <Users className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                    <p
                      className="text-2xl font-semibold text-gray-600 mb-3"

                    >
                      {searchQuery ? "কোন ডাক্তার পাওয়া যায়নি" : banglaLabels.noDoctors}
                    </p>
                    <p
                      className="text-lg text-gray-400"

                    >
                      {searchQuery ? "অনুগ্রহ করে অন্য শব্দ দিয়ে খুঁজুন" : banglaLabels.checkLater}
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredDoctors.map((doctor, index) => (
                    <motion.div
                      key={doctor._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                    >
                      <Link href={`/doctor/${doctor._id}`}>
                        <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-300 h-full cursor-pointer">
                          <div className="space-y-5">
                            {/* Doctor Image and Basic Info */}
                            <div className="flex items-start gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 shadow-md"
                              >
                                {doctor.image ? (
                                  <Image
                                    src={doctor.image}
                                    alt={doctor.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-2xl">
                                    {doctor.name.charAt(0)}
                                  </div>
                                )}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 flex-wrap">
                                  <h3
                                    className="text-2xl font-bold text-gray-900 truncate"
                                    style={{
                                      fontFamily:
                                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                    }}
                                  >
                                    {doctor.name}
                                  </h3>
                                </div>
                                <p
                                  className="text-base text-gray-600 mt-1"
                                  style={{
                                    fontFamily:
                                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                  }}
                                >
                                  {[

                                    doctor.qualification,
                                    doctor.department
                                  ].filter(Boolean).join(", ")}
                                </p>

                                {doctor.rating !== undefined && doctor.rating > 0 && (
                                  <div className="flex items-center gap-1 mt-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span
                                      className="text-base font-semibold text-gray-700"
                                      style={{
                                        fontFamily:
                                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                      }}
                                    >
                                      {doctor.rating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 text-base border-t border-gray-200 pt-4">
                              {doctor.hospital && (
                                <Link
                                  href={`/hospital/${encodeURIComponent(
                                    doctor.hospital
                                  )}`}
                                >
                                  <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors cursor-pointer group"
                                  >
                                    <Building2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span
                                      className="underline font-semibold text-base"
                                      style={{
                                        fontFamily:
                                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                      }}
                                    >
                                      {doctor.hospital}
                                    </span>
                                  </motion.div>
                                </Link>
                              )}
                              {(doctor.division || doctor.district || doctor.thana) && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="h-5 w-5 text-primary" />
                                  <span
                                    className="text-sm"
                                    style={{
                                      fontFamily:
                                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                    }}
                                  >
                                    {[doctor.division, doctor.district, doctor.thana]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </span>
                                </div>
                              )}


                              {doctor.rating !== undefined && doctor.rating > 0 && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                  <span
                                    className="text-base"
                                    style={{
                                      fontFamily:
                                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                    }}
                                  >
                                    <span className="font-bold text-gray-900">
                                      {doctor.rating.toFixed(1)}
                                    </span>{" "}
                                    রেটিং
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-gray-700">
                                <svg
                                  className="h-5 w-5 text-primary"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <text
                                    x="12"
                                    y="18"
                                    fontSize="16"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    fill="currentColor"
                                    style={{
                                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                    }}
                                  >
                                    ৳
                                  </text>
                                </svg>
                                <span
                                  className="text-base"
                                  style={{
                                    fontFamily:
                                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                  }}
                                >
                                  নতুন রোগীর ফি: <span className="font-bold text-gray-900 text-xl">
                                    {doctor.newPatientFee || doctor.consultationFee}
                                  </span>
                                </span>
                              </div>
                              {doctor.availability && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <Clock className="h-5 w-5 text-primary" />
                                  <span
                                    className="text-sm"
                                    style={{
                                      fontFamily:
                                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                    }}
                                  >
                                    {banglaLabels.availability}: {formatAvailability(doctor.availability)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 border-t border-gray-200 pt-4">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
                                  variant="default"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/doctor/${doctor._id}`;
                                  }}
                                  style={{
                                    fontFamily:
                                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                  }}
                                >
                                  {banglaLabels.bookAppointment}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Recommended Hospitals */}
          {recommendedHospitals.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full lg:w-80 shrink-0"
            >
              <Card className="p-6 bg-gradient-to-br from-white via-primary/5 to-white border-2 border-primary/20 shadow-xl sticky top-32">
                <h3
                  className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"

                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  Nearby Hospitals
                </h3>
                <div className="space-y-4">
                  {recommendedHospitals.map((recHospital, index) => (
                    <motion.div
                      key={recHospital._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Link href={`/hospital/${encodeURIComponent(recHospital.name)}`}>
                        <Card className="p-4 bg-white border-2 border-gray-200 hover:border-primary/50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className="text-lg font-bold text-gray-900 mb-1 line-clamp-2"
                                style={{
                                  fontFamily:
                                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                }}
                              >
                                {recHospital.name}
                              </h4>
                              {getHospitalLocationString(recHospital) && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                                  <span
                                    className="line-clamp-1"
                                    style={{
                                      fontFamily:
                                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                    }}
                                  >
                                    {getHospitalLocationString(recHospital)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
