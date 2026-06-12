"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

const bloodDonorSchema = z.object({
  name: z.string().optional(),
  nameBn: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number is required"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    message: "Blood group is required",
  }),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),
  availabilityStatus: z.enum(["Available", "Unavailable", "Recently Donated"], {
    message: "Availability status is required",
  }),
  isApproved: z.boolean().default(true),
});

type BloodDonorFormValues = z.infer<typeof bloodDonorSchema>;

export default function CreateBloodDonorPage() {
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
  } = useForm<BloodDonorFormValues>({
    resolver: zodResolver(bloodDonorSchema) as any,
    defaultValues: {
      availabilityStatus: "Available",
      isApproved: true,
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

  const onSubmit = async (data: BloodDonorFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/blood-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Blood donor created successfully!");
        router.push("/admin/blood-donors");
        router.refresh();
      } else {
        showToast.error(result.error || "Failed to create blood donor");
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
          <h1 className="text-2xl font-bold text-gray-900">{t("createBloodDonor", language)}</h1>
          <p className="text-gray-600 mt-1">
            {language === 'bn' ? 'সিস্টেমে একজন নতুন রক্তদাতা যোগ করুন' : 'Add a new blood donor to the system'}
          </p>
        </div>
      </div>

      <Card className="p-6 bg-white">
        {/* Language Toggle */}
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
            {/* Name (English) */}
            <div className={language === 'en' ? 'block space-y-2' : 'hidden'}>
              <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                {language === 'bn' ? 'পূর্ণ নাম (English)' : 'Full Name (English)'}
                <span className="text-gray-400 text-sm ml-1">(Optional)</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="John Doe"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Name (Bangla) */}
            <div className={language === 'bn' ? 'block space-y-2' : 'hidden'}>
              <Label htmlFor="nameBn" className="text-base font-semibold text-gray-700">
                {language === 'bn' ? 'পূর্ণ নাম (বাংলা)' : 'Full Name (বাংলা)'}
                <span className="text-gray-400 text-sm ml-1">(Optional)</span>
              </Label>
              <Input
                id="nameBn"
                {...register("nameBn")}
                placeholder="জন ডো"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold text-gray-700">
                {t("phone", language)} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="+880"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="text-base font-semibold text-gray-700">
                {t("bloodGroup", language)} <span className="text-red-500">*</span>
              </Label>
              <select
                id="bloodGroup"
                {...register("bloodGroup")}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
              >
                <option value="">{t("selectBloodGroup", language)}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodGroup && (
                <p className="text-sm text-red-500">{errors.bloodGroup.message}</p>
              )}
            </div>

            {/* Availability Status */}
            <div className="space-y-2">
              <Label htmlFor="availabilityStatus" className="text-base font-semibold text-gray-700">
                {t("availabilityStatus", language)} <span className="text-red-500">*</span>
              </Label>
              <select
                id="availabilityStatus"
                {...register("availabilityStatus")}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
              >
                <option value="Available">{language === 'bn' ? 'উপলব্ধ' : 'Available'}</option>
                <option value="Unavailable">{language === 'bn' ? 'অনুপলব্ধ' : 'Unavailable'}</option>
                <option value="Recently Donated">{language === 'bn' ? 'সম্প্রতি রক্ত দিয়েছেন' : 'Recently Donated'}</option>
              </select>
              {errors.availabilityStatus && (
                <p className="text-sm text-red-500">{errors.availabilityStatus.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                {t("location", language)}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {/* Division */}
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

                {/* District */}
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

                {/* Thana */}
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
