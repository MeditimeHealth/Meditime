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
  nameBn?: string;
  slug?: string;
  slugBn?: string;
  specialty?: string;
  specialtyBn?: string;
  department?: string;
  departmentBn?: string;
  hospital?: string;
  hospitalBn?: string;
}

interface Hospital {
  _id: string;
  name: string;
  nameBn?: string;
  slug?: string;
}

export default function SearchSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].search;
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Debounce search query for suggestions (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch suggestions dynamically when search query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 1) {
      setDoctors([]);
      setHospitals([]);
      return;
    }

    const fetchSuggestions = async () => {
      const q = debouncedQuery.trim();
      try {
        const [docsRes, hospRes] = await Promise.all([
          fetch(`/api/doctors?search=${encodeURIComponent(q)}&limit=20`),
          fetch(`/api/locations/hospitals?search=${encodeURIComponent(q)}&limit=20`)
        ]);

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDoctors(docsData.doctors || []);
        }
        if (hospRes.ok) {
          const hospData = await hospRes.json();
          setHospitals(hospData.hospitals || []);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    const query = searchQuery.toLowerCase().trim();

    interface ScoredSuggestion {
      type: string;
      value: string;
      doctor?: Doctor;
      hospital?: Hospital;
      link: string;
      score: number;
    }

    const results: ScoredSuggestion[] = [];

    // 1. Doctor Scoring & Matching
    doctors.forEach((doctor) => {
      const name = (doctor.name || "").toLowerCase();
      const nameBn = (doctor.nameBn || "").toLowerCase();
      const specialty = (doctor.specialty || "").toLowerCase();
      const specialtyBn = (doctor.specialtyBn || "").toLowerCase();
      const dept = (doctor.department || "").toLowerCase(); // Note: department field name check
      const hospital = (doctor.hospital || "").toLowerCase();

      let maxScore = 0;

      // Exact matches get highest priority
      if (name === query || nameBn === query) maxScore = 100;
      else if (name.startsWith(query) || nameBn.startsWith(query)) maxScore = 80;
      else if (name.includes(query) || nameBn.includes(query)){
         maxScore = 80;
      }

      // Specialty matches
      if (specialty.includes(query) || specialtyBn.includes(query)) {
        const specScore = specialty === query ? 50 : 30;
        if (specScore > maxScore) {
          // If the specialty is the primary match, we might want to add the specialty category too
          if (!results.some(r => r.type === "Specialty" && r.value.toLowerCase() === specialty)) {
            results.push({
              type: "Specialty",
              value: language === 'bn' ? (doctor.specialtyBn || "") : (doctor.specialty || ""),
              link: `/doctor?search=${encodeURIComponent(doctor.specialty || "")}`,
              score: specScore + 5 // Slightly higher than individual doctor specialty score
            });
          }
        }
        maxScore = Math.max(maxScore, specScore);
      }

      // Department/Hospital context matches
      if (dept.includes(query) || hospital.includes(query)) {
        maxScore = Math.max(maxScore, 20);
      }

      if (maxScore > 0) {
        results.push({
          type: "Doctor",
          value: language === 'bn' ? (doctor.nameBn || '') : (doctor.name || ''),
          doctor,
          link: `/doctor/${(language === 'bn' ? (doctor.slugBn || doctor.slug) : (doctor.slug || doctor.slugBn)) || doctor._id}`,
          score: maxScore
        });
      }
    });

    // 2. Hospital Scoring & Matching
    hospitals.forEach((hospital) => {
      const name = (hospital.name || "").toLowerCase();
      const nameBn = (hospital.nameBn || "").toLowerCase();

      let hScore = 0;
      if (name === query || nameBn === query) hScore = 95; // Slightly below doctor exact match to keep mixture
      else if (name.startsWith(query) || nameBn.startsWith(query)) hScore = 75;
      else if (name.includes(query) || nameBn.includes(query)) hScore = 55;

      if (hScore > 0) {
        // Avoid duplicate hospital suggestions
        if (!results.some(r => r.type === "Hospital" && r.hospital?._id === hospital._id)) {
          results.push({
            type: "Hospital",
            value: language === 'bn' ? (hospital.nameBn || '') : (hospital.name || ''),
            hospital,
            link: `/hospital/${hospital.slug || encodeURIComponent(hospital.name)}`,
            score: hScore
          });
        }
      }
    });

    // Sort by score (descending) and then type to ensure mixture if scores are same
    return results
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.type.localeCompare(b.type); // Secondary sort to interleave types
      })
      .slice(0, 8);
  }, [searchQuery, doctors, hospitals, language]);

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
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-md px-3 sm:px-5 py-2 gap-2 sm:gap-3 focus-within:border-primary focus-within:shadow-lg transition-all">
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
              className="shrink-0  btn-primary btn-slide text-xs sm:text-sm font-semibold rounded-xl"

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
                            {language === 'bn' ? suggestion.doctor.specialtyBn && suggestion.doctor.specialtyBn : suggestion.doctor.specialty}
                          </div>
                        )}
                        {suggestion.hospital && (
                          <div
                            className="text-sm text-gray-500 mt-1"
                          >
                            {language === 'bn' ? suggestion.hospital.nameBn && suggestion.hospital.nameBn : suggestion.hospital.name}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
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