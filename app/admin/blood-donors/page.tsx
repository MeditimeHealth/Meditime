"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2, MapPin, Phone, Mail, Calendar, User, Search } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface BloodDonor {
  _id: string;
  name: string;
  nameBn?: string; // added
  phoneNumber: string;
  email?: string;
  bloodGroup: string;
  division?: string;
  divisionBn?: string; // added
  district?: string;
  districtBn?: string; // added
  thana?: string;
  thanaBn?: string; // added
  photo?: string;
  availabilityStatus: string;
  lastDonationDate?: string;
}

export default function BloodDonorsPage() {
  const { language } = useLanguage();
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBloodDonors();
  }, []);

  const fetchBloodDonors = async () => {
    try {
      const response = await fetch("/api/blood-donors");
      const data = await response.json();
      if (response.ok) {
        setBloodDonors(data.bloodDonors);
      }
    } catch (error) {
      console.error("Error fetching blood donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blood donor?")) return;

    try {
      const response = await fetch(`/api/blood-donors/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBloodDonors(bloodDonors.filter((donor) => donor._id !== id));
        alert("Blood donor deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete blood donor");
      }
    } catch (error) {
      console.error("Error deleting blood donor:", error);
      alert("Failed to delete blood donor");
    }
  };

  const filteredDonors = bloodDonors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.nameBn && d.nameBn.includes(searchQuery)) ||
    d.phoneNumber.includes(searchQuery) ||
    d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && bloodDonors.length === 0) {
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
             {t("allBloodDonors", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {t("bloodDonorsSubTitle", language)}
          </p>
        </div>
        <Link href="/admin/blood-donors/create">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-7 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-6 w-6 mr-2" />
            {t("createBloodDonor", language)}
          </Button>
        </Link>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder={t("searchByNameOrPhone", language)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 h-14 text-lg border-2 border-gray-100 rounded-2xl bg-white shadow-sm focus:ring-primary focus:border-primary transition-all pr-4 font-bold outline-none"
        />
      </div>

      {filteredDonors.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-[2.5rem]">
           <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white p-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto shadow-md">
                 <User className="h-14 w-14 text-gray-200" />
              </div>
              <p className="text-gray-500 text-2xl font-black tracking-tight">
                 {bloodDonors.length === 0 ? t("noBloodDonors", language) : (language === 'bn' ? 'কোনো রক্তদাতা পাওয়া যায়নি' : 'No blood donors match your search')}
              </p>
              {bloodDonors.length === 0 && (
                <Link href="/admin/blood-donors/create">
                   <Button className="bg-primary text-white h-16 px-10 text-xl font-black rounded-2xl shadow-xl shadow-primary/10">
                      <Plus className="h-6 w-6 mr-2" />
                      {t("createFirstBloodDonor", language)}
                   </Button>
                </Link>
              )}
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredDonors.map((donor) => (
            <Card key={donor._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-red-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col">
               <div className="p-8 space-y-6 flex-1">
                  <div className="flex items-start justify-between gap-5">
                     <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="shrink-0">
                           <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100 group-hover:ring-red-200 transition-all bg-gray-50">
                              {donor.photo ? (
                                <Image src={donor.photo} alt={donor.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 font-black text-2xl">
                                  {donor.name.charAt(0)}
                                </div>
                              )}
                           </div>
                        </div>
                        <div className="flex-1 min-w-0">
                           <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                              {language === 'bn' && donor.nameBn ? donor.nameBn : donor.name}
                           </h3>
                           <div className="flex items-center gap-2 mt-1.5">
                              <div className={`h-2 w-2 rounded-full shadow-sm ${
                                donor.availabilityStatus === "Available" ? "bg-green-500" :
                                donor.availabilityStatus === "Recently Donated" ? "bg-yellow-500" : "bg-red-500"
                              }`} />
                              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                 {donor.availabilityStatus === "Available" ? t("available", language) :
                                  donor.availabilityStatus === "Recently Donated" ? t("recentlyDonated", language) : t("unavailable", language)}
                              </span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-lg font-black border border-red-100 shadow-sm">
                        {donor.bloodGroup}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group-hover:bg-white transition-all">
                     <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-black text-gray-700">{donor.phoneNumber}</span>
                     </div>
                     {donor.email && (
                        <div className="flex items-center gap-3">
                           <Mail className="h-4 w-4 text-blue-500" />
                           <span className="text-sm font-bold text-gray-600 truncate">{donor.email}</span>
                        </div>
                     )}
                     {(donor.division || donor.district || donor.thana) && (
                        <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                           <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                           <div className="text-sm font-bold text-gray-600">
                              {[
                                 language === 'bn' ? donor.thanaBn || donor.thana : donor.thana,
                                 language === 'bn' ? donor.districtBn || donor.district : donor.district,
                                 language === 'bn' ? donor.divisionBn || donor.division : donor.division,
                              ].filter(Boolean).join(", ")}
                           </div>
                        </div>
                     )}
                  </div>

                  {donor.lastDonationDate && (
                     <div className="space-y-2">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center">
                           <Calendar className="h-3 w-3 mr-2" />
                           {t("lastDonationDate", language)}
                        </div>
                        <div className="text-sm font-black text-gray-500 bg-gray-50 group-hover:bg-white px-3 py-2 rounded-lg border border-transparent transition-all">
                           {new Date(donor.lastDonationDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                               year: 'numeric', month: 'long', day: 'numeric'
                           })}
                        </div>
                     </div>
                  )}
               </div>

               <div className="flex gap-1 p-4 bg-gray-50 border-t border-gray-100">
                  <Link href={`/admin/blood-donors/edit/${donor._id}`} className="flex-1">
                     <Button variant="ghost" className="w-full h-12 font-black text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl">
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit", language)}
                     </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-12 font-black text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    onClick={() => handleDelete(donor._id)}
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
