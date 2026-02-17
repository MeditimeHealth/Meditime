"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { MapPin, Phone, Car, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/translations";

interface Ambulance {
  _id: string;
  name: string;
  nameBn?: string;
  phoneNumber: string;
  division?: string;
  divisionBn?: string;
  district?: string;
  districtBn?: string;
  thana?: string;
  thanaBn?: string;
  availabilityStatus: string;
  vehicleType: string;
}

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

export default function AmbulancePage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);

  // Location filters
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [thanas, setThanas] = useState<Thana[]>([]);

  // Filters
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [availabilityStatusFilter, setAvailabilityStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

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

  const fetchAmbulances = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDivision) params.append("division", selectedDivision);
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedThana) params.append("thana", selectedThana);
      if (availabilityStatusFilter) params.append("availabilityStatus", availabilityStatusFilter);
      if (vehicleTypeFilter) params.append("vehicleType", vehicleTypeFilter);

      const response = await fetch(`/api/ambulances?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setAmbulances(data.ambulances);
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
    fetchAmbulances();
  }, []);

  useEffect(() => {
    if (selectedDivision && divisions.length > 0) {
      fetchDistricts(selectedDivision);
      setSelectedDistrict("");
      setSelectedThana("");
    }
  }, [selectedDivision, divisions, fetchDistricts]);

  useEffect(() => {
    if (selectedDistrict && districts.length > 0) {
      fetchThanas(selectedDistrict);
      setSelectedThana("");
    }
  }, [selectedDistrict, districts, fetchThanas]);

  useEffect(() => {
    fetchAmbulances();
  }, [selectedDivision, selectedDistrict, selectedThana, availabilityStatusFilter, vehicleTypeFilter]);

  // Language-based filter: Only show ambulances with content in the selected language
  const filteredAmbulances = useMemo(() => {
    return ambulances.filter((ambulance) => {
      // 1. Language filter
      let matchesLanguage = false;
      if (language === 'en') {
        matchesLanguage = !!(ambulance.name && ambulance.name.trim() !== '');
      } else {
        matchesLanguage = !!(ambulance.nameBn && ambulance.nameBn.trim() !== '');
      }

      if (!matchesLanguage) return false;

      // 2. Search query filter (name, thana, district, division)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          ambulance.name.toLowerCase().includes(query) ||
          !!(ambulance.nameBn && ambulance.nameBn.toLowerCase().includes(query)) ||
          ambulance.phoneNumber.includes(query) ||
          !!(ambulance.thana && ambulance.thana.toLowerCase().includes(query)) ||
          !!(ambulance.district && ambulance.district.toLowerCase().includes(query)) ||
          !!(ambulance.division && ambulance.division.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [ambulances, language, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[400px] md:h-[500px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/50 to-primary-dark/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1920&q=80')",
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
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                Quick Access to Ambulance Service in Dhaka and Nearby - Find an Ambulance Near You
              </h1>
              <p className="text-lg md:text-xl text-white/95 mb-8 drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
                Whether the case involves a massive heart attack (ambulance ICU) or maternity care, quick access to emergency medical assistance increases the chances of a faster recovery. You can find more than 50 ambulance numbers from our list. If you are looking for a freezing ambulance please contact the driver about the availability and pricing.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-2"
              >
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <span className="text-white/90 text-lg font-semibold">
                  Emergency Medical Service
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-[#009A98]">{language === 'bn' ? 'অ্যাম্বুলেন্স খুঁজুন' : 'Filter Ambulances'}</h2>
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t("searchByNameAddressOrPhone", language)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="division" className="text-sm font-medium text-gray-700 mb-2 block">Division</Label>
                <select
                  id="division"
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Divisions</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="district" className="text-sm font-medium text-gray-700 mb-2 block">District</Label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedDivision}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <option value="">All Districts</option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="thana" className="text-sm font-medium text-gray-700 mb-2 block">Thana/Upazila</Label>
                <select
                  id="thana"
                  value={selectedThana}
                  onChange={(e) => setSelectedThana(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <option value="">All Thanas</option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>
                      {thana.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="availabilityStatus" className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                <select
                  id="availabilityStatus"
                  value={availabilityStatusFilter}
                  onChange={(e) => setAvailabilityStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="On Call">On Call</option>
                </select>
              </div>

              <div>
                <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700 mb-2 block">Vehicle Type</Label>
                <select
                  id="vehicleType"
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Basic Life Support">Basic Life Support</option>
                  <option value="Advanced Life Support">Advanced Life Support</option>
                  <option value="Critical Care">Critical Care</option>
                  <option value="Air Ambulance">Air Ambulance</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Ambulance List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAmbulances.length === 0 ? (
            <Card className="p-12 text-center">
              <Car className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No ambulances found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAmbulances.map((ambulance, index) => (
                <motion.div
                  key={ambulance._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Car className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-[#009A98] truncate">
                            {getLocalizedValue(ambulance.name, ambulance.nameBn, language)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{ambulance.vehicleType}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${ambulance.phoneNumber}`} className="font-medium text-primary hover:underline">
                            {ambulance.phoneNumber}
                          </a>
                        </div>
                        {(ambulance.division || ambulance.district || ambulance.thana) && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs">
                                {language === 'bn' ? 
                                  [ambulance.thanaBn || ambulance.thana, ambulance.districtBn || ambulance.district, ambulance.divisionBn || ambulance.division].filter(Boolean).join(", ") :
                                  [ambulance.thana, ambulance.district, ambulance.division].filter(Boolean).join(", ")
                                }
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ambulance.availabilityStatus === "Available" ? "bg-green-100 text-green-700" :
                            ambulance.availabilityStatus === "On Call" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {ambulance.availabilityStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
