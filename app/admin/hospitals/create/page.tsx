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
import { Loader2, ArrowLeft } from "lucide-react";
import { showToast } from "@/lib/toast";
import Link from "next/link";

const hospitalSchema = z.object({
  name: z.string().min(2, "Hospital name is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  thana: z.string().min(1, "Thana is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  
  // Bangla Fields
  nameBn: z.string().optional(),
  addressBn: z.string().optional(),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

export default function CreateHospitalPage() {
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Location state
  const [divisions, setDivisions] = useState<Array<{_id: string; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{_id: string; name: string}>>([]);
  const [thanas, setThanas] = useState<Array<{_id: string; name: string}>>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: "",
      division: "",
      district: "",
      thana: "",
      address: "",
      phone: "",
    },
  });

  const watchedDivision = watch("division");
  const watchedDistrict = watch("district");

  // Fetch divisions on mount
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await fetch("/api/locations/divisions");
        const data = await res.json();
        if (data.divisions) setDivisions(data.divisions);
      } catch (error) {
        console.error("Error fetching divisions:", error);
      }
    };
    fetchDivisions();
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
          })
          .catch(err => console.error("Error fetching districts:", err));
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
          })
          .catch(err => console.error("Error fetching thanas:", err));
      }
      setValue("thana", "");
    }
  }, [watchedDistrict, districts, setValue]);

  const onSubmit = async (data: HospitalFormValues) => {
    setIsLoading(true);
    try {
      // Find the thana ID based on the selected name
      // Find the thana ID based on the selected name
      const selectedThana = thanas.find(t => t.name === data.thana);
      
      if (!selectedThana && data.thana) {
        // If thana is selected (it is required by schema), we must find it. 
        // Note: The schema for thana above is strict, so maybe this check is redundant if schema validation passes, 
        // effectively protecting against logic errors.
        showToast.error("Invalid location selection");
        setIsLoading(false);
        return;
      }
 
      const response = await fetch("/api/locations/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          thana: selectedThana?._id,
          address: data.address,
          phone: data.phone,
          
          nameBn: data.nameBn,
          addressBn: data.addressBn,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Hospital added successfully!");
        router.push("/admin/hospitals");
      } else {
        showToast.error(result.error || "Failed to add hospital");
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
        <Link href="/admin/hospitals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Hospital Info</h1>
          <p className="text-gray-600 mt-1">Register a new hospital in the system</p>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <div className="flex justify-end mb-6">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                language === 'bn'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Bangla
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          {language === 'en' ? (
            <>
              <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                Hospital Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Name"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </>
          ) : (
             <>
              <Label htmlFor="nameBn" className="text-base font-semibold text-gray-700">
                হাসপাতালের নাম (Name Bangla)
              </Label>
              <Input
                id="nameBn"
                {...register("nameBn")}
                placeholder="নাম"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">
            Location <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <select
                {...register("division")}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
              >
                <option value="">By Division</option>
                {divisions.map((div) => (
                  <option key={div._id} value={div.name}>
                    {div.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select
                {...register("district")}
                disabled={!watchedDivision}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">By District</option>
                {districts.map((dist) => (
                  <option key={dist._id} value={dist.name}>
                    {dist.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <div className="relative">
              <select
                {...register("thana")}
                disabled={!watchedDistrict}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">By Thana</option>
                {thanas.map((thana) => (
                  <option key={thana._id} value={thana.name}>
                    {thana.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          {errors.division && <p className="text-sm text-red-500 mt-1">Division is required</p>}
          {!errors.division && errors.district && <p className="text-sm text-red-500 mt-1">District is required</p>}
          {!errors.division && !errors.district && errors.thana && <p className="text-sm text-red-500 mt-1">Thana is required</p>}
        </div>

        <div className="space-y-2">
          {language === 'en' ? (
            <>
              <Label htmlFor="address" className="text-base font-semibold text-gray-700">
                Hospital Address
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Hospital Address"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
            </>
          ) : (
             <>
              <Label htmlFor="addressBn" className="text-base font-semibold text-gray-700">
                হাসপাতালের ঠিকানা (Address Bangla)
              </Label>
              <Input
                id="addressBn"
                {...register("addressBn")}
                placeholder="হাসপাতালের ঠিকানা"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-semibold text-gray-700">
            Hospital contact no
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+880123456789"
            className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <Link href="/admin/hospitals" className="flex-1 md:flex-initial">
            <Button 
              type="button"
              variant="outline"
              className="w-full md:w-auto px-8 py-3"
            >
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            className="flex-1 md:flex-initial px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Hospital Info"
            )}
          </Button>
        </div>
      </form>
      </Card>
    </div>
  );
}
