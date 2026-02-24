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
import { ArrowLeft, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";

const ambulanceSchema = z.object({
  name: z.string().min(2, "Name/Company is required"),
  nameBn: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number is required"),
  ambulanceNumber: z.string().min(1, "Ambulance number is required"),
  drivingLicence: z.string().min(1, "Driving licence is required"),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),
  availabilityStatus: z.enum(["Available", "Unavailable", "On Call"], {
    message: "Availability status is required",
  }),
  vehicleType: z.enum(
    [
      "Basic Life Support",
      "Advanced Life Support",
      "Critical Care",
      "Air Ambulance",
    ],
    {
      message: "Vehicle type is required",
    },
  ),
});

type AmbulanceFormValues = z.infer<typeof ambulanceSchema>;

export default function CreateAmbulancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const router = useRouter();

  // Location state
  const [divisions, setDivisions] = useState<Array<{ _id: string; name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ _id: string; name: string }>>([]);
  const [thanas, setThanas] = useState<Array<{ _id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      availabilityStatus: "Available",
    },
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
      const division = divisions.find((d) => d.name === watchedDivision);
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
      const district = districts.find((d) => d.name === watchedDistrict);
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

  const onSubmit = async (data: AmbulanceFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ambulances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Ambulance created successfully!");
        router.push("/admin/ambulances");
        router.refresh();
      } else {
        showToast.error(result.error || "Failed to create ambulance");
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
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back", language)}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("createAmbulance", language)}</h1>
          <p className="text-gray-600 mt-1">{language === 'bn' ? 'সিস্টেমে একটি নতুন অ্যাম্বুলেন্স সার্ভিস যোগ করুন' : 'Add a new ambulance service to the system'}</p>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <div className="flex justify-end mb-8">
          <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-primary shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                language === 'bn'
                  ? 'bg-white text-primary shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={language === 'en' ? 'block space-y-2' : 'hidden'}>
              <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                {t("ambulanceServiceName", language)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ambulance Service Name"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className={language === 'bn' ? 'block space-y-2' : 'hidden'}>
              <Label htmlFor="nameBn" className="text-base font-semibold text-gray-700">
                {t("nameBn", language)} <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                id="nameBn"
                {...register("nameBn")}
                placeholder="অ্যাম্বুলেন্স সার্ভিসের নাম লিখুন"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold text-gray-700">
                {t("phone", language)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="+880123456789"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ambulanceNumber" className="text-base font-semibold text-gray-700">
                {t("ambulanceNo", language)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ambulanceNumber"
                {...register("ambulanceNumber")}
                placeholder="e.g. Dhaka-MET-11-1234"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              {errors.ambulanceNumber && (
                <p className="text-sm text-red-500">{errors.ambulanceNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="drivingLicence" className="text-base font-semibold text-gray-700">
                {t("drivingLicence", language)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="drivingLicence"
                {...register("drivingLicence")}
                placeholder="e.g. 123456789"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              {errors.drivingLicence && (
                <p className="text-sm text-red-500">{errors.drivingLicence.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType" className="text-base font-semibold text-gray-700">
                {t("vehicleType", language)} <span className="text-red-500">*</span>
              </Label>
              <select
                id="vehicleType"
                {...register("vehicleType")}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
              >
                <option value="">{t("selectVehicleType", language)}</option>
                <option value="Basic Life Support">{t("basicLifeSupport", language)}</option>
                <option value="Advanced Life Support">{t("advancedLifeSupport", language)}</option>
                <option value="Critical Care">{t("criticalCare", language)}</option>
                <option value="Air Ambulance">{t("airAmbulance", language)}</option>
              </select>
              {errors.vehicleType && (
                <p className="text-sm text-red-500">{errors.vehicleType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availabilityStatus" className="text-base font-semibold text-gray-700">
                {t("availabilityStatus", language)} <span className="text-red-500">*</span>
              </Label>
              <select
                id="availabilityStatus"
                {...register("availabilityStatus")}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
              >
                <option value="Available">{t("available", language)}</option>
                <option value="Unavailable">{t("unavailable", language)}</option>
                <option value="On Call">{t("onCall", language)}</option>
              </select>
              {errors.availabilityStatus && (
                <p className="text-sm text-red-500">{errors.availabilityStatus.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label className="text-base font-semibold text-gray-700">
                {t("location", language)}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="relative">
                  <select
                    id="division"
                    {...register("division")}
                    className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
                    onChange={(e) => {
                      setValue("division", e.target.value);
                      setValue("district", "");
                      setValue("thana", "");
                    }}
                  >
                    <option value="">{t("selectDivision", language)}</option>
                    {divisions.map((div) => (
                      <option key={div._id} value={div.name}>{div.name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    id="district"
                    {...register("district")}
                    disabled={!watchedDivision}
                    className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500 disabled:bg-gray-50 disabled:text-gray-400"
                    onChange={(e) => {
                      setValue("district", e.target.value);
                      setValue("thana", "");
                    }}
                  >
                    <option value="">{t("selectDistrict", language)}</option>
                    {districts.map((dist) => (
                      <option key={dist._id} value={dist.name}>{dist.name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <select
                    id="thana"
                    {...register("thana")}
                    disabled={!watchedDistrict}
                    className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="">{t("selectThana", language)}</option>
                    {thanas.map((thana) => (
                      <option key={thana._id} value={thana.name}>{thana.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("saving", language)}
                </>
              ) : (
                t("create", language)
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12 text-lg font-bold border-2 rounded-xl transition-all"
            >
              {t("cancel", language)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
