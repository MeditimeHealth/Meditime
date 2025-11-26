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
import { Loader2 } from "lucide-react";

const hospitalSchema = z.object({
  name: z.string().min(2, "Hospital name is required"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  thana: z.string().min(1, "Thana is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
});

type HospitalFormValues = z.infer<typeof hospitalSchema>;

export default function AddHospitalPage() {
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
      // Only reset if the value actually changed (this might be tricky with useEffect, 
      // but since we are watching the value, this runs when value changes)
      // We need to be careful not to reset if we are just loading existing data, 
      // but here we are creating new, so it's fine.
      // However, this runs on mount if default is empty string? No, empty string is falsy.
      // But if user selects a division, this runs.
      // We should probably check if the current district is valid for the new division?
      // Actually, simply resetting is safer when division changes.
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
      const selectedThana = thanas.find(t => t.name === data.thana);
      
      if (!selectedThana) {
        alert("Invalid location selection");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/locations/hospitals", {
        method: "POST",
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
        alert("Hospital added successfully!");
        reset();
      } else {
        alert(result.error || "Failed to add hospital");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add Hospital Info</h1>

      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-semibold text-gray-700">
            Hospital Name
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
            Location
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

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
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
