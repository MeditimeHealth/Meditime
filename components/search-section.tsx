"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading recent searches:", e);
      }
    }
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
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
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
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      router.push(`/doctor?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
    router.push(`/doctor?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Text Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          style={{
            color: "#009A98",
            fontFamily:
              "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          সাস্থ্য সেবার সাথে মাত্র ১০ মিনিটে ডাক্তারের অ্যাপয়েন্টমেন্ট বুক করুন
        </h1>
        <p
          className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed"
          style={{
            fontFamily:
              "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          অনন্ত ফোন কল এবং দীর্ঘ লাইনের কথা ভুলে যান। ডাক্তারের অ্যাপয়েন্টমেন্ট, ভিডিও কনসালটেশন, অ্যাম্বুলেন্স সেবা, মেডিকেল রেকর্ড পরিচালনা এবং আরও অনেক কিছু বুক করুন। ভাল স্বাস্থ্যের দিকে প্রথম পদক্ষেপ নিন।
        </p>
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
          
          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span
                className="text-gray-700 font-semibold text-base"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                সম্প্রতি:
              </span>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

