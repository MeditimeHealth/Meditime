"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Loader2, Stethoscope } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Input } from "@/components/ui/input";
import DoctorCard, { Doctor as DoctorType } from "@/components/doctor-card";


interface Hospital {
  _id: string;
  name: string;
  nameBn?: string;
}

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const banglaDaysFull = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const getBengaliDay = (day: string): string => {
    const dayIndex = daysOfWeek.indexOf(day);
    return dayIndex >= 0 ? banglaDaysFull[dayIndex] : day;
  };

  const areDaysConsecutive = (sortedDays: string[]): boolean => {
    if (sortedDays.length <= 1) return true;
    for (let i = 1; i < sortedDays.length; i++) {
      const prevIndex = daysOfWeek.indexOf(sortedDays[i - 1]);
      const currIndex = daysOfWeek.indexOf(sortedDays[i]);
      if (currIndex - prevIndex !== 1) return false;
    }
    return true;
  };

  const formatAvailability = (availability: any): string => {
    const slots = Array.isArray(availability) ? availability : [availability];
    return slots.map((slot) => {
      const sortedDays = (slot.days || []).sort((a: string, b: string) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
      if (!sortedDays.length) return "";
      
      const time = (language === 'bn' && slot.timeBn) ? slot.timeBn : (slot.time || "");
      const consecutive = areDaysConsecutive(sortedDays);
 
      
      if (sortedDays.length === 1) return `${getBengaliDay(sortedDays[0])} ${time}`;
      if (consecutive) {
        return `${getBengaliDay(sortedDays[0])} থেকে ${getBengaliDay(sortedDays[sortedDays.length - 1])} ${time}`;
      }
      return `${sortedDays.map((d: string) => getBengaliDay(d)).join(", ")} ${time}`;
    }).join("। ");
  };

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/locations/hospitals");
      const data = await response.json();
      if (response.ok && data.hospitals) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

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
    <div className="max-w-7xl mx-auto p-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-gray-100 pb-10">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            {t("manageDoctors", language)}
          </h1>
          <p className="text-gray-500 mt-3 text-xl font-medium">
            {language === 'bn' ? 'ডাক্তারদের প্রোফাইল এবং সিরিয়াল পরিচালনা করুন' : 'Administrative control panel for medical professionals'}
          </p>
        </div>
        <Link href="/admin/doctors/create">
          <Button className="bg-primary hover:bg-primary/90 text-white px-10 py-8 text-2xl font-black rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 border-none">
            <Plus className="h-7 w-7 mr-3 stroke-[3]" />
            {t("createDoctorProfile", language)}
          </Button>
        </Link>
      </div>

      <div className="relative group max-w-3xl">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-300 group-focus-within:text-primary transition-colors stroke-[2.5]" />
        </div>
        <Input
          type="text"
          placeholder={language === 'bn' ? 'ডাক্তারের নাম বা বিশেষজ্ঞ দিয়ে খুঁজুন...' : 'Search by name or specialty...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-16 h-16 text-xl border-2 border-gray-100 rounded-[1.5rem] bg-white shadow-lg shadow-gray-100/50 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pr-6 font-bold placeholder:text-gray-300"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredDoctors.map((doctor) => {
            const matchedHospital = hospitals.find(h => h.name === doctor.hospital);
            const enrichedDoctor = {
              ...doctor,
              hospitalBn: matchedHospital?.nameBn || doctor.hospitalBn || ""
            };
            
            return (
              <DoctorCard 
                key={doctor._id} 
                doctor={enrichedDoctor} 
                disableLink={true}
                actions={
                  <>
                    <Link href={`/admin/doctors/edit/${doctor._id}`} className="flex-1">
                      <Button variant="ghost" className="w-full h-10 font-bold text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border border-gray-100">
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit", language)}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-10 font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                      onClick={() => handleDelete(doctor._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("delete", language)}
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
