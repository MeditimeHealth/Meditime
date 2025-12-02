"use client";

import { useEffect, useState } from "react";
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
  currentPosition: z.string().optional(),
  experience: z.coerce.number().min(0, "Experience must be at least 0").optional(),
  consultationFee: z.coerce.number().min(0, "Fee must be at least 0").optional(),
  oldPatientFee: z.coerce.number().min(0, "Fee must be at least 0").optional(),
  newPatientFee: z.coerce.number().min(0, "Fee must be at least 0").optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),
  chamber: z.string().optional(),
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
      currentPosition: "",
      experience: 0,
      consultationFee: 0,
      oldPatientFee: 0,
      newPatientFee: 0,
      division: "",
      district: "",
      thana: "",
      chamber: "",
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
          setValue("specialty", foundDoctor.specialty || "");
          setValue("qualification", foundDoctor.qualification || "");
          setValue("currentPosition", foundDoctor.currentPosition || "");
          setValue("experience", foundDoctor.experience || 0);
          setValue("consultationFee", foundDoctor.consultationFee || 0);
          setValue("oldPatientFee", foundDoctor.oldPatientFee || 0);
          setValue("newPatientFee", foundDoctor.newPatientFee || 0);
          setValue("division", foundDoctor.division || "");
          setValue("district", foundDoctor.district || "");
          setValue("thana", foundDoctor.thana || "");
          setValue("chamber", foundDoctor.chamber || "");
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
              <div>
                <Label htmlFor="hospital">Hospital Name</Label>
                <Input
                  id="hospital"
                  {...register("hospital")}
                  placeholder="e.g. City Hospital"
                  className="mt-1"
                />
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
                <Input
                  id="qualification"
                  {...register("qualification")}
                  placeholder="e.g. MBBS, FCPS"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input
                  id="currentPosition"
                  {...register("currentPosition")}
                  placeholder="e.g. Senior Consultant"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience (Years)</Label>
                <Input
                  id="experience"
                  type="number"
                  {...register("experience")}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Consultation Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="consultationFee">Regular Fee</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  {...register("consultationFee")}
                  className="mt-1"
                />
              </div>
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
                <Label htmlFor="oldPatientFee">Old Patient Fee</Label>
                <Input
                  id="oldPatientFee"
                  type="number"
                  {...register("oldPatientFee")}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Location & Chamber</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  {...register("division")}
                  placeholder="e.g. Dhaka"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  {...register("district")}
                  placeholder="e.g. Dhaka"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="thana">Thana</Label>
                <Input
                  id="thana"
                  {...register("thana")}
                  placeholder="e.g. Dhanmondi"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="chamber">Chamber Address</Label>
                <Input
                  id="chamber"
                  {...register("chamber")}
                  placeholder="Full address of your chamber"
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
