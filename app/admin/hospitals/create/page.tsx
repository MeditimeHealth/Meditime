"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Globe } from "lucide-react";
import { showToast } from "@/lib/toast";
import Link from "next/link";

const hospitalSchema = z.object({
  name: z.string().min(1, "Hospital name is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  thana: z.string().min(1, "Thana is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  
  // Bangla Fields
  nameBn: z.string().min(1, "বাংলা নাম আবশ্যক"),
  addressBn: z.string().min(1, "বাংলা ঠিকানা আবশ্যক"),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

export default function CreateHospitalPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setFormLanguage] = useState<'en' | 'bn'>('en');
  const router = useRouter();
  const { language: currentLanguage } = useLanguage();

  // Location state
  const [divisions, setDivisions] = useState<Array<{_id: string; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{_id: string; name: string}>>([]);
  const [thanas, setThanas] = useState<Array<{_id: string; name: string}>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
        name: "",
        nameBn: "",
        address: "",
        addressBn: "",
        phone: "",
        division: "",
        district: "",
        thana: ""
    }
  });

  const watchedDivision = watch("division");
  const watchedDistrict = watch("district");

  // Fetch divisions on mount
  useEffect(() => {
    fetch("/api/locations/divisions")
      .then((res) => res.json())
      .then((data) => {
        if (data.divisions) setDivisions(data.divisions);
      });
  }, []);

  // Fetch districts when division changes
  useEffect(() => {
    if (watchedDivision) {
      const division = divisions.find(d => d.name === watchedDivision);
      if (division) {
        fetch(`/api/locations/districts?division=${division._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.districts) setDistricts(data.districts);
          });
      }
      setValue("district", "");
      setValue("thana", "");
      setThanas([]);
    }
  }, [watchedDivision, divisions, setValue]);

  // Fetch thanas when district changes
  useEffect(() => {
    if (watchedDistrict) {
      const district = districts.find(d => d.name === watchedDistrict);
      if (district) {
        fetch(`/api/locations/thanas?district=${district._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.thanas) setThanas(data.thanas);
          });
      }
      setValue("thana", "");
    }
  }, [watchedDistrict, districts, setValue]);

  const onSubmit = async (data: HospitalFormValues) => {
    setIsLoading(true);
    try {
      // Find the thana ID based on the selected name
      const selectedThana = thanas.find(t => t.name === data.thana);
      
      if (!selectedThana) {
        showToast.error("Invalid location selection");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/locations/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          thana: selectedThana._id
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Hospital created successfully!");
        router.push("/admin/hospitals");
        router.refresh();
      } else {
        showToast.error(result.error || "Failed to create hospital");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="rounded-xl border-2 hover:bg-gray-50 bg-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back", currentLanguage)}
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t("addHospital", currentLanguage)}</h1>
          <p className="text-gray-500 mt-1 text-lg font-medium">{currentLanguage === 'bn' ? 'সিস্টেমে একটি নতুন হাসপাতাল যোগ করুন' : 'Register a new hospital in the system'}</p>
        </div>
      </div>

      <Card className="p-8 bg-white border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4">
        <div className="flex justify-end mb-8">
           <div className="relative inline-block w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <select
                value={language}
                onChange={(e) => setFormLanguage(e.target.value as 'en' | 'bn')}
                className="block w-full pl-10 pr-10 py-2.5 text-sm font-bold bg-gray-50 border-2 border-gray-100 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-inner"
              >
                <option value="en">English (ENG)</option>
                <option value="bn">বাংলা (BNG)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-bold text-gray-700">
                {t("hospitalName", currentLanguage)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. GreenLife Hospital"
                className={`h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 font-bold underline decoration-dotted">{errors.name.message}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="nameBn" className="text-base font-bold text-gray-700">
                {t("nameBn", currentLanguage)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nameBn"
                {...register("nameBn")}
                placeholder="হাসপাতালের নাম লিখুন"
                className={`h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl ${errors.nameBn ? 'border-red-500' : ''}`}
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
              {errors.nameBn && <p className="text-xs text-red-500 font-bold underline decoration-dotted">{errors.nameBn.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-bold text-gray-700">
              {t("location", currentLanguage)} <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <select
                  {...register("division")}
                  className={`w-full h-12 px-4 rounded-xl border-2 bg-white text-lg focus:ring-primary focus:border-primary outline-none transition-all ${errors.division ? 'border-red-500' : 'border-gray-100'}`}
                  onChange={(e) => {
                    setValue("division", e.target.value);
                    setValue("district", "");
                    setValue("thana", "");
                  }}
                >
                  <option value="">{t("selectDivision", currentLanguage)}</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div.name}>{div.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <select
                  {...register("district")}
                  disabled={!watchedDivision}
                  className={`w-full h-12 px-4 rounded-xl border-2 bg-white text-lg focus:ring-primary focus:border-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 ${errors.district ? 'border-red-500' : 'border-gray-100'}`}
                  onChange={(e) => {
                    setValue("district", e.target.value);
                    setValue("thana", "");
                  }}
                >
                  <option value="">{t("selectDistrict", currentLanguage)}</option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist.name}>{dist.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <select
                  {...register("thana")}
                  disabled={!watchedDistrict}
                  className={`w-full h-12 px-4 rounded-xl border-2 bg-white text-lg focus:ring-primary focus:border-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400 ${errors.thana ? 'border-red-500' : 'border-gray-100'}`}
                >
                  <option value="">{t("selectThana", currentLanguage)}</option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>{thana.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {(errors.division || errors.district || errors.thana) && (
               <p className="text-xs text-red-500 font-bold underline decoration-dotted">
                 {currentLanguage === 'bn' ? 'অবস্থান নির্বাচন করা আবশ্যক' : 'Location selection is required'}
               </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="address" className="text-base font-bold text-gray-700">
                {t("address", currentLanguage)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="123 Health Ave, Dhaka"
                className={`h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && <p className="text-xs text-red-500 font-bold underline decoration-dotted">{errors.address.message}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="addressBn" className="text-base font-bold text-gray-700">
                {t("addressBn", currentLanguage)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="addressBn"
                {...register("addressBn")}
                placeholder="হাসপাতালের ঠিকানা"
                className={`h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl ${errors.addressBn ? 'border-red-500' : ''}`}
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
              {errors.addressBn && <p className="text-xs text-red-500 font-bold underline decoration-dotted">{errors.addressBn.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-base font-bold text-gray-700">
              {t("contactNo", currentLanguage)} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+880123456789"
              className={`h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && <p className="text-xs text-red-500 font-bold underline decoration-dotted">{errors.phone.message}</p>}
          </div>

          <div className="flex gap-4 pt-8 border-t border-gray-100">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("saving", currentLanguage)}
                </>
              ) : (
                t("create", currentLanguage)
              )}
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12 text-lg font-bold border-2 rounded-xl transition-all hover:bg-gray-50"
            >
              {t("cancel", currentLanguage)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
