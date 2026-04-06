"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X, MapPin, Building2, Phone, Mail, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";

import { homepageTranslations } from "@/lib/homepage-translations";

interface Hospital {
  _id: string;
  name: string;
  nameBn?: string;
  thana?: {
    _id: string;
    name: string;
    nameBn?: string;
    district?: {
      _id: string;
      name: string;
      nameBn?: string;
      division?: {
        _id: string;
        name: string;
        nameBn?: string;
      };
    };
  };
  address?: string;
  addressBn?: string;
  phone?: string;
  email?: string;
}

type SortOption = "name" | "location";
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

export default function HospitalListPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [thanas, setThanas] = useState<Thana[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { language } = useLanguage();
  const t = homepageTranslations[language].hospitalsPage;

  const fetchHospitals = useCallback(async () => {
    try {
      const response = await fetch("/api/locations/hospitals");
      const data = await response.json();
      if (response.ok) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDivisions = useCallback(async () => {
    try {
      const response = await fetch("/api/locations/divisions");
      const data = await response.json();
      if (response.ok) {
        setDivisions(data.divisions);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  }, []);

  const fetchDistricts = useCallback(async (divisionName: string) => {
    try {
      const division = divisions.find(d => d.name === divisionName);
      if (!division) return;
      
      const response = await fetch(`/api/locations/districts?division=${division._id}`);
      const data = await response.json();
      if (response.ok) {
        setDistricts(data.districts);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  }, [divisions]);

  const fetchThanas = useCallback(async (districtName: string) => {
    try {
      const district = districts.find(d => d.name === districtName);
      if (!district) return;
      
      const response = await fetch(`/api/locations/thanas?district=${district._id}`);
      const data = await response.json();
      if (response.ok) {
        setThanas(data.thanas);
      }
    } catch (error) {
      console.error("Error fetching thanas:", error);
    }
  }, [districts]);

  useEffect(() => {
    fetchHospitals();
    fetchDivisions();
  }, [fetchHospitals, fetchDivisions]);

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

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Array<{ type: string; value: string; hospital?: Hospital }> = [];

    const matchingHospitals = hospitals
      .filter(
        hospital =>
          hospital.name.toLowerCase().includes(query) ||
          hospital.address?.toLowerCase().includes(query) ||
          hospital.phone?.toLowerCase().includes(query) ||
          hospital.email?.toLowerCase().includes(query) ||
          getHospitalLocationString(hospital).toLowerCase().includes(query)
      )
      .slice(0, 5);

    matchingHospitals.forEach(hospital => {
      if (hospital.name.toLowerCase().includes(query)) {
        results.push({ type: "হাসপাতাল", value: hospital.name, hospital });
      }
      if (hospital.address?.toLowerCase().includes(query) && 
          !results.some(r => r.type === "ঠিকানা" && r.value === hospital.address)) {
        results.push({ type: "ঠিকানা", value: hospital.address || "" });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, hospitals]);

  const getHospitalLocationString = (hospital: Hospital): string => {
    const parts: string[] = [];
    
    // Division
    const divisionName = getLocalizedValue(
      hospital.thana?.district?.division?.name,
      hospital.thana?.district?.division?.nameBn,
      language
    );
    if (divisionName) parts.push(divisionName);

    // District
    const districtName = getLocalizedValue(
      hospital.thana?.district?.name,
      hospital.thana?.district?.nameBn,
      language
    );
    if (districtName) parts.push(districtName);

    // Thana
    const thanaName = getLocalizedValue(
      hospital.thana?.name,
      hospital.thana?.nameBn,
      language
    );
    if (thanaName) parts.push(thanaName);

    return parts.join(", ");
  };

  const filteredAndSortedHospitals = useMemo(() => {
    let filtered = [...hospitals];

    // Language-based filter: Only show hospitals with content in the selected language
    filtered = filtered.filter((hospital) => {
      if (language === 'en') {
        // For English, show only hospitals that have English name
        return hospital.name && hospital.name.trim() !== '';
      } else {
        // For Bangla, show only hospitals that have Bangla name
        return hospital.nameBn && hospital.nameBn.trim() !== '';
      }
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((hospital) => {
        const name = getLocalizedValue(hospital.name, hospital.nameBn, language);
        const address = getLocalizedValue(hospital.address, hospital.addressBn, language);
        const locationStr = getHospitalLocationString(hospital);
        
        // Also check against raw names in case user searches for a location name directly
        const rawLocationStr = [
          hospital.thana?.district?.division?.name,
          hospital.thana?.district?.division?.nameBn,
          hospital.thana?.district?.name,
          hospital.thana?.district?.nameBn,
          hospital.thana?.name,
          hospital.thana?.nameBn
        ].filter(Boolean).join(" ").toLowerCase();

        return (
          name?.toLowerCase().includes(query) ||
          address?.toLowerCase().includes(query) ||
          hospital.phone?.toLowerCase().includes(query) ||
          hospital.email?.toLowerCase().includes(query) ||
          locationStr.toLowerCase().includes(query) ||
          rawLocationStr.includes(query)
        );
      });
    }

    if (selectedDivision) {
      filtered = filtered.filter(
        hospital => hospital.thana?.district?.division?.name === selectedDivision
      );
    }
    if (selectedDistrict) {
      filtered = filtered.filter(
        hospital => hospital.thana?.district?.name === selectedDistrict
      );
    }
    if (selectedThana) {
      filtered = filtered.filter(
        hospital => hospital.thana?.name === selectedThana
      );
    }

    filtered.sort((a, b) => {
      let aVal: string;
      let bVal: string;

      switch (sortBy) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "location":
          aVal = getHospitalLocationString(a).toLowerCase();
          bVal = getHospitalLocationString(b).toLowerCase();
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
    hospitals,
    searchQuery,
    selectedDivision,
    selectedDistrict,
    selectedThana,
    sortBy,
    sortDirection,
    language,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDivision("");
    setSelectedDistrict("");
    setSelectedThana("");
  };

  const handleDivisionSelect = (division: string) => {
    setSelectedDivision(division);
    setSelectedDistrict("");
    setSelectedThana("");
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setSelectedThana("");
  };

  const handleThanaSelect = (thana: string) => {
    setSelectedThana(thana);
  };

  const hasActiveFilters = useMemo(() => {
    return selectedDivision || selectedDistrict || selectedThana;
  }, [selectedDivision, selectedDistrict, selectedThana]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-xl font-semibold text-gray-700">{t.loading}</p>
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
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80')",
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
              >
                {t.heroTitle}
              </h1>
              {/* <p
                className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg"
              >
                Different Locations, 20+ Specialities, and 400+ Doctors near Savar from 40+ Hospitals.
              </p> */}
              {/* <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <span
                  className="text-white/90 text-lg font-semibold"
                >
                  Trusted Healthcare
                </span>
              </motion.div> */}
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
              {/* <div className="p-5 bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
                <Building2 className="h-12 w-12 text-white" />
              </div> */}
              <div className="flex-1">
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
                >
                  {t.listTitle}
                </h2>
                <p
                  className="text-lg text-gray-600 leading-relaxed"
                >
                  {t.selectLocation}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Modern Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
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
                  setFocusedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
                } else if (e.key === "Enter" && focusedIndex >= 0) {
                  e.preventDefault();
                  const suggestion = suggestions[focusedIndex];
                  if (suggestion.hospital) {
                    setSearchQuery(suggestion.hospital.name);
                  } else {
                    setSearchQuery(suggestion.value);
                  }
                  setShowSuggestions(false);
                } else if (e.key === "Escape") {
                  setShowSuggestions(false);
                }
              }}
              className="pl-14 pr-4 py-6 text-lg border-2 border-gray-300 focus:border-primary rounded-xl shadow-lg focus:shadow-xl transition-all"
              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={`${suggestion.type}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors border-b border-gray-100 last:border-b-0 ${
                        index === focusedIndex ? "bg-primary/10" : ""
                      }`}
                      onClick={() => {
                        if (suggestion.hospital) {
                          setSearchQuery(suggestion.hospital.name);
                        } else {
                          setSearchQuery(suggestion.value);
                        }
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div 
                            className="font-semibold text-gray-900 text-base"
                            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                          >
                            {suggestion.value}
                          </div>
                          {suggestion.hospital && (
                            <div 
                              className="text-sm text-gray-500 mt-1"
                              style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                            >
                              {getHospitalLocationString(suggestion.hospital)}
                            </div>
                          )}
                        </div>
                        <span 
                          className="text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full font-semibold"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {suggestion.type}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
              >
                <div className="p-2 bg-primary/20 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                {t.findByLocation}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label 
                  htmlFor="filter-division" 
                  className="mb-3 block text-base font-semibold text-gray-700"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  ১. {t.division}
                </Label>
                <select
                  id="filter-division"
                  value={selectedDivision}
                  onChange={(e) => handleDivisionSelect(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <option value="">{t.selectDivision}</option>
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
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  ২. {t.district}
                </Label>
                <select
                  id="filter-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  disabled={!selectedDivision}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <option value="">{selectedDivision ? t.selectDistrict : t.selectDivisionFirst}</option>
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
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  ৩. {t.thana}
                </Label>
                <select
                  id="filter-thana"
                  value={selectedThana}
                  onChange={(e) => handleThanaSelect(e.target.value)}
                  disabled={!selectedDistrict || !selectedDivision}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-base bg-white shadow-sm hover:shadow-md transition-all"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <option value="">{selectedDivision && selectedDistrict ? t.selectThana : t.selectDistrictFirst}</option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>
                      {thana.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedDivision || selectedDistrict || selectedThana) && (
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
                  }}
                  className="flex items-center gap-2 px-5 py-2.5"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  <X className="h-5 w-5" />
                  {t.reset}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Sort and Results Count */}
    

        {/* Hospital Cards Grid */}
        <AnimatePresence mode="wait">
          {filteredAndSortedHospitals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-16 text-center shadow-xl bg-gradient-to-br from-gray-50 to-white">
                <Building2 className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                <p 
                  className="text-2xl font-semibold text-gray-600 mb-4"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  {t.noHospitals}
                </p>
                {hasActiveFilters && (
                  <Button 
                    onClick={clearFilters} 
                    variant="outline"
                    className="mt-4"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    {t.clearFilters}
                  </Button>
                )}
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedHospitals.map((hospital, index) => (
                <motion.div
                  key={hospital._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Link href={`/hospital/${encodeURIComponent(hospital.name)}`}>
                    <Card className="relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 h-full cursor-pointer group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="p-6 flex flex-col h-full">
                        {/* 1. Center the hospital icon */}
                        <div className="mb-4 flex justify-center"> {/* Changed to justify-center */}
                          <div className="p-3 bg-blue-50 text-primary rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                             <Building2 className="h-6 w-6" />
                          </div>
                        </div>

                        <h3 
                          className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 leading-tight text-center"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {getLocalizedValue(hospital.name, hospital.nameBn, language)}
                        </h3>

                        {/* 2. MapPin moved to address */}
                        <div className="flex items-start gap-2 mb-4 flex-grow justify-center">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                            {hospital.address ? (
                              <p 
                                className="text-sm text-gray-500 leading-relaxed text-center"
                                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                              >
                               {getLocalizedValue(hospital.address, hospital.addressBn, language)}
                              </p>
                            ) : (
                               <p className="text-sm text-gray-400 italic">ঠিকানা উপলব্ধ নয়</p>
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-center text-sm font-medium">
                            <span className="text-primary flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                              {/* 3. Button icon changed to ArrowRight */}
                              {t.viewDoctors} <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
