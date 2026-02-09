"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Car, Phone, Trash2, Edit, Loader2, Search, MapPin, Info, ArrowRight } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";
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

  const filteredAmbulances = ambulances.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.nameBn?.includes(searchQuery) ||
    a.phoneNumber.includes(searchQuery) ||
    a.ambulanceNumber.includes(searchQuery)
  );

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
             {language === 'bn' ? 'সকল অ্যাম্বুলেন্স' : 'All Ambulances'}
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {language === 'bn' ? 'জরুরি অ্যাম্বুলেন্স সেবা পরিচালনা এবং তদারকি করুন' : 'Manage emergency ambulance services and fleet information'}
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
          placeholder={language === 'bn' ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone number...'}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredAmbulances.map((ambulance) => (
            <Card key={ambulance._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col">
               <div className="p-8 space-y-6 flex-1">
                  <div className="flex items-start justify-between gap-5">
                     <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="shrink-0">
                           <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-blue-100 group-hover:ring-blue-200 transition-all">
                              <Car className="h-8 w-8 text-blue-600" />
                           </div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                              {language === 'bn' && ambulance.nameBn ? ambulance.nameBn : ambulance.name}
                           </h3>
                           <div className="flex items-center gap-2 mt-1.5">
                              <div className={clsx(
                                "h-2 w-2 rounded-full shadow-sm",
                                ambulance.availabilityStatus === "Available" ? "bg-green-500" :
                                ambulance.availabilityStatus === "On Call" ? "bg-yellow-500" : "bg-red-500"
                              )} />
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                 {language === 'bn' ? (
                                   ambulance.availabilityStatus === "Available" ? "উপলব্ধ" : 
                                   ambulance.availabilityStatus === "On Call" ? "অন কল" : "অনুপলব্ধ"
                                 ) : ambulance.availabilityStatus}
                              </span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-blue-50/50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 whitespace-nowrap">
                        {ambulance.vehicleType}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group-hover:bg-white transition-all">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Phone className="h-4 w-4 text-green-500" />
                           <span className="text-sm font-black text-gray-700">{ambulance.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest">
                           {language === 'bn' ? 'নম্বর' : 'No'}: {ambulance.ambulanceNumber || '—'}
                        </div>
                     </div>

                     <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="text-sm font-bold text-gray-600">
                           {[
                              language === 'bn' ? ambulance.thanaBn || ambulance.thana : ambulance.thana,
                              language === 'bn' ? ambulance.districtBn || ambulance.district : ambulance.district,
                              language === 'bn' ? ambulance.divisionBn || ambulance.division : ambulance.division,
                           ].filter(Boolean).join(", ")}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center">
                        <Info className="h-3 w-3 mr-2" />
                        {t("drivingLicence", language)}
                     </div>
                     <div className="text-sm font-black text-gray-500 truncate bg-gray-50 group-hover:bg-white px-3 py-2 rounded-lg border border-transparent transition-all">
                        {ambulance.drivingLicence || '—'}
                     </div>
                  </div>
               </div>

               <div className="flex gap-1 p-4 bg-gray-50 border-t border-gray-100">
                  <Link href={`/admin/ambulances/edit/${ambulance._id}`} className="flex-1">
                     <Button variant="ghost" className="w-full h-12 font-black text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit", language)}
                     </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-12 font-black text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
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
