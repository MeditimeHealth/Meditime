"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save } from "lucide-react";
import toast from "react-hot-toast";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
  
  // Doctor Details
  hospital: z.string().optional(),
  specialty: z.string().optional(),
  qualification: z.string().optional(),


  reportShowFee: z.coerce.number().min(0, "Fee must be at least 0").optional(),
  newPatientFee: z.coerce.number().min(0, "Fee must be at least 0").optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),

  department: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DoctorProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hospital Search State
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [availableHospitals, setAvailableHospitals] = useState<string[]>([]);
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const [hospitalPage, setHospitalPage] = useState(1);
  const [hasMoreHospitals, setHasMoreHospitals] = useState(false);
  const [isHospitalLoading, setIsHospitalLoading] = useState(false);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [selectedHospitalName, setSelectedHospitalName] = useState("");
  const hospitalDropdownRef = useRef<HTMLDivElement>(null);
  const hospitalSearchInitialized = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      hospital: "",
      specialty: "",
      qualification: "",


      reportShowFee: 0,
      newPatientFee: 0,
      division: "",
      district: "",
      thana: "",

      department: "",
      bio: "",
      image: "",
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const fetchHospitals = async (searchValue: string = "", pageToLoad = 1) => {
    setIsHospitalLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchValue) {
        params.set("search", searchValue);
      }
      params.set("page", pageToLoad.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/locations/hospitals?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.hospitals) {
        setHospitals((prev) => {
          const nextHospitals =
            pageToLoad === 1
              ? data.hospitals
              : [
                  ...prev,
                  ...data.hospitals.filter(
                    (newHospital: any) =>
                      !prev.some((existing) => existing._id === newHospital._id)
                  ),
                ];

          setAvailableHospitals(nextHospitals.map((hospital: any) => hospital.name));
          return nextHospitals;
        });
        setHasMoreHospitals(Boolean(data.hasMore));
        setHospitalPage(pageToLoad);
      } else {
        if (pageToLoad === 1) {
          setHospitals([]);
          setAvailableHospitals([]);
        }
        setHasMoreHospitals(false);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      if (pageToLoad === 1) {
        setHospitals([]);
        setAvailableHospitals([]);
      }
      setHasMoreHospitals(false);
    } finally {
      setIsHospitalLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals("", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hospitalSearchInitialized.current) {
      hospitalSearchInitialized.current = true;
      return;
    }

    const debounce = setTimeout(() => {
      fetchHospitals(hospitalSearchTerm, 1);
    }, 400);

    return () => clearTimeout(debounce);
  }, [hospitalSearchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        hospitalDropdownRef.current &&
        !hospitalDropdownRef.current.contains(event.target as Node)
      ) {
        setShowHospitalDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 

  // Handle hospital selection - auto-populate location
  const handleHospitalSelect = (hospitalName: string) => {
    setSelectedHospitalName(hospitalName);
    setValue("hospital", hospitalName);
    setShowHospitalDropdown(false);
    setHospitalSearchTerm(hospitalName);
    
    if (hospitalName) {
      const selectedHospital = hospitals.find(h => h.name === hospitalName);
      
      if (selectedHospital && selectedHospital.thana) {
        const thana = selectedHospital.thana;
        const district = thana.district;
        const division = district?.division;
        
        // Auto-populate location fields
        if (division && division.name) {
          setValue("division", division.name);
        }
        if (district && district.name) {
          setValue("district", district.name);
        }
        if (thana.name) {
          setValue("thana", thana.name);
        }
      }
    }
  };

  const loadMoreHospitals = () => {
    if (isHospitalLoading || !hasMoreHospitals) return;
    fetchHospitals(hospitalSearchTerm, hospitalPage + 1);
  };

  useEffect(() => {
    if (user?.phoneNumber) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();
      
      if (doctorsData.doctors) {
        const foundDoctor = doctorsData.doctors.find(
          (d: any) => d.phoneNumber === user.phoneNumber
        );
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
          // Populate form with existing data
          setValue("username", user.username || "");
          setValue("hospital", foundDoctor.hospital || "");
          if (foundDoctor.hospital) {
            setHospitalSearchTerm(foundDoctor.hospital);
            setSelectedHospitalName(foundDoctor.hospital);
          }
          setValue("specialty", foundDoctor.specialty || "");
          setValue("qualification", foundDoctor.qualification || "");


          setValue("reportShowFee", foundDoctor.reportShowFee || 0);
          setValue("newPatientFee", foundDoctor.newPatientFee || 0);
          setValue("division", foundDoctor.division || "");
          setValue("district", foundDoctor.district || "");
          setValue("thana", foundDoctor.thana || "");

          setValue("department", foundDoctor.department || "");
          setValue("bio", foundDoctor.bio || "");
          setValue("image", foundDoctor.image || "");
        }
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      toast.error("Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      const updateData: any = {
        ...data,
        userId: user.id,
      };
      
      // Remove empty password fields
      if (!data.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }

      const response = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local storage
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
          window.dispatchEvent(new Event("userLogin"));
          setUser(result.user);
        }
        toast.success("Profile updated successfully!");
        if (data.password) {
          setValue("password", "");
          setValue("confirmPassword", "");
        }
        // Refresh doctor data
        fetchDoctorData();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Doctor profile not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your professional information</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {doctor.image ? (
              <img src={doctor.image} alt={doctor.name} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Enter username"
                  className="mt-1"
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Leave blank to keep current"
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm new password"
                  className="mt-1"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 relative" ref={hospitalDropdownRef}>
                <Label htmlFor="hospital">Hospital Name</Label>
                <Input
                  id="hospital"
                  type="text"
                  placeholder="Search or select hospital..."
                  value={hospitalSearchTerm}
                  onChange={(e) => {
                    setHospitalSearchTerm(e.target.value);
                    setShowHospitalDropdown(true);
                    if (!e.target.value) {
                      setSelectedHospitalName("");
                      setValue("hospital", "");
                    }
                  }}
                  onFocus={() => setShowHospitalDropdown(true)}
                  className="mt-1"
                  autoComplete="off"
                />
                {showHospitalDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isHospitalLoading && availableHospitals.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        Loading hospitals...
                      </div>
                    ) : availableHospitals.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        No hospitals found
                      </div>
                    ) : (
                      <>
                        {availableHospitals.map((hosp) => (
                          <div
                            key={hosp}
                            onClick={() => handleHospitalSelect(hosp)}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                              selectedHospitalName === hosp ? "bg-primary/10" : ""
                            }`}
                          >
                            {hosp}
                          </div>
                        ))}
                        {hasMoreHospitals && (
                          <div className="border-t border-gray-200 p-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={loadMoreHospitals}
                              disabled={isHospitalLoading}
                            >
                              {isHospitalLoading ? "Loading..." : "Load more hospitals"}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register("department")}
                  placeholder="e.g. Cardiology"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  {...register("specialty")}
                  placeholder="e.g. Cardiologist"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="qualification">Qualification</Label>
                <Textarea
                  id="qualification"
                  {...register("qualification")}
                  placeholder="e.g. MBBS, FCPS"
                  className="mt-1"
                  rows={4}
                />
              </div>


            </div>
          </div>

          {/* Fees */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Consultation Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div>
                <Label htmlFor="newPatientFee">New Patient Fee</Label>
                <Input
                  id="newPatientFee"
                  type="number"
                  {...register("newPatientFee")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reportShowFee">Report Show</Label>
                <Input
                  id="reportShowFee"
                  type="number"
                  {...register("reportShowFee")}
                  className="mt-1"
                />
              </div>
            </div>
          </div>



          {/* Other Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Other Details</h3>
            <div>
              <Label htmlFor="bio">Bio / About</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Write a short bio about yourself..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Provide a direct link to your profile image.</p>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving Changes..." : "Save All Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
