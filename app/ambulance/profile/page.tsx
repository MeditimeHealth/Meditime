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
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { showToast } from "@/lib/toast";

const ambulanceSchema = z.object({
  name: z.string().min(2, "Name/Company is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),
  availabilityStatus: z.enum(["Available", "Unavailable", "On Call"], {
    message: "Availability status is required",
  }),
  vehicleType: z.enum(["Basic Life Support", "Advanced Life Support", "Critical Care", "Air Ambulance"], {
    message: "Vehicle type is required",
  }),
});

type AmbulanceFormValues = z.infer<typeof ambulanceSchema>;

export default function AmbulanceProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<any>(null);
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
    formState: { errors },
  } = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      availabilityStatus: "Available",
    },
  });

  // Fetch existing profile
  const fetchExistingProfile = async (userId: string) => {
    try {
      const response = await fetch("/api/ambulances?admin=true");
      const data = await response.json();
      if (data.ambulances) {
        const profile = data.ambulances.find((amb: any) => amb.userId === userId);
        if (profile) {
          setExistingProfile(profile);
          // Pre-fill form with existing data
          setValue("name", profile.name || "");
          setValue("phoneNumber", profile.phoneNumber || "");
          setValue("division", profile.division || "");
          setValue("district", profile.district || "");
          setValue("thana", profile.thana || "");
          setValue("availabilityStatus", profile.availabilityStatus as any);
          setValue("vehicleType", profile.vehicleType as any);
        }
      }
    } catch {
      // Silently fail - profile might not exist yet
    }
  };

  // Authentication check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          const userType = parsedUser.userType || parsedUser.role;
          
          // Check if user is an ambulance
          if (userType === 'ambulance') {
            setUser(parsedUser);
            // Fetch existing profile if any
            fetchExistingProfile(parsedUser.id);
          } else {
            showToast.error("Access denied. This page is for ambulance services only.");
            router.push("/login");
          }
        } catch {
          showToast.error("Please login to continue");
          router.push("/login");
        }
      } else {
        showToast.error("Please login to access this page");
        router.push("/login");
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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

  // Pre-fill form with user data (only if no existing profile)
  useEffect(() => {
    if (user && !existingProfile) {
      setValue("name", user.fullName || "");
      setValue("phoneNumber", user.phoneNumber || "");
    }
  }, [user, existingProfile, setValue]);

  const onSubmit = async (data: AmbulanceFormValues) => {
    if (!user) {
      showToast.error("Please login first");
      router.push("/login");
      return;
    }

    // If profile exists, update it instead of creating new
    const isUpdate = existingProfile !== null;

    setIsLoading(true);
    try {
      const url = isUpdate ? `/api/ambulances/${existingProfile._id}` : "/api/ambulances";
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: user.id,
          isApproved: isUpdate ? existingProfile.isApproved : false,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (isUpdate) {
          showToast.success("Ambulance service profile updated successfully!");
          fetchExistingProfile(user.id);
        } else {
          showToast.success("Ambulance service profile submitted successfully! Waiting for admin approval.");
          router.push("/");
        }
      } else {
        showToast.error(result.error || `Failed to ${isUpdate ? 'update' : 'create'} ambulance service profile`);
      }
    } catch {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50 py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {existingProfile ? "Update Ambulance Service" : "Create Ambulance Service"}
            </h1>
            <p className="text-gray-600 mt-2">
              {existingProfile 
                ? "Update your ambulance service profile information" 
                : "Add a new ambulance service to the system"}
            </p>
            {existingProfile && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  existingProfile.isApproved 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {existingProfile.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
                </span>
              </div>
            )}
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">
                    Name/Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ambulance Service Name"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    placeholder="+1234567890"
                    className="mt-1"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vehicleType">
                    Vehicle Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="vehicleType"
                    {...register("vehicleType")}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Basic Life Support">Basic Life Support</option>
                    <option value="Advanced Life Support">Advanced Life Support</option>
                    <option value="Critical Care">Critical Care</option>
                    <option value="Air Ambulance">Air Ambulance</option>
                  </select>
                  {errors.vehicleType && (
                    <p className="text-sm text-red-500 mt-1">{errors.vehicleType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="availabilityStatus">
                    Availability Status <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="availabilityStatus"
                    {...register("availabilityStatus")}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                    <option value="On Call">On Call</option>
                  </select>
                  {errors.availabilityStatus && (
                    <p className="text-sm text-red-500 mt-1">{errors.availabilityStatus.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="mb-2 block font-semibold text-gray-900">
                    Location
                  </Label>
                </div>

                <div>
                  <Label htmlFor="division">Division</Label>
                  <select
                    id="division"
                    {...register("division")}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    onChange={(e) => {
                      setValue("division", e.target.value);
                      setValue("district", "");
                      setValue("thana", "");
                    }}
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div._id} value={div.name}>
                        {div.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="district">District</Label>
                  <select
                    id="district"
                    {...register("district")}
                    disabled={!watchedDivision}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    onChange={(e) => {
                      setValue("district", e.target.value);
                      setValue("thana", "");
                    }}
                  >
                    <option value="">Select District</option>
                    {districts.map((dist) => (
                      <option key={dist._id} value={dist.name}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="thana">Thana/Upazila</Label>
                  <select
                    id="thana"
                    {...register("thana")}
                    disabled={!watchedDistrict || !watchedDivision}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                  >
                    <option value="">Select Thana</option>
                    {thanas.map((thana) => (
                      <option key={thana._id} value={thana.name}>
                        {thana.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading 
                    ? (existingProfile ? "Updating..." : "Submitting...") 
                    : (existingProfile ? "Update Ambulance Service" : "Create Ambulance Service")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

