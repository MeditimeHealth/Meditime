"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, Phone, Trash2, Edit, Loader2, Search, MapPin, Info, ArrowRight } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Input } from "@/components/ui/input";

interface Ambulance {
  _id: string;
  name: string;
  nameBn?: string;
  phoneNumber: string;
  ambulanceNumber: string;
  drivingLicence: string;
  division?: string;
  divisionBn?: string;
  district?: string;
  districtBn?: string;
  thana?: string;
  thanaBn?: string;
  availabilityStatus: string;
  vehicleType: string;
}

export default function AmbulancesPage() {
  const { language } = useLanguage();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ambulances");
      const data = await response.json();
      if (response.ok) {
        setAmbulances(data.ambulances);
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
      showToast.error("Failed to fetch ambulances");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(language === 'bn' ? `আপনি কি নিশ্চিত যে আপনি "${name}" মুছে ফেলতে চান?` : `Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/ambulances/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAmbulances(ambulances.filter((ambulance) => ambulance._id !== id));
        showToast.success(language === 'bn' ? "অ্যাম্বুলেন্স সফলভাবে মুছে ফেলা হয়েছে" : "Ambulance deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete ambulance");
      }
    } catch (error) {
      console.error("Error deleting ambulance:", error);
      showToast.error("Failed to delete ambulance");
    }
  };

  const filteredAmbulances = ambulances.filter(a => {
    const query = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(query) ||
      (a.nameBn && a.nameBn.toLowerCase().includes(query)) ||
      a.phoneNumber.includes(query) ||
      (a.ambulanceNumber && a.ambulanceNumber.toLowerCase().includes(query)) ||
      (a.thana && a.thana.toLowerCase().includes(query)) ||
      (a.thanaBn && a.thanaBn.toLowerCase().includes(query)) ||
      (a.district && a.district.toLowerCase().includes(query)) ||
      (a.districtBn && a.districtBn.toLowerCase().includes(query)) ||
      (a.division && a.division.toLowerCase().includes(query)) ||
      (a.divisionBn && a.divisionBn.toLowerCase().includes(query))
    );
  });

  if (loading && ambulances.length === 0) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
             {t("allAmbulances", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {t("ambulanceSubTitle", language)}
          </p>
        </div>
        <Link href="/admin/ambulances/create">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-7 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-6 w-6 mr-2" />
            {t("createAmbulance", language)}
          </Button>
        </Link>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          placeholder={t("searchByNameAddressOrPhone", language)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg border-2 border-gray-100 rounded-2xl bg-white shadow-sm focus:ring-primary focus:border-primary transition-all pr-4 font-bold"
        />
      </div>

      {filteredAmbulances.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-[2.5rem]">
           <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white p-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto shadow-md">
                 <Car className="h-14 w-14 text-gray-200" />
              </div>
              <p className="text-gray-500 text-2xl font-black tracking-tight">
                 {ambulances.length === 0 ? t("noAmbulances", language) : (language === 'bn' ? 'কোনো অ্যাম্বুলেন্স পাওয়া যায়নি' : 'No ambulances match your search')}
              </p>
              {ambulances.length === 0 && (
                <Link href="/admin/ambulances/create">
                   <Button className="bg-primary text-white h-16 px-10 text-xl font-black rounded-2xl shadow-xl shadow-primary/10">
                      <Plus className="h-6 w-6 mr-2" />
                      {t("createFirstAmbulance", language)}
                   </Button>
                </Link>
              )}
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAmbulances.map((ambulance) => (
            <Card key={ambulance._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-8 space-y-6 flex-1">
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

                <div className="space-y-3 text-sm">
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
                      {ambulance.availabilityStatus === "Available" ? t("available", language) : 
                       ambulance.availabilityStatus === "On Call" ? t("onCall", language) : t("unavailable", language)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <div>
                      {language === 'bn' ? 'যানবাহন নম্বর' : 'Vehicle No'}: <span className="text-gray-600">{ambulance.ambulanceNumber || '—'}</span>
                    </div>
                    <div>
                      {t("drivingLicence", language)}: <span className="text-gray-600 truncate block">{ambulance.drivingLicence || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-4 bg-gray-50/50 border-t border-gray-100">
                <Link href={`/admin/ambulances/edit/${ambulance._id}`} className="flex-1">
                  <Button variant="outline" className="w-full h-10 text-sm font-bold border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit", language)}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="flex-1 h-10 text-sm font-bold border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  onClick={() => handleDelete(ambulance._id, ambulance.name)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete", language)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
