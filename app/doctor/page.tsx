"use client";

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Search,
  X,
  Star,
  Clock,
  Building2,
  MapPin,
  Award,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

const banglaLabels = {
  findDoctor: "আপনার ডাক্তার খুঁজুন",
  searchPlaceholder: "নাম, বিশেষতা, হাসপাতাল, যোগ্যতা বা বায়ো দিয়ে খুঁজুন...",
  findByLocation: "অবস্থান দিয়ে ডাক্তার খুঁজুন",
  division: "বিভাগ",
  district: "জেলা",
  thana: "থানা/উপজেলা",
  hospital: "হাসপাতাল",
  department: "ডিপার্টমেন্ট",
  selectDivision: "বিভাগ নির্বাচন করুন",
  selectDistrict: "জেলা নির্বাচন করুন",
  selectThana: "থানা/উপজেলা নির্বাচন করুন",
  selectDivisionFirst: "প্রথমে বিভাগ নির্বাচন করুন",
  selectDistrictFirst: "প্রথমে জেলা নির্বাচন করুন",
  allHospitals: "সব হাসপাতাল",
  allDepartments: "সব ডিপার্টমেন্ট",
  reset: "রিসেট",
  showFilters: "ফিল্টার দেখুন",
  hideFilters: "ফিল্টার লুকান",
  active: "সক্রিয়",
  clearFilters: "ফিল্টার সাফ করুন",
  sortBy: "সাজান",
  name: "নাম",
  experience: "অভিজ্ঞতা",
  consultationFee: "কনসালটেশন ফি",
  rating: "রেটিং",
  specialty: "বিশেষতা",
  found: "খুঁজে পাওয়া গেছে",
  doctors: "জন ডাক্তার",
  matching: "ম্যাচিং",
  showing: "দেখানো হচ্ছে",
  of: "এর মধ্যে",
  totalDoctors: "জন ডাক্তার",
  noDoctors: "আপনার শর্ত অনুযায়ী কোন ডাক্তার পাওয়া যায়নি",
  clearSearch: "সার্চ সাফ করুন",
  bookAppointment: "বুক অ্যাপয়েন্টমেন্ট",
  bookNow: "এখনই বুক করুন",
  experienceLabel: "অভিজ্ঞতা",
  years: "বছর",
  availability: "চেম্বার সময়সূচী",
  loading: "ডাক্তার লোড হচ্ছে...",
  specialtyFilter: "বিশেষতা",
  hospitalFilter: "হাসপাতাল",
  qualificationFilter: "যোগ্যতা",
  allSpecialties: "সব বিশেষতা",
  allQualifications: "সব যোগ্যতা",
  experienceYears: "অভিজ্ঞতা (বছর)",
  min: "ন্যূনতম",
  max: "সর্বোচ্চ",
  minimumRating: "ন্যূনতম রেটিং",
  anyRating: "যেকোনো রেটিং",
  availableDays: "উপলব্ধ দিন",
  matched: "ম্যাচ",
};

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;
  currentPosition?: string;
  experience: number;
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
  chamber?: string;
  bio?: string;
  image?: string;
  rating?: number;
}

type SortOption =
  | "name"
  | "experience"
  | "consultationFee"
  | "rating"
  | "specialty"
  | "hospital";
type SortDirection = "asc" | "desc";

interface Division {
  _id: string;
  name: string;
}

interface District {
  _id: string;
  name: string;
  division: Division;
}

interface Thana {
  _id: string;
  name: string;
  district: District;
}

interface Hospital {
  _id: string;
  name: string;
  thana?: Thana;
}

function DoctorListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [thanas, setThanas] = useState<Thana[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedQualification, setSelectedQualification] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [minRating, setMinRating] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Hierarchical location filters
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("");

  // Sort states
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null);

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
    return num.toString().split("").map(digit => bengaliDigits[parseInt(digit)]).join("");
  };

  // Convert time to Bengali format (e.g., "10:00" -> "১০টা")
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

  // Format availability in Bengali (e.g., "শনিবার থেকে শুক্রবার ১০টা থেকে ১২টা")
  const formatAvailability = (availability: Array<{ days: string[]; startTime: string; endTime: string; chamber?: string }> | { days: string[]; startTime: string; endTime: string; chamber?: string }): string => {
    // Handle backward compatibility - convert old format to array
    const slots = Array.isArray(availability) ? availability : [availability];
    
    return slots.map(slot => {
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
      
      // Add chamber info if available
      if (slot.chamber) {
        return `${timeRange} (চেম্বার: ${slot.chamber})`;
      }
      return timeRange;
    }).join("। ");
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/locations/hospitals");
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await fetch("/api/locations/divisions");
      const data = await response.json();
      if (response.ok) {
        setDivisions(data.divisions);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchDistricts = useCallback(
    async (divisionName: string) => {
      try {
        const division = divisions.find((d) => d.name === divisionName);
        if (!division) return;

        const response = await fetch(
          `/api/locations/districts?division=${division._id}`
        );
        const data = await response.json();
        if (response.ok) {
          setDistricts(data.districts);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    },
    [divisions]
  );

  const fetchThanas = useCallback(
    async (districtName: string) => {
      try {
        const district = districts.find((d) => d.name === districtName);
        if (!district) return;

        const response = await fetch(
          `/api/locations/thanas?district=${district._id}`
        );
        const data = await response.json();
        if (response.ok) {
          setThanas(data.thanas);
        }
      } catch (error) {
        console.error("Error fetching thanas:", error);
      }
    },
    [districts]
  );

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
    fetchDivisions();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDivision && divisions.length > 0) {
      fetchDistricts(selectedDivision);
    } else {
      setDistricts([]);
      setThanas([]);
    }
  }, [selectedDivision, divisions, fetchDistricts]);

  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      fetchThanas(selectedDistrict);
    } else {
      setThanas([]);
    }
  }, [selectedDistrict, districts, fetchThanas]);

  // Read search query from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(decodeURIComponent(search));
    }
  }, [searchParams]);

  // Get unique values for filters
  const specialties = useMemo(() => {
    const unique = Array.from(
      new Set(doctors.map((d) => d.specialty).filter(Boolean))
    );
    return unique.sort();
  }, [doctors]);

  const hospitalNames = useMemo(() => {
    const fromDoctors = Array.from(
      new Set(doctors.map((d) => d.hospital).filter(Boolean))
    );
    const fromHospitals = hospitals.map((h) => h.name);
    return Array.from(new Set([...fromDoctors, ...fromHospitals])).sort();
  }, [doctors, hospitals]);

  const qualifications = useMemo(() => {
    const unique = Array.from(
      new Set(doctors.map((d) => d.qualification).filter(Boolean))
    );
    return unique.sort();
  }, [doctors]);

  const departmentNames = useMemo(() => {
    return departments.map((d) => d.name);
  }, [departments]);

  // Auto-suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];

    const query = searchQuery.toLowerCase();
    const results: Array<{
      type: string;
      value: string;
      doctor?: Doctor;
      hospital?: Hospital;
      link?: string;
    }> = [];

    // Get matching doctors (limited to 5 for suggestions)
    const matchingDoctors = doctors
      .filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.hospital?.toLowerCase().includes(query)
      )
      .slice(0, 5);

    matchingDoctors.forEach((doctor) => {
      if (doctor.name.toLowerCase().includes(query)) {
        results.push({ type: "Doctor", value: doctor.name, doctor });
      }
      if (
        doctor.specialty.toLowerCase().includes(query) &&
        !results.some(
          (r) => r.type === "Specialty" && r.value === doctor.specialty
        )
      ) {
        results.push({ type: "Specialty", value: doctor.specialty });
      }
    });

    // Get matching hospitals
    const matchingHospitals = hospitals
      .filter((h) => h.name.toLowerCase().includes(query))
      .slice(0, 3);

    matchingHospitals.forEach((hospital) => {
      if (
        !results.some((r) => r.type === "Hospital" && r.value === hospital.name)
      ) {
        results.push({
          type: "Hospital",
          value: hospital.name,
          hospital,
          link: `/hospital/${encodeURIComponent(hospital.name)}`,
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, doctors, hospitals]);

  // Filter and sort doctors
  const filteredAndSortedDoctors = useMemo(() => {
    let filtered = [...doctors];

    // Search filter (searches across name, specialty, hospital, qualification, bio)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.hospital?.toLowerCase().includes(query) ||
          doctor.qualification.toLowerCase().includes(query) ||
          doctor.bio?.toLowerCase().includes(query)
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(
        (doctor) => doctor.specialty === selectedSpecialty
      );
    }

    // Hospital filter
    if (selectedHospital) {
      filtered = filtered.filter(
        (doctor) => doctor.hospital === selectedHospital
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(
        (doctor) => doctor.department === selectedDepartment
      );
    }

    // Qualification filter
    if (selectedQualification) {
      filtered = filtered.filter(
        (doctor) => doctor.qualification === selectedQualification
      );
    }

    // Experience filter
    if (minExperience) {
      filtered = filtered.filter(
        (doctor) => doctor.experience >= parseInt(minExperience)
      );
    }
    if (maxExperience) {
      filtered = filtered.filter(
        (doctor) => doctor.experience <= parseInt(maxExperience)
      );
    }

    // Fee filter
    if (minFee) {
      filtered = filtered.filter(
        (doctor) => doctor.consultationFee >= parseFloat(minFee)
      );
    }
    if (maxFee) {
      filtered = filtered.filter(
        (doctor) => doctor.consultationFee <= parseFloat(maxFee)
      );
    }

    // Rating filter
    if (minRating) {
      filtered = filtered.filter(
        (doctor) => (doctor.rating || 0) >= parseFloat(minRating)
      );
    }

    // Availability days filter
    if (selectedDays.length > 0) {
      filtered = filtered.filter((doctor) => {
        // Handle backward compatibility - convert old format to array
        const slots = Array.isArray(doctor.availability) ? doctor.availability : [doctor.availability];
        return slots.some((slot) =>
          selectedDays.some((day) => slot.days.includes(day))
        );
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "experience":
          aVal = a.experience;
          bVal = b.experience;
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
        case "hospital":
          aVal = (a.hospital || "").toLowerCase();
          bVal = (b.hospital || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    doctors,
    searchQuery,
    selectedSpecialty,
    selectedHospital,
    selectedQualification,
    minExperience,
    maxExperience,
    minFee,
    maxFee,
    minRating,
    selectedDays,
    selectedDepartment,
    sortBy,
    sortDirection,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setSelectedHospital("");
    setSelectedQualification("");
    setMinExperience("");
    setMaxExperience("");
    setMinFee("");
    setMaxFee("");
    setMinRating("");
    setSelectedDays([]);
    setSelectedDivision("");
    setSelectedDistrict("");
    setSelectedThana("");
    setSelectedDepartment("");
  };

  // Handle hierarchical selection flow
  const handleDivisionSelect = (division: string) => {
    setSelectedDivision(division);
    setSelectedDistrict("");
    setSelectedThana("");
    setSelectedHospital("");
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setSelectedThana("");
    setSelectedHospital("");
  };

  const handleThanaSelect = (thana: string) => {
    setSelectedThana(thana);
    setSelectedHospital("");
  };

  const handleHospitalSelect = (hospital: string) => {
    setSelectedHospital(hospital);
  };

  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartment(department);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Get matched fields for search highlighting
  const getMatchedFields = (doctor: Doctor): string[] => {
    if (!searchQuery) return [];

    const query = searchQuery.toLowerCase();
    const matched: string[] = [];

    if (doctor.name.toLowerCase().includes(query)) {
      matched.push("Doctor Name");
    }
    if (doctor.specialty.toLowerCase().includes(query)) {
      matched.push("Specialty");
    }
    if (doctor.hospital?.toLowerCase().includes(query)) {
      matched.push("Hospital");
    }
    if (doctor.qualification.toLowerCase().includes(query)) {
      matched.push("Qualification");
    }
    if (doctor.bio?.toLowerCase().includes(query)) {
      matched.push("Bio");
    }

    return matched;
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedSpecialty ||
      selectedHospital ||
      selectedQualification ||
      minExperience ||
      maxExperience ||
      minFee ||
      maxFee ||
      minRating ||
      selectedDays.length > 0
    );
  }, [
    selectedSpecialty,
    selectedHospital,
    selectedQualification,
    minExperience,
    maxExperience,
    minFee,
    maxFee,
    minRating,
    selectedDays,
  ]);

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

      {/* Cover Photo / Hero Section */}
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
                {banglaLabels.findDoctor}
              </h1>
              <p
                className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                আমাদের বিশেষজ্ঞ চিকিৎসা পেশাদারদের মধ্যে খুঁজুন এবং ফিল্টার করুন
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <span
                  className="text-white/90 text-lg font-semibold"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  বিশ্বস্ত চিকিৎসা সেবা
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-20 relative z-30">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Card className="p-6 md:p-8 bg-white border-2 border-primary/10 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-5 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
                <Stethoscope className="h-12 w-12 text-white" />
              </div>
              <div className="flex-1">
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  সব ডাক্তার
                </h2>
                <p
                  className="text-lg text-gray-600 leading-relaxed"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  আমাদের বিশেষজ্ঞ চিকিৎসা পেশাদারদের মধ্যে খুঁজুন এবং ফিল্টার করুন
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <Card className="p-6 bg-white border-2 border-primary/10 shadow-lg">
            <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
            <Input
              type="text"
              placeholder={banglaLabels.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setFocusedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setFocusedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                } else if (e.key === "Enter" && focusedIndex >= 0) {
                  e.preventDefault();
                  const suggestion = suggestions[focusedIndex];
                  if (suggestion.doctor) {
                    setSearchQuery(suggestion.doctor.name);
                  } else {
                    setSearchQuery(suggestion.value);
                  }
                  setShowSuggestions(false);
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              className="pl-14 pr-4 py-6 text-lg border-2 border-gray-300 focus:border-primary rounded-xl shadow-lg focus:shadow-xl transition-all"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            />

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => {
                    const content = (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 ${
                          index === focusedIndex ? "bg-primary/10" : ""
                        }`}
                        onClick={() => {
                          if (suggestion.link) {
                            router.push(suggestion.link);
                            setShowSuggestions(false);
                          } else if (suggestion.doctor) {
                            setSearchQuery(suggestion.doctor.name);
                            setShowSuggestions(false);
                          } else {
                            setSearchQuery(suggestion.value);
                            setShowSuggestions(false);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div
                              className="font-semibold text-gray-900 text-base"
                              style={{
                                fontFamily:
                                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {suggestion.value}
                            </div>
                            {suggestion.doctor && (
                              <div
                                className="text-sm text-gray-500 mt-1"
                                style={{
                                  fontFamily:
                                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                }}
                              >
                                {suggestion.doctor.specialty}
                                {suggestion.doctor.hospital &&
                                  ` • ${suggestion.doctor.hospital}`}
                              </div>
                            )}
                            {suggestion.hospital && (
                              <div
                                className="text-sm text-gray-500 mt-1"
                                style={{
                                  fontFamily:
                                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                }}
                              >
                                এই হাসপাতালের ডাক্তার দেখতে ক্লিক করুন
                              </div>
                            )}
                          </div>
                          <span
                            className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-semibold"
                            style={{
                              fontFamily:
                                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {suggestion.type === "Doctor"
                              ? "ডাক্তার"
                              : suggestion.type === "Specialty"
                              ? "বিশেষতা"
                              : suggestion.type === "Hospital"
                              ? "হাসপাতাল"
                              : suggestion.type}
                          </span>
                        </div>
                      </motion.div>
                    );

                    return suggestion.link ? (
                      <Link
                        key={`${suggestion.type}-${index}`}
                        href={suggestion.link}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={`${suggestion.type}-${index}`}>{content}</div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Department Carousel Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <Card className="p-6 md:p-8 bg-white border-2 border-primary/10 shadow-lg">
            <div className="mb-6 pb-4 border-b-2 border-gray-100">
              <h2
                className="text-2xl md:text-3xl font-bold text-gray-900 text-center"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                বিভাগ অনুযায়ী ডাক্তার খুঁজুন
              </h2>
            </div>
            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({
                      left: -200,
                      behavior: "smooth",
                    });
                  }
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md border border-gray-200 hover:border-primary/50 transition-all"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollBy({
                      left: 200,
                      behavior: "smooth",
                    });
                  }
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md border border-gray-200 hover:border-primary/50 transition-all"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>

              <div
                ref={carouselRef}
                className="overflow-x-auto scrollbar-hide pb-4 px-10"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex gap-3 min-w-max">
                  {departments.length > 0 ? (
                    departments.map((dept, index) => {
                      return (
                        <motion.button
                          key={dept._id || dept.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedDepartment(dept.name);
                            setSelectedDept(dept.name);
                          }}
                          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-lg min-w-[140px] transition-all duration-300 ${
                            selectedDept === dept.name
                              ? "bg-primary-dark text-white shadow-md"
                              : "bg-white text-gray-700 border border-gray-200"
                          }`}
                        >
                          {/* Circular Icon Container */}
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${
                              selectedDept === dept.name
                                ? "bg-white/20"
                                : "bg-gray-100"
                            }`}
                          >
                            {dept.image ? (
                              <img
                                src={dept.image}
                                alt={dept.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Stethoscope className="w-7 h-7 text-gray-600" />
                            )}
                          </div>
                          {/* Department Name */}
                          <p
                            className={`font-bold text-sm text-center mt-1 ${
                              selectedDept === dept.name
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {dept.name}
                          </p>
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      No departments available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Location Filters - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-white border-2 border-primary/20 shadow-xl">
            <div className="mb-6">
              <h2
                className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                <div className="p-2 bg-primary/20 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                {banglaLabels.findByLocation}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="filter-division"
                  className="mb-3 block text-base font-semibold text-gray-700"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  ১. {banglaLabels.division}
                </Label>
                <select
                  id="filter-division"
                  value={selectedDivision}
                  onChange={(e) => handleDivisionSelect(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  <option value="">{banglaLabels.selectDivision}</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="filter-district"
                  className="mb-3 block text-base font-semibold text-gray-700"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  ২. {banglaLabels.district}
                </Label>
                <select
                  id="filter-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  disabled={!selectedDivision}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  <option value="">
                    {selectedDivision
                      ? banglaLabels.selectDistrict
                      : banglaLabels.selectDivisionFirst}
                  </option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="filter-thana"
                  className="mb-3 block text-base font-semibold text-gray-700"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  ৩. {banglaLabels.thana}
                </Label>
                <select
                  id="filter-thana"
                  value={selectedThana}
                  onChange={(e) => handleThanaSelect(e.target.value)}
                  disabled={!selectedDistrict || !selectedDivision}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  <option value="">
                    {selectedDivision && selectedDistrict
                      ? banglaLabels.selectThana
                      : banglaLabels.selectDistrictFirst}
                  </option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>
                      {thana.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="filter-hospital-hierarchical"
                  className="mb-3 block text-base font-semibold text-gray-700"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  ৪. {banglaLabels.hospital}
                </Label>
                <select
                  id="filter-hospital-hierarchical"
                  value={selectedHospital}
                  onChange={(e) => handleHospitalSelect(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  <option value="">{banglaLabels.allHospitals}</option>
                  {hospitalNames.map((hosp) => (
                    <option key={hosp} value={hosp}>
                      {hosp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label
                  htmlFor="filter-department-hierarchical"
                  className="mb-3 block text-base font-semibold text-gray-700"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  ৫. {banglaLabels.department}
                </Label>
                <select
                  id="filter-department-hierarchical"
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentSelect(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  <option value="">{banglaLabels.allDepartments}</option>
                  {departmentNames.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedDivision ||
              selectedDistrict ||
              selectedThana ||
              selectedDepartment) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex justify-end"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDivision("");
                    setSelectedDistrict("");
                    setSelectedThana("");
                    setSelectedDepartment("");
                    setSelectedHospital("");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  <X className="h-5 w-5" />
                  {banglaLabels.reset}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Filter & Sort Controls Section */}
      

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 border-2 border-primary/20 shadow-xl">
                <div className="mb-6 pb-4 border-b-2 border-gray-200">
                  <h3
                    className="text-xl md:text-2xl font-bold text-gray-900"
                    style={{
                      fontFamily:
                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ফিল্টার করুন
                  </h3>
                  <p
                    className="text-sm text-gray-600 mt-1"
                    style={{
                      fontFamily:
                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    আপনার প্রয়োজন অনুযায়ী ডাক্তার খুঁজুন
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Specialty Filter */}
                  <div>
                    <Label
                      htmlFor="specialty"
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.specialtyFilter}
                    </Label>
                    <select
                      id="specialty"
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      <option value="">{banglaLabels.allSpecialties}</option>
                      {specialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hospital Filter */}
                  <div>
                    <Label
                      htmlFor="hospital"
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.hospitalFilter}
                    </Label>
                    <select
                      id="hospital"
                      value={selectedHospital}
                      onChange={(e) => setSelectedHospital(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      <option value="">{banglaLabels.allHospitals}</option>
                      {hospitalNames.map((hosp) => (
                        <option key={hosp} value={hosp}>
                          {hosp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Qualification Filter */}
                  <div>
                    <Label
                      htmlFor="qualification"
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.qualificationFilter}
                    </Label>
                    <select
                      id="qualification"
                      value={selectedQualification}
                      onChange={(e) => setSelectedQualification(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      <option value="">{banglaLabels.allQualifications}</option>
                      {qualifications.map((qual) => (
                        <option key={qual} value={qual}>
                          {qual}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Range */}
                  <div>
                    <Label
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.experienceYears}
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder={banglaLabels.min}
                        value={minExperience}
                        onChange={(e) => setMinExperience(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                        style={{
                          fontFamily:
                            "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      />
                      <Input
                        type="number"
                        placeholder={banglaLabels.max}
                        value={maxExperience}
                        onChange={(e) => setMaxExperience(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                        style={{
                          fontFamily:
                            "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      />
                    </div>
                  </div>

                  {/* Fee Range */}
                  <div>
                    <Label
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.consultationFee}
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder={`${banglaLabels.min} ৳`}
                        value={minFee}
                        onChange={(e) => setMinFee(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                        style={{
                          fontFamily:
                            "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      />
                      <Input
                        type="number"
                        placeholder={`${banglaLabels.max} ৳`}
                        value={maxFee}
                        onChange={(e) => setMaxFee(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                        style={{
                          fontFamily:
                            "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <Label
                      htmlFor="rating"
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.minimumRating}
                    </Label>
                    <select
                      id="rating"
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      <option value="">{banglaLabels.anyRating}</option>
                      <option value="4">৪+ ⭐</option>
                      <option value="3">৩+ ⭐</option>
                      <option value="2">২+ ⭐</option>
                      <option value="1">১+ ⭐</option>
                    </select>
                  </div>

                  {/* Availability Days */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label
                      className="mb-3 block text-base font-semibold text-gray-700"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {banglaLabels.availableDays}
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {daysOfWeek.map((day, index) => (
                        <motion.button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg ${
                            selectedDays.includes(day)
                              ? "bg-gradient-to-r from-primary to-primary-dark text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300"
                          }`}
                          style={{
                            fontFamily:
                              "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {banglaDays[index]}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card className="p-5 bg-white border-2 border-primary/10 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div
                className="text-base font-semibold text-gray-700"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {searchQuery ? (
                  <span>
                    {banglaLabels.found}{" "}
                    <span className="text-primary font-bold text-lg">
                      {filteredAndSortedDoctors.length}
                    </span>{" "}
                    {banglaLabels.doctors} {banglaLabels.matching} &quot;
                    {searchQuery}&quot;
                  </span>
                ) : (
                  <span>
                    {banglaLabels.showing}{" "}
                    <span className="text-primary font-bold text-lg">
                      {filteredAndSortedDoctors.length}
                    </span>{" "}
                    {banglaLabels.of}{" "}
                    <span className="text-primary font-bold text-lg">
                      {doctors.length}
                    </span>{" "}
                    {banglaLabels.totalDoctors}
                  </span>
                )}
              </div>
              {searchQuery && filteredAndSortedDoctors.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 shadow-md hover:shadow-lg"
                    style={{
                      fontFamily:
                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    <X className="h-5 w-5" />
                    {banglaLabels.clearSearch}
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Doctor Cards Section */}
        {filteredAndSortedDoctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 shadow-lg">
              <div className="mb-6">
                <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p
                  className="text-xl font-semibold text-gray-600 mb-4"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  {banglaLabels.noDoctors}
                </p>
              </div>
              {hasActiveFilters && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="px-6 py-3 border-2 shadow-md hover:shadow-lg"
                    style={{
                      fontFamily:
                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {banglaLabels.clearFilters}
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {filteredAndSortedDoctors.map((doctor, index) => (
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
                        {[doctor.currentPosition, doctor.qualification].filter(Boolean).join(", ") || "বিশেষজ্ঞ"}
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
    </div>
  );
}

export default function DoctorListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">লোড হচ্ছে...</div>
      </div>
    }>
      <DoctorListPageContent />
    </Suspense>
  );
}
