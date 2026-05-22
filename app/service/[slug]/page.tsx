"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Image from "next/image";
import { MapPin, Phone, Mail, Droplet, Calendar, Car, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

interface BloodDonor {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  bloodGroup: string;
  division?: string;
  district?: string;
  thana?: string;
  photo?: string;
  availabilityStatus: string;
  lastDonationDate?: string;
}

interface Ambulance {
  _id: string;
  name: string;
  phoneNumber: string;
  division?: string;
  district?: string;
  thana?: string;
  availabilityStatus: string;
  vehicleType: string;
}

interface ServiceSection {
  _id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
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

type SortOption = "name" | "location" | "status" | "date";
type ServiceType = "blood-donor" | "ambulance" | "other";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { language } = useLanguage() as { language: 'en' | 'bn' };

  const [serviceSection, setServiceSection] = useState<ServiceSection | null>(null);
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState<ServiceType>("other");

  // Location filters
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [thanas, setThanas] = useState<Thana[]>([]);

  // Filters
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");
  const [availabilityStatusFilter, setAvailabilityStatusFilter] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const fetchServiceSection = async () => {
    // Determine service type and section info based on slug
    if (slug === "blood-donors" || slug.includes("blood") || slug.includes("donor")) {
      setServiceType("blood-donor");
      const t = homepageTranslations[language].bloodDonor;
      setServiceSection({
        _id: "blood-donors",
        title: t.title,
        description: t.subtitle,
        slug: "blood-donors",
        order: 1,
      });
    } else if (slug === "ambulance-services" || slug.includes("ambulance")) {
      setServiceType("ambulance");
      const t = homepageTranslations[language].ambulance;
      setServiceSection({
        _id: "ambulance-services",
        title: t.title,
        description: t.subtitle,
        slug: "ambulance-services",
        order: 2,
      });
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

  const fetchBloodDonors = async () => {
    try {
      const params = new URLSearchParams();
      if (bloodGroupFilter) params.append("bloodGroup", bloodGroupFilter);
      if (selectedDivision) params.append("division", selectedDivision);
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedThana) params.append("thana", selectedThana);

      const response = await fetch(`/api/blood-donors?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        let donors = data.bloodDonors;
        // Sort donors
        donors = sortData(donors, sortBy);
        setBloodDonors(donors);
      }
    } catch (error) {
      console.error("Error fetching blood donors:", error);
    }
  };

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
        let ambulanceList = data.ambulances;
        // Sort ambulances
        ambulanceList = sortData(ambulanceList, sortBy);
        setAmbulances(ambulanceList);
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    }
  };

  const sortData = (data: any[], sortOption: SortOption) => {
    const sorted = [...data];
    switch (sortOption) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "location":
        return sorted.sort((a, b) => {
          const locA = [a.division, a.district, a.thana].filter(Boolean).join(", ");
          const locB = [b.division, b.district, b.thana].filter(Boolean).join(", ");
          return locA.localeCompare(locB);
        });
      case "status":
        return sorted.sort((a, b) => a.availabilityStatus.localeCompare(b.availabilityStatus));
      case "date":
        return sorted.sort((a, b) => {
          const dateA = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0;
          const dateB = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  };

  useEffect(() => {
    fetchServiceSection();
    fetchDivisions();
    setLoading(false);
  }, [slug]);

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
    if (serviceType === "blood-donor") {
      fetchBloodDonors();
    } else if (serviceType === "ambulance") {
      fetchAmbulances();
    }
  }, [serviceType, selectedDivision, selectedDistrict, selectedThana, bloodGroupFilter, availabilityStatusFilter, vehicleTypeFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!serviceSection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
            <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
            <Link href="/service" className="text-primary hover:underline">
              Go back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full ">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/service" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Link>
            <h1 className="text-4xl font-bold text-[#009A98] mb-2">{serviceSection.title}</h1>
            <p className="text-lg text-gray-600">{serviceSection.description}</p>
          </div>
        </div>

        {/* Main Content - Full Width Layout */}
        <div className="flex w-full">
          {/* Left Sidebar - Sort Options */}
          <div className="w-80 bg-white border-r border-gray-200 p-6 h-[calc(100vh-200px)] sticky top-20 overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#009A98] mb-4">
              {language === 'bn' ? 'সর্ট এবং ফিল্টার' : 'Sort & Filter'}
            </h2>
            
  {/* Service-specific filters */}
  {serviceType === "blood-donor" && (
              <div className="mb-6">
                <Label htmlFor="bloodGroup" className="text-sm font-medium text-gray-700 mb-2 block">
                  {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                </Label>
                <select
                  id="bloodGroup"
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">{language === 'bn' ? 'সব রক্তের গ্রুপ' : 'All Blood Groups'}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            )}
            {/* Location Filters */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="division" className="text-sm font-medium text-gray-700 mb-2 block">
                  {homepageTranslations[language].hospitalsPage.division}
                </Label>
                <select
                  id="division"
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">{homepageTranslations[language].hospitalsPage.selectDivision}</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="district" className="text-sm font-medium text-gray-700 mb-2 block">
                  {homepageTranslations[language].hospitalsPage.district}
                </Label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedDivision}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <option value="">{homepageTranslations[language].hospitalsPage.selectDistrict}</option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="thana" className="text-sm font-medium text-gray-700 mb-2 block">
                  {homepageTranslations[language].hospitalsPage.thana}
                </Label>
                <select
                  id="thana"
                  value={selectedThana}
                  onChange={(e) => setSelectedThana(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <option value="">{homepageTranslations[language].hospitalsPage.selectThana}</option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>
                      {thana.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          

            {serviceType === "ambulance" && (
              <>
                <div className="mb-4">
                  <Label htmlFor="availabilityStatus" className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === 'bn' ? 'অবস্থা' : 'Status'}
                  </Label>
                  <select
                    id="availabilityStatus"
                    value={availabilityStatusFilter}
                    onChange={(e) => setAvailabilityStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">{language === 'bn' ? 'সব অবস্থা' : 'All Status'}</option>
                    <option value="Available">{language === 'bn' ? 'উপলব্ধ' : 'Available'}</option>
                    <option value="Unavailable">{language === 'bn' ? 'অনুপলব্ধ' : 'Unavailable'}</option>
                    <option value="On Call">{language === 'bn' ? 'কলে আছে' : 'On Call'}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === 'bn' ? 'গাড়ির ধরন' : 'Vehicle Type'}
                  </Label>
                  <select
                    id="vehicleType"
                    value={vehicleTypeFilter}
                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">{language === 'bn' ? 'সব ধরন' : 'All Types'}</option>
                    <option value="Basic Life Support">{language === 'bn' ? 'বেসিক লাইফ সাপোর্ট' : 'Basic Life Support'}</option>
                    <option value="Advanced Life Support">{language === 'bn' ? 'অ্যাডভান্সড লাইফ সাপোর্ট' : 'Advanced Life Support'}</option>
                    <option value="Critical Care">{language === 'bn' ? 'ক্রিটিক্যাল কেয়ার' : 'Critical Care'}</option>
                    <option value="Air Ambulance">{language === 'bn' ? 'এয়ার অ্যাম্বুলেন্স' : 'Air Ambulance'}</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Middle Content - Scrollable Service List */}
          <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-200px)]">
            {serviceType === "blood-donor" && (
              <div className="space-y-6">
                {bloodDonors.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No blood donors found</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bloodDonors.map((donor) => (
                      <Card key={donor._id} className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-gray-200">
                              {donor.photo ? (
                                <Image
                                  src={donor.photo}
                                  alt={donor.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600 font-semibold text-xl">
                                  {donor.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold text-[#009A98] truncate">
                                {donor.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Droplet className="h-5 w-5 text-red-500" />
                                <span className="text-lg font-bold text-red-600">{donor.bloodGroup}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{donor.phoneNumber}</span>
                            </div>
                            {donor.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{donor.email}</span>
                              </div>
                            )}
                            {(donor.division || donor.district || donor.thana) && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">
                                  {[donor.division, donor.district, donor.thana].filter(Boolean).join(", ")}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                donor.availabilityStatus === "Available" ? "bg-green-100 text-green-700" :
                                donor.availabilityStatus === "Recently Donated" ? "bg-yellow-100 text-yellow-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {donor.availabilityStatus}
                              </span>
                            </div>
                            {donor.lastDonationDate && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs">
                                  Last donation: {new Date(donor.lastDonationDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {serviceType === "ambulance" && (
              <div className="space-y-6">
                {ambulances.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-gray-500 text-lg">No ambulances found</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ambulances.map((ambulance) => (
                      <Card key={ambulance._id} className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Car className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold text-[#009A98] truncate">
                                {ambulance.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{ambulance.vehicleType}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span className="font-medium">{ambulance.phoneNumber}</span>
                            </div>
                            {(ambulance.division || ambulance.district || ambulance.thana) && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">
                                  {[ambulance.division, ambulance.district, ambulance.thana].filter(Boolean).join(", ")}
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {serviceType === "other" && (
              <Card className="p-12 text-center">
                <p className="text-gray-500 text-lg">Service content coming soon</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

