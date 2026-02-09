"use client";

import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { showToast } from "@/lib/toast";
import Link from "next/link";

const hospitalSchema = z.object({
  name: z.string().optional(),
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

export default function EditHospitalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        
        // 1. Fetch Hospital Data
        const hospitalRes = await fetch(`/api/locations/hospitals/${id}`);
        const hospitalData = await hospitalRes.json();
        
        if (!hospitalRes.ok) {
          showToast.error(hospitalData.error || "Failed to fetch hospital");
          router.push("/admin/hospitals");
          return;
        }

        const hospital = hospitalData.hospital;

        // 2. Fetch Divisions
        const divisionsRes = await fetch("/api/locations/divisions");
        const divisionsData = await divisionsRes.json();
        if (divisionsData.divisions) setDivisions(divisionsData.divisions);

        // 3. Populate Form & Fetch Dependencies
        setValue("name", hospital.name || "");
        setValue("nameBn", hospital.nameBn || "");
        setValue("address", hospital.address || "");
        setValue("addressBn", hospital.addressBn || "");
        setValue("phone", hospital.phone || "");

        if (hospital.thana) {
           const thanaName = hospital.thana.name;
           const districtName = hospital.thana.district?.name;
           const divisionName = hospital.thana.district?.division?.name;
           const districtId = hospital.thana.district?._id;
           const divisionId = hospital.thana.district?.division?._id;

           if (divisionName) {
             setValue("division", divisionName);
             
             // Fetch Districts for this division
             if (divisionId) {
               const districtsRes = await fetch(`/api/locations/districts?division=${divisionId}`);
               const districtsData = await districtsRes.json();
               if (districtsData.districts) setDistricts(districtsData.districts);
             }
           }

           if (districtName) {
             setValue("district", districtName);
             
             // Fetch Thanas for this district
             if (districtId) {
               const thanasRes = await fetch(`/api/locations/thanas?district=${districtId}`);
               const thanasData = await thanasRes.json();
               if (thanasData.thanas) setThanas(thanasData.thanas);
             }
           }

           if (thanaName) {
             setValue("thana", thanaName);
           }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        showToast.error("Failed to load data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id, router, setValue]); // Run once on mount (and id change)

  // Handle Division Change (User Interaction)
  useEffect(() => {
    if (!isFetching && watchedDivision) {
      const division = divisions.find(d => d.name === watchedDivision);
      if (division) {
        fetch(`/api/locations/districts?division=${division._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.districts) setDistricts(data.districts);
          })
          .catch(err => console.error("Error fetching districts:", err));
      }
    }
  }, [watchedDivision, divisions, isFetching]);

  const [previousDivision, setPreviousDivision] = useState("");
  const [previousDistrict, setPreviousDistrict] = useState("");

  useEffect(() => {
      if(isFetching) {
          setPreviousDivision(watchedDivision);
          return;
      }
      
      if (watchedDivision !== previousDivision && previousDivision !== "") {
          // User changed division
          setValue("district", "");
          setValue("thana", "");
          setThanas([]);
          
          const division = divisions.find(d => d.name === watchedDivision);
          if (division) {
             fetch(`/api/locations/districts?division=${division._id}`)
               .then((res) => res.json())
               .then((data) => {
                 if (data.districts) setDistricts(data.districts);
               });
          } else {
              setDistricts([]);
          }
      }
      setPreviousDivision(watchedDivision);
  }, [watchedDivision, isFetching, divisions, setValue, previousDivision]);


  useEffect(() => {
      if(isFetching) {
          setPreviousDistrict(watchedDistrict);
          return;
      }

      if (watchedDistrict !== previousDistrict && previousDistrict !== "") {
          // User changed district
          setValue("thana", "");
          
          const district = districts.find(d => d.name === watchedDistrict);
          if (district) {
             fetch(`/api/locations/thanas?district=${district._id}`)
               .then((res) => res.json())
               .then((data) => {
                 if (data.thanas) setThanas(data.thanas);
               });
          } else {
              setThanas([]);
          }
      }
      setPreviousDistrict(watchedDistrict);
  }, [watchedDistrict, isFetching, districts, setValue, previousDistrict]);


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

      const response = await fetch(`/api/locations/hospitals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          thana: selectedThana._id,
          address: data.address,
          phone: data.phone,
          nameBn: data.nameBn,
          addressBn: data.addressBn,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Hospital updated successfully!");
        router.push("/admin/hospitals");
      } else {
        showToast.error(result.error || "Failed to update hospital");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">{t("loading", language)}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back", language)}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("editHospital", language)}</h1>
          <p className="text-gray-600 mt-1">{language === 'bn' ? 'হাসপাতালের তথ্য আপডেট করুন' : 'Update hospital information'}</p>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
              বাংলা
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {language === 'en' ? (
            <>
              <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                {t("hospitalName", language)} <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="GreenLife Hospital"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
            </>
          ) : (
            <>
              <Label htmlFor="nameBn" className="text-base font-semibold text-gray-700">
                {t("nameBn", language)} <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                id="nameBn"
                {...register("nameBn")}
                placeholder="হাসপাতালের নাম লিখুন"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold text-gray-700">
            {t("location", language)} <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <select
                {...register("division")}
                className="w-full p-3 text-base border border-gray-200 rounded-lg appearance-none bg-white focus:ring-primary focus:border-primary text-gray-500"
              >
                <option value="">{t("selectDivision", language)}</option>
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
                <option value="">{t("selectDistrict", language)}</option>
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
                <option value="">{t("selectThana", language)}</option>
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
                {t("address", language)} <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="123 Health Ave, Dhaka"
                className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              />
            </>
          ) : (
            <>
              <Label htmlFor="addressBn" className="text-base font-semibold text-gray-700">
                {t("addressBn", language)} <span className="text-gray-400 text-sm">(Optional)</span>
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
            {t("contactNo", language)}
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+880123456789"
            className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="pt-4 flex gap-3">
          <Button 
            type="button"
            variant="outline"
            className="flex-1 md:flex-initial px-8 py-3"
            onClick={() => router.back()}
          >
            {t("cancel", language)}
          </Button>
          <Button 
            type="submit" 
            className="flex-1 md:flex-initial px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("updating", language)}
              </>
            ) : (
              t("update", language)
            )}
          </Button>
        </div>
        </form>
      </Card>
    </div>
  );
}
