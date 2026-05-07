"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

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
  const { language } = useLanguage();
  const t = homepageTranslations[language].search;
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok) setDoctors(data.doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/locations/hospitals");
      const data = await response.json();
      if (response.ok) setHospitals(data.hospitals);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

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
        !results.some((r) => r.type === "Specialty" && r.value === doctor.specialty)
      ) {
        results.push({ type: "Specialty", value: doctor.specialty });
      }
    });

    const matchingHospitals = hospitals
      .filter((h) => h.name && h.name.toLowerCase().includes(query))
      .slice(0, 3);

    matchingHospitals.forEach((hospital) => {
      if (!results.some((r) => r.type === "Hospital" && r.value === hospital.name)) {
        results.push({
          type: "Hospital",
          value: hospital.name,
          hospital,
          link: `/hospital/${encodeURIComponent(hospital.name)}`,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, doctors, hospitals]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/doctor?search=${encodeURIComponent(searchQuery.trim())}`);
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
      router.push(`/doctor?search=${encodeURIComponent(suggestion.value)}`);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div
        id="search-section"
        className="sticky top-20 left-0 right-0 z-40 transition-all duration-300 mt-4 mb-4 md:mb-6"
      >
        <div className="relative">
          {/* Pill container — matches Figma exactly */}
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-md px-3 sm:px-5 py-2 gap-2 sm:gap-3 focus-within:border-primary focus-within:shadow-lg transition-all">
            <Search className="text-gray-400 h-5 w-5 shrink-0" />
            <Input
              type="text"
              placeholder={t.placeholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setFocusedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setFocusedIndex((prev) => prev < suggestions.length - 1 ? prev + 1 : prev);
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
              className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-base text-gray-700 placeholder:text-gray-400 bg-transparent"

            />
            {/* Teal embedded button */}
            <button
              onClick={handleSearch}
              className="shrink-0 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all whitespace-nowrap shadow-sm"

            >
              {t.button}
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto transition-all duration-200">
              {suggestions.map((suggestion, index) => {
                const content = (
                  <div
                    className={`px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 ${index === focusedIndex ? "bg-primary/10" : ""
                      }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div
                          className="font-semibold text-gray-900 text-base"

                        >
                          {suggestion.value}
                        </div>
                        {suggestion.doctor && (
                          <div
                            className="text-sm text-gray-500 mt-1"

                          >
                            {suggestion.doctor.specialty}
                            {suggestion.doctor.hospital && ` • ${suggestion.doctor.hospital}`}
                          </div>
                        )}
                        {suggestion.hospital && (
                          <div
                            className="text-sm text-gray-500 mt-1"

                          >
                            {t.hospitalSubtitle}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-semibold"

                      >
                        {suggestion.type === "Doctor"
                          ? t.doctorTag
                          : suggestion.type === "Specialty"
                            ? t.specialtyTag
                            : suggestion.type === "Hospital"
                              ? t.hospitalTag
                              : suggestion.type}
                      </span>
                    </div>
                  </div>
                );

                return suggestion.link ? (
                  <Link key={`${suggestion.type}-${index}`} href={suggestion.link}>
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