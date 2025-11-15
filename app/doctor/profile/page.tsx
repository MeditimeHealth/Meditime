"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
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
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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
          setValue("username", user.username || "");
        }
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      const updateData: any = {};
      
      if (data.username && data.username !== user.username) {
        updateData.username = data.username.toLowerCase();
      }
      
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      if (Object.keys(updateData).length === 0) {
        alert("No changes to save");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updateData,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local storage
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
          window.dispatchEvent(new Event("userLogin"));
          setUser(result.user);
        }
        alert("Profile updated successfully!");
        if (data.password) {
          setValue("password", "");
          setValue("confirmPassword", "");
        }
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
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
        <p className="text-gray-600 mt-2">Update your login credentials</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              {...register("username")}
              placeholder="Enter username"
              className="mt-1"
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Current username: {user?.username || "Not set"}
            </p>
          </div>

          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Leave blank to keep current password"
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

          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Information</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Name: </span>
            <span className="text-gray-900 font-medium">{doctor.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Specialty: </span>
            <span className="text-gray-900 font-medium">{doctor.specialty}</span>
          </div>
          <div>
            <span className="text-gray-600">Qualification: </span>
            <span className="text-gray-900 font-medium">{doctor.qualification}</span>
          </div>
          <div>
            <span className="text-gray-600">Phone: </span>
            <span className="text-gray-900 font-medium">{doctor.phoneNumber}</span>
          </div>
          {doctor.email && (
            <div>
              <span className="text-gray-600">Email: </span>
              <span className="text-gray-900 font-medium">{doctor.email}</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          To update other doctor information, please contact the administrator.
        </p>
      </Card>
    </div>
  );
}

