"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin, Phone, Trash2, Edit, Loader2, Search, Globe, Info } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Input } from "@/components/ui/input";

interface Hospital {
  _id: string;
  name: string;
  nameBn?: string;
  address?: string;
  addressBn?: string;
  phone?: string;
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
}

export default function HospitalsListPage() {
  const { language } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'missing_bn' | 'missing_en' | 'complete'>('all');

  useEffect(() => {
    fetchHospitals();
  }, [page]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations/hospitals?page=${page}&limit=20`);
      const data = await response.json();
      
      if (response.ok) {
        if (page === 1) {
          setHospitals(data.hospitals || []);
        } else {
          setHospitals(prev => [...prev, ...(data.hospitals || [])]);
        }
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
      } else {
        showToast.error(data.error || "Failed to fetch hospitals");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      showToast.error("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const displayName = getLocalizedValue(name, hospitals.find(h => h._id === id)?.nameBn, language);
    if (!confirm(language === 'bn' ? `আপনি কি নিশ্চিত যে আপনি "${displayName}" মুছে ফেলতে চান?` : `Are you sure you want to delete "${displayName}"?`)) return;

    try {
      const response = await fetch(`/api/locations/hospitals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHospitals(hospitals.filter((hospital) => hospital._id !== id));
        setTotal(prev => prev - 1);
        showToast.success(language === 'bn' ? "হাসপাতাল সফলভাবে মুছে ফেলা হয়েছে" : "Hospital deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete hospital");
      }
    } catch (error) {
      console.error("Error deleting hospital:", error);
      showToast.error("Failed to delete hospital");
    }
  };

  const getFullLocation = (hospital: Hospital) => {
    const parts = [];
    if (hospital.thana) {
      parts.push(language === 'bn' ? (hospital.thana.nameBn || hospital.thana.name) : hospital.thana.name);
      if (hospital.thana.district) {
        parts.push(language === 'bn' ? (hospital.thana.district.nameBn || hospital.thana.district.name) : hospital.thana.district.name);
        if (hospital.thana.district.division) {
          parts.push(language === 'bn' ? (hospital.thana.district.division.nameBn || hospital.thana.district.division.name) : hospital.thana.district.division.name);
        }
      }
    }
    return parts.join(", ");
  };

  const filteredHospitals = hospitals.filter(h => {
    // 1. Language Filter Logic
    const hasEnglish = !!(h.name && h.address);
    const hasBangla = !!(h.nameBn && h.addressBn);

    if (filterStatus === 'missing_bn' && hasBangla) return false;
    if (filterStatus === 'missing_en' && hasEnglish) return false;
    if (filterStatus === 'complete' && (!hasBangla || !hasEnglish)) return false;

    // 2. Search Query Logic
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    return (
      (h.name || '').toLowerCase().includes(query) ||
      (h.nameBn || '').includes(query) ||
      (h.address || '').toLowerCase().includes(query) ||
      (h.addressBn || '').includes(query) ||
      (h.phone || '').includes(query) ||
      (h.thana?.name || '').toLowerCase().includes(query) ||
      (h.thana?.nameBn || '').includes(query)
    );
  });

  if (loading && hospitals.length === 0) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-gray-500 font-bold text-lg">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
             {language === 'bn' ? 'সকল হাসপাতাল' : 'All Hospitals'}
          </h1>
          <p className="text-gray-500 mt-3 text-xl font-medium">
            {language === 'bn' ? `হাসপাতালের তথ্য পরিচালনা করুন (${total} টি মোট)` : `Manage hospital information and resources (${total} total)`}
          </p>
        </div>
        <Link href="/admin/hospitals/create">
          <Button className="bg-primary hover:bg-primary/90 text-white px-10 py-8 text-2xl font-black rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 border-none">
            <Plus className="h-7 w-7 mr-3 stroke-[3]" />
            {t("addHospital", language)}
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center max-w-5xl mx-auto md:mx-0">
        <div className="relative group flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-gray-300 group-focus-within:text-primary transition-colors stroke-[2.5]" />
          </div>
          <Input
            type="text"
            placeholder={language === 'bn' ? 'হাসপাতালের নাম, ঠিকানা বা ফোন দিয়ে খুঁজুন...' : 'Search by name, address, or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-16 h-16 text-xl border-2 border-gray-100 rounded-[1.5rem] bg-white shadow-lg shadow-gray-100/50 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-6 font-bold placeholder:text-gray-300"
          />
        </div>

        <div className="relative w-full md:w-72">
           <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
             <Globe className="h-5 w-5 text-gray-400 stroke-[2.5]" />
           </div>
           <select 
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value as any)}
             className="w-full h-16 pl-14 pr-10 text-lg border-2 border-gray-100 rounded-[1.5rem] bg-white shadow-lg shadow-gray-100/50 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold appearance-none cursor-pointer"
           >
             <option value="all">{language === 'bn' ? 'সব হাসপাতাল' : 'All Hospitals'}</option>
             <option value="missing_bn">{language === 'bn' ? 'বাংলা তথ্য নেই' : 'Missing Bangla'}</option>
             <option value="missing_en">{language === 'bn' ? 'ইংরেজি তথ্য নেই' : 'Missing English'}</option>
             <option value="complete">{language === 'bn' ? 'সম্পূর্ণ প্রোফাইল' : 'Complete'}</option>
           </select>
           <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
             <div className="h-2 w-2 border-r-2 border-b-2 border-gray-400 rotate-45 mb-1" />
           </div>
        </div>
      </div>

      {filteredHospitals.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-[2.5rem]">
           <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white p-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto shadow-md">
                 <Building2 className="h-14 w-14 text-gray-200" />
              </div>
              <p className="text-gray-500 text-2xl font-black tracking-tight">
                 {hospitals.length === 0 ? t("noHospitals", language) : (language === 'bn' ? 'কোনো হাসপাতাল পাওয়া যায়নি' : 'No hospitals match your search')}
              </p>
              {hospitals.length === 0 && (
                <Link href="/admin/hospitals/create">
                   <Button className="bg-primary text-white h-16 px-10 text-xl font-black rounded-2xl shadow-xl shadow-primary/10">
                      <Plus className="h-6 w-6 mr-2" />
                      {t("createFirstHospital", language)}
                   </Button>
                </Link>
              )}
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col h-full">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="p-8 space-y-6 flex-1">
                  <div className="flex items-start gap-5">
                     <div className="shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-primary/10 group-hover:ring-primary/20 transition-all">
                           <Building2 className="h-8 w-8 text-primary/60" />
                        </div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                           {getLocalizedValue(hospital.name, hospital.nameBn, language)}
                        </h3>
                        {getFullLocation(hospital) && (
                          <div className="flex items-center gap-2 mt-2">
                             <MapPin className="h-3.5 w-3.5 text-gray-400" />
                             <span className="text-xs font-bold text-gray-500">
                                {getFullLocation(hospital)}
                             </span>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-primary/5 transition-all">
                     <div className="flex items-start gap-3">
                        <Info className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                        <div className="text-sm font-bold text-gray-600">
                           {getLocalizedValue(hospital.address, hospital.addressBn, language) || (language === 'bn' ? 'ঠিকানা নেই' : 'No address provided')}
                        </div>
                     </div>

                     {hospital.phone && (
                       <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-green-500 shrink-0" />
                          <div className="text-sm font-black text-gray-700">{hospital.phone}</div>
                       </div>
                     )}
                  </div>
               </div>

               <div className="flex gap-1 p-4 bg-gray-50 border-t border-gray-100">
                  <Link href={`/admin/hospitals/${hospital._id}/edit`} className="flex-1">
                     <Button variant="ghost" className="w-full h-12 font-black text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl">
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit", language)}
                     </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-12 font-black text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    onClick={() => handleDelete(hospital._id, hospital.name)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("delete", language)}
                  </Button>
               </div>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-8">
           <Button
             variant="outline"
             onClick={() => setPage(prev => prev + 1)}
             disabled={loading}
             className="h-14 px-10 rounded-2xl font-black border-2 border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95"
           >
             {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
             {loading ? t("loading", language) : (language === 'bn' ? 'আরও লোড করুন' : 'Load More')}
           </Button>
        </div>
      )}
    </div>
  );
}
