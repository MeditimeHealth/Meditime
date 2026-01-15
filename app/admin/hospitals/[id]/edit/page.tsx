"use client";

import { useState, useEffect, use } from "react";
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
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

export default function EditHospitalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
        setValue("name", hospital.name);
        setValue("address", hospital.address || "");
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
        // Only fetch if we are not already in a valid state or if user changed it
        // To distinguish between initial load and user change, we use isFetching
        // But isFetching covers the whole setup.
        // If user changes division, we MUST clear district and thana.
        // We need to check if the current district belongs to the new division, if not clear it.
        // Actually, easiest is: if user changes division, fetch new districts.
        // But how to detect "user change" vs "initial load"?
        // The initial load sets `division` which triggers this.
        // But in initial load, we might have already fetched districts manually.
        // Let's rely on checking if districts list is empty or matches current division?
        // Simpler: Just rely on the user manually changing it after initial load.
        // But this effect runs whenever watchedDivision changes.
        // During initial load, setValue('division') runs this.
        // We can skip this effect if isFetching is true.
        
        fetch(`/api/locations/districts?division=${division._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.districts) setDistricts(data.districts);
             // Verify if current district is valid for new list
             // If not, clear it.
             // Since we just fetched new districts, we can't check easily synchronously.
             // But if it's a user change, we usually want to reset.
             // If it's initial load, we set the correct district right after.
             // Wait, if I fetch districts here, I might overwrite the `setDistricts` from initial load?
             // Initial load:
             // 1. setDivisions
             // 2. setValue('division') -> Triggers Effect? YES.
             // 3. Effect checks isFetching. If isFetching is True, we return?
             // YES. We should return if isFetching is true.
          })
          .catch(err => console.error("Error fetching districts:", err));
      }
    }
  }, [watchedDivision, divisions]); // removed isFetching dependency to not re-run when it settles? 
  // No, if isFetching changes to false, and watchedDivision is set... it might run?
  // Let's check:
  // Initial load sets values. isFetching = true.
  // Effect runs. isFetching is true. Returns.
  // Async operations finish. isFetching = false.
  // Effect dependencies haven't changed (unless references changed).
  // watchedDivision value is stable.
  // So it shouldn't run again until user changes it.
  
  // Wait, if I setValue('division'), it runs.
  // If isFetching=true, it skips.
  // Then isFetching sets to false.
  // Does effect run again? No, dependencies didn't change.
  // So this logic holds IF `isFetching` is correctly covering the setValue calls.

  // BUT, we need to handle the case where user changes division.
  // We need to clear district and thana in that case.
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
  }, [watchedDivision, isFetching, divisions, setValue]);


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
  }, [watchedDistrict, isFetching, districts, setValue]);


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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading hospital data...</span>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Hospital Info</h1>
          <p className="text-gray-600 mt-1">Update hospital information</p>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
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
          <Label htmlFor="address" className="text-base font-semibold text-gray-700">
            Hospital Address
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Hospital Address"
            className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
          />
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
                Updating...
              </>
            ) : (
              "Update Hospital Info"
            )}
          </Button>
        </div>
      </form>
      </Card>
    </div>
  );
}
