"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  specialty?: string;
  hospital?: string;
}

interface Hospital {
  _id: string;
  name: string;
}

export default function SearchSection() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Make sticky after scrolling past the hero area (approx 400px)
      setIsSticky(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
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
          (doctor.name && doctor.name.toLowerCase().includes(query)) ||
          (doctor.specialty && doctor.specialty.toLowerCase().includes(query)) ||
          (doctor.hospital && doctor.hospital.toLowerCase().includes(query))
      )
      .slice(0, 5);

    matchingDoctors.forEach((doctor) => {
      if (doctor.name && doctor.name.toLowerCase().includes(query)) {
        results.push({ type: "Doctor", value: doctor.name, doctor });
      }
      if (
        doctor.specialty &&
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
      .filter((h) => h.name && h.name.toLowerCase().includes(query))
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      router.push(`/doctor?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion: {
    type: string;
    value: string;
    doctor?: Doctor;
    hospital?: Hospital;
    link?: string;
  }) => {
    if (suggestion.link) {
      router.push(suggestion.link);
      setShowSuggestions(false);
    } else {
      const query = suggestion.value;
      router.push(`/doctor?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Spacer to prevent layout shift when sticky */}
      {isSticky && <div className="h-24"></div>}

      {/* Search Section */}
      <div
        id="search-section"
        className={`transition-all duration-300 ${
          isSticky
            ? "fixed top-24 left-0 right-0 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-40"
            : "relative mb-16 z-10"
        }`}
      >
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
          <Input
            type="text"
            placeholder="নাম, বিশেষতা, হাসপাতাল, যোগ্যতা বা বায়ো দিয়ে খুঁজুন..."
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
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (focusedIndex >= 0 && suggestions[focusedIndex]) {
                  handleSuggestionClick(suggestions[focusedIndex]);
                } else {
                  handleSearch();
                }
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

          {showSuggestions && suggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto transition-all duration-200"
            >
                {suggestions.map((suggestion, index) => {
                  const content = (
                    <div
                      className={`px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 ${
                        index === focusedIndex ? "bg-primary/10" : ""
                      }`}
                      onClick={() => handleSuggestionClick(suggestion)}
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
                    </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

