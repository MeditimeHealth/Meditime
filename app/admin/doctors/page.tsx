"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Loader2, Stethoscope, Phone, Award, Briefcase, Calendar, Clock } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Input } from "@/components/ui/input";

interface Doctor {
  _id: string;
  name: string;
  specialty?: string;
  qualification: string;
  designation?: string;
  phoneNumber?: string;
  consultationFee: number;
  slotDuration?: number;
  availability: Array<{
    days: string[];
    time: string;
  }> | {
    days: string[];
    time: string;
  };
  nameBn?: string;
  specialtyBn?: string;
  qualificationBn?: string;
  designationBn?: string;
  image?: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const daysMapBn: Record<string, string> = {
    "Saturday": "শনি",
    "Sunday": "রবি",
    "Monday": "সোম",
    "Tuesday": "মঙ্গল",
    "Wednesday": "বুধ",
    "Thursday": "বৃহস্পতি",
    "Friday": "শুক্র"
  };

  useEffect(() => {
    fetchDoctors();
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
      showToast.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এই ডিটেইলসটি মুছে ফেলতে চান?" : "Are you sure you want to delete this doctor profile?")) return;

    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDoctors(doctors.filter((doctor) => doctor._id !== id));
        showToast.success("Doctor deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete doctor");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      showToast.error("Failed to delete doctor");
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.nameBn?.includes(searchQuery) ||
    doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialtyBn?.includes(searchQuery)
  );

  if (loading && doctors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {t("manageDoctors", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {language === 'bn' ? 'ডাক্তারদের প্রোফাইল এবং সিরিয়াল পরিচালনা করুন' : 'Administrative control panel for medical professionals'}
          </p>
        </div>
        <Link href="/admin/doctors/create">
          <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-7 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-6 w-6 mr-2" />
            {t("createDoctorProfile", language)}
          </Button>
        </Link>
      </div>

      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <Input
          type="text"
          placeholder={language === 'bn' ? 'ডাক্তারের নাম বা বিশেষজ্ঞ দিয়ে খুঁজুন...' : 'Search by name or specialty...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 text-lg border-2 border-gray-100 rounded-2xl bg-white shadow-sm focus:ring-primary focus:border-primary transition-all pr-4 font-bold"
        />
      </div>

      {filteredDoctors.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-[2.5rem]">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white p-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto shadow-md">
              <Stethoscope className="h-14 w-14 text-gray-200" />
            </div>
            <p className="text-gray-500 text-2xl font-black tracking-tight">
              {doctors.length === 0 ? t("noDoctors", language) : (language === 'bn' ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors match your search')}
            </p>
            {doctors.length === 0 && (
              <Link href="/admin/doctors/create">
                <Button className="bg-primary text-white h-16 px-10 text-xl font-black rounded-2xl shadow-xl shadow-primary/10">
                  <Plus className="h-6 w-6 mr-2" />
                  {t("createFirstDoctor", language)}
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-8 space-y-6 flex-1">
                <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 group-hover:ring-primary/20 transition-all">
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                           <Stethoscope className="h-8 w-8 text-primary/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                      {getLocalizedValue(doctor.name, doctor.nameBn, language)}
                    </h3>
                    <p className="text-primary font-bold text-sm mt-1 flex items-center">
                       <Award className="h-3.5 w-3.5 mr-1.5" />
                       {getLocalizedValue(doctor.specialty, doctor.specialtyBn, language)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-xs font-black uppercase text-gray-400 tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                          {language === 'bn' ? 'আইডি' : 'ID'}: {doctor._id.slice(-6)}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-primary/5 transition-all">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div className="text-sm font-bold text-gray-600">
                      {getLocalizedValue(doctor.designation, doctor.designationBn, language)}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Award className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-tight">
                       {getLocalizedValue(doctor.qualification, doctor.qualificationBn, language)}
                    </div>
                  </div>

                  {doctor.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-green-500 shrink-0" />
                      <div className="text-sm font-black text-gray-700">{doctor.phoneNumber}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("consultationFee", language)}</div>
                    <div className="text-xl font-black text-primary">৳{doctor.consultationFee}</div>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      {t("availability", language)}
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(doctor.availability) ? (
                        doctor.availability.map((slot, idx) => (
                          <div key={idx} className="px-2.5 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-500 shadow-sm group-hover:border-primary/10 transition-all">
                            {slot.days.map(d => language === 'bn' ? (daysMapBn[d] || d) : d.slice(0,3)).join(", ")} | {slot.time}
                          </div>
                        ))
                      ) : (
                        <div className="px-2.5 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-500 shadow-sm">
                           {doctor.availability.days.map(d => language === 'bn' ? (daysMapBn[d] || d) : d.slice(0,3)).join(", ")} | {doctor.availability.time}
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="flex gap-1 p-4 bg-gray-50 border-t border-gray-100">
                <Link href={`/admin/doctors/edit/${doctor._id}`} className="flex-1">
                  <Button variant="ghost" className="w-full h-12 font-black text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl">
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit", language)}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 font-black text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                  onClick={() => handleDelete(doctor._id)}
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
