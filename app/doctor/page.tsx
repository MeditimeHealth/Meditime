"use client";

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
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
  findDoctor: "Top Doctors in Savar and Surroundings",
  searchPlaceholder:
    "Search by name, specialty, hospital, qualification or bio...",
  findByLocation: "Find The Best Doctor Near You",
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
  availability: "সময়সূচী",
  loading: "ডাক্তার লোড হচ্ছে...",
  specialtyFilter: "বিশেষতা",
  hospitalFilter: "হাসপাতাল",
  qualificationFilter: "যোগ্যতা",
  allSpecialties: "সব বিশেষতা",
  allQualifications: "সব যোগ্যতা",
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
  designation?: string;

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
        time: string;
      }>
    | {
        days: string[];
        time: string;
      };

  bio?: string;
  image?: string;
  rating?: number;
}

type SortOption =
  | "name"
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
    return num
      .toString()
      .split("")
      .map((digit) => bengaliDigits[parseInt(digit)])
      .join("");
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
  const formatAvailability = (
    availability:
      | Array<{ days: string[]; time: string }>
      | { days: string[]; time: string },
  ): string => {
    // Handle backward compatibility - convert old format to array
    const slots = Array.isArray(availability) ? availability : [availability];

    return slots
      .map((slot) => {
        const sortedDays = slot.days.sort((a, b) => {
          return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
        });

        let timeRange = "";
        if (sortedDays.length === 1) {
          const day = getBengaliDay(sortedDays[0]);
          const time = slot.time || "";
          timeRange = `${day} ${time}`;
        } else {
          const firstDay = getBengaliDay(sortedDays[0]);
          const lastDay = getBengaliDay(sortedDays[sortedDays.length - 1]);
          const time = slot.time || "";
          timeRange = `${firstDay} থেকে ${lastDay} ${time}`;
        }
        return timeRange;
      })
      .join("। ");
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
          `/api/locations/districts?division=${division._id}`,
        );
        const data = await response.json();
        if (response.ok) {
          setDistricts(data.districts);
        }
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    },
    [divisions],
  );

  const fetchThanas = useCallback(
    async (districtName: string) => {
      try {
        const district = districts.find((d) => d.name === districtName);
        if (!district) return;

        const response = await fetch(
          `/api/locations/thanas?district=${district._id}`,
        );
        const data = await response.json();
        if (response.ok) {
          setThanas(data.thanas);
        }
      } catch (error) {
        console.error("Error fetching thanas:", error);
      }
    },
    [districts],
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
      new Set(doctors.map((d) => d.specialty).filter(Boolean)),
    );
    return unique.sort();
  }, [doctors]);

  const hospitalNames = useMemo(() => {
    const fromDoctors = Array.from(
      new Set(doctors.map((d) => d.hospital).filter(Boolean)),
    );
    const fromHospitals = hospitals.map((h) => h.name);
    return Array.from(new Set([...fromDoctors, ...fromHospitals])).sort();
  }, [doctors, hospitals]);

  const qualifications = useMemo(() => {
    const unique = Array.from(
      new Set(doctors.map((d) => d.qualification).filter(Boolean)),
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
          doctor.hospital?.toLowerCase().includes(query),
      )
      .slice(0, 5);

    matchingDoctors.forEach((doctor) => {
      if (doctor.name.toLowerCase().includes(query)) {
        results.push({ type: "Doctor", value: doctor.name, doctor });
      }
      if (
        doctor.specialty.toLowerCase().includes(query) &&
        !results.some(
          (r) => r.type === "Specialty" && r.value === doctor.specialty,
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
          doctor.bio?.toLowerCase().includes(query),
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(
        (doctor) => doctor.specialty === selectedSpecialty,
      );
    }

    // Hospital filter
    if (selectedHospital) {
      filtered = filtered.filter(
        (doctor) => doctor.hospital === selectedHospital,
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(
        (doctor) => doctor.department === selectedDepartment,
      );
    }

    // Qualification filter
    if (selectedQualification) {
      filtered = filtered.filter(
        (doctor) => doctor.qualification === selectedQualification,
      );
    }

    // Fee filter
    if (minFee) {
      filtered = filtered.filter(
        (doctor) => doctor.consultationFee >= parseFloat(minFee),
      );
    }
    if (maxFee) {
      filtered = filtered.filter(
        (doctor) => doctor.consultationFee <= parseFloat(maxFee),
      );
    }

    // Rating filter
    if (minRating) {
      filtered = filtered.filter(
        (doctor) => (doctor.rating || 0) >= parseFloat(minRating),
      );
    }

    // Availability days filter
    if (selectedDays.length > 0) {
      filtered = filtered.filter((doctor) => {
        // Handle backward compatibility - convert old format to array
        const slots = Array.isArray(doctor.availability)
          ? doctor.availability
          : [doctor.availability];
        return slots.some((slot) =>
          selectedDays.some((day) => slot.days.includes(day)),
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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
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
      minFee ||
      maxFee ||
      minRating ||
      selectedDays.length > 0
    );
  }, [
    selectedSpecialty,
    selectedHospital,
    selectedQualification,

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
        className="relative mt-20 h-[450px] md:h-[550px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a365d]/90 via-[#2C5282]/80 to-primary/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=1920&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                {banglaLabels.findDoctor}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 font-light">
                Connect with the best healthcare professionals in your area for
                expert medical advice and treatment.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-32 relative z-30">
        {/* Search Section - Floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="relative max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative relative bg-white rounded-2xl shadow-xl flex items-center p-2">
                <Search className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 md:h-6 md:w-6 z-10" />
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
                        prev < suggestions.length - 1 ? prev + 1 : prev,
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
                  className="w-full pl-12 md:pl-14 pr-4 py-2.5 md:py-7 text-sm md:text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                />
                <Button className="hidden md:flex bg-primary hover:bg-primary-dark text-white items-center gap-2 rounded-xl px-8 py-6 text-lg font-medium transition-all shadow-lg hover:shadow-primary/30">
                  <Search className="h-5 w-5" />
                  Search
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto overflow-hidden divide-y divide-gray-50"
                >
                  {suggestions.map((suggestion, index) => {
                    const content = (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          index === focusedIndex ? "bg-gray-50" : ""
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
                              className="font-bold text-gray-800 text-base"
                              style={{
                                fontFamily:
                                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                              }}
                            >
                              {suggestion.value}
                            </div>
                            {suggestion.doctor && (
                              <div
                                className="text-sm text-gray-500 mt-1 flex items-center gap-2"
                                style={{
                                  fontFamily:
                                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                                }}
                              >
                                <span className="text-primary font-medium">
                                  {suggestion.doctor.specialty}
                                </span>
                                {suggestion.doctor.hospital && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{suggestion.doctor.hospital}</span>
                                  </>
                                )}
                              </div>
                            )}
                            {suggestion.hospital && (
                              <div
                                className="text-sm text-gray-500 mt-1 font-medium text-primary"
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
                            className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                              suggestion.type === "Doctor"
                                ? "bg-blue-100 text-blue-700"
                                : suggestion.type === "Specialty"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                            style={{
                              fontFamily:
                                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {suggestion.type}
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
        </motion.div>

        {/* Department Carousel Section */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
            <div className="mb-6 md:mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Search Doctor By Department
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Explore specialists by department</p>
              </div>
              <Link href="/departments" className="hidden md:flex text-primary font-medium hover:underline items-center gap-1 whitespace-nowrap shrink-0 mb-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative px-4">
              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                  nextEl: ".department-next",
                  prevEl: ".department-prev",
                }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 3,
                  },
                  768: {
                    slidesPerView: 4,
                  },
                  1024: {
                    slidesPerView: 5,
                  },
                }}
                loop={departments.length > 5}
                className="pb-4"
              >
                {departments.map((dept, index) => (
                  <SwiperSlide key={dept._id || dept.name}>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDepartment(dept.name);
                        setSelectedDept(dept.name);
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-lg w-full h-[180px] transition-all duration-300 ${
                        selectedDept === dept.name
                          ? "bg-primary-dark text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      {/* Circular Icon Container */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0 ${
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
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Navigation Buttons */}
               <button className="department-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-primary hover:bg-primary hover:text-white transition-colors border border-gray-100 disabled:opacity-50">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="department-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 text-primary hover:bg-primary hover:text-white transition-colors border border-gray-100 disabled:opacity-50">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            {/* View All Button - Mobile Only */}
            <div className="mt-6 flex justify-center md:hidden">
              <Link href="/departments" className="text-primary font-medium hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-8 border-b border-gray-100 pb-4">
              <h2
                className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                {banglaLabels.findByLocation}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="relative">
                <select
                  id="filter-division"
                  value={selectedDivision}
                  onChange={(e) => handleDivisionSelect(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
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
                <div className="relative">
                <select
                  id="filter-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  disabled={!selectedDivision}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
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
                <div className="relative">
                <select
                  id="filter-thana"
                  value={selectedThana}
                  onChange={(e) => handleThanaSelect(e.target.value)}
                  disabled={!selectedDistrict || !selectedDivision}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
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
                <div className="relative">
                <select
                  id="filter-hospital-hierarchical"
                  value={selectedHospital}
                  onChange={(e) => handleHospitalSelect(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
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
                <div className="relative">
                <select
                  id="filter-department-hierarchical"
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentSelect(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-700 bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer"
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </div>
              </div>
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
          </div>
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
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="mb-6 pb-4 border-b border-gray-100">
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
              </div>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                <Link href={`/doctor/${doctor._id}`} className="h-full block group">
                  <Card className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer overflow-hidden group-hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-4">
                        {/* Doctor Image */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 shadow-inner shrink-0 group-hover:ring-2 ring-primary/20 transition-all">
                          {doctor.image ? (
                            <Image
                              src={doctor.image}
                              alt={doctor.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <Stethoscope className="w-6 h-6 text-blue-400" />
                            </div>
                          )}
                        </div>

                        {/* Name & Specialty - Beside Photo */}
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors"
                            style={{
                              fontFamily:
                                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {doctor.name}
                          </h3>
                          {/* Specialty - Under Name */}
                          <p className="text-primary font-medium text-sm mt-1">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>

                      {/* Info Stack - Below Photo */}
                      <div className="flex-1 space-y-2">

                        {/* 3. Qualification (Degree) */}
                        <p
                          className="text-sm text-gray-600 leading-snug"
                          style={{
                            fontFamily:
                              "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {doctor.qualification}
                        </p>
<br/>
                        {/* 4. Designation */}
                        {doctor.designation && (
                          <p className="text-sm text-gray-500">
                            {doctor.designation}
                          </p>
                        )}

                        {/* 5. Hospital */}
                        {doctor.hospital && (
                          <p className="text-sm text-gray-700 font-medium">
                            {doctor.hospital}
                          </p>
                        )}

                        {/* 6. Chamber Time */}
                        {doctor.availability && (
                          <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                            <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                              {formatAvailability(doctor.availability)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* <div className="mt-5 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1 text-green-700 font-bold text-sm rounded-lg">
                            <span>৳</span>
                            <span>{doctor.consultationFee}</span>
                          </div>
                          {doctor.rating ? (
                             <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{doctor.rating}</span>
                            </div>
                          ) : null}
                        </div>

                        <Button className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-2.5 h-auto font-semibold shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all text-sm">
                          {banglaLabels.bookAppointment}
                        </Button>
                      </div> */}
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

export default function DoctorListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">লোড হচ্ছে...</div>
        </div>
      }
    >
      <DoctorListPageContent />
    </Suspense>
  );
}
