"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Clock,
  Edit,
  Save,
  Eye,
  EyeOff,
  Camera,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Stethoscope,
} from "lucide-react";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";

const profileSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9]+$/, "Phone number must contain only digits"),
    gender: z.enum(["male", "female", "other"], { error: "Gender is required" }),
    bloodGroup: z.string().optional(),
    age: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().min(1, "Age must be greater than 0").max(150, "Age must be less than 150")
    ),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    confirmPassword: z.string().optional(),
    photo: z.string().optional(),
  })
  .refine((data) => {
    if (data.password && data.password.length > 0) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  gender?: string;
  bloodGroup?: string;
  age?: number;
  photo?: string;
  createdAt?: string;
}

interface Appointment {
  _id: string;
  serialNumber?: string;
  patientName: string;
  mobileNumber: string;
  appointmentDate: string;
  hospitalName: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  doctorId?: {
    name: string;
    qualification?: string;
    hospital?: string;
  };
  createdAt: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setUser(parsedData);
      
      // Set form values
      setValue("fullName", parsedData.fullName || "");
      setValue("email", parsedData.email || "");
      setValue("phoneNumber", parsedData.phoneNumber || "");
      setValue("gender", (parsedData.gender as "male" | "female" | "other") || "male");
      setValue("bloodGroup", parsedData.bloodGroup || "");
      setValue("age", (parsedData.age || "") as any);
      setValue("photo", parsedData.photo || "");
      
      if (parsedData.photo) {
        setImagePreview(parsedData.photo);
      }
      
      // Fetch user appointments
      if (parsedData.id) {
        fetchAppointments(parsedData.id);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router, setValue]);

  const fetchAppointments = async (userId: string) => {
    setAppointmentsLoading(true);
    try {
      const response = await fetch(`/api/appointments?userId=${userId}`);
      const data = await response.json();
      if (response.ok && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
    };

    const labels = {
      pending: "অপেক্ষমান",
      confirmed: "নিশ্চিত",
      cancelled: "বাতিল",
      completed: "সম্পন্ন",
    };

    const icons = {
      pending: AlertCircle,
      confirmed: CheckCircle,
      cancelled: XCircle,
      completed: CheckCircle,
    };

    const Icon = icons[status as keyof typeof icons] || AlertCircle;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status as keyof typeof styles] || styles.pending}`}
      >
        <Icon className="h-4 w-4" />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast.error("Please select an image file");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        showToast.error("Image size must be less than 10MB");
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setIsSaving(true);
    try {
      let photoUrl = data.photo;

      // Upload new image if selected
      if (selectedImage) {
        setIsUploading(true);
        try {
          photoUrl = await uploadImage(selectedImage);
          setValue("photo", photoUrl);
        } catch (error: any) {
          showToast.error(error.message || "Failed to upload image. Please try again.");
          setIsSaving(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const updateData: any = {
        userId: user.id,
        fullName: data.fullName,
        email: data.email || "",
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        bloodGroup: data.bloodGroup || "",
        age: data.age,
        photo: photoUrl || "",
      };

      // Only include password if provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      const response = await fetch("/api/user/profile", {
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
          
          // Update image preview
          if (result.user.photo) {
            setImagePreview(result.user.photo);
          }
        }
        
        showToast.success("Profile updated successfully!");
        setIsEditing(false);
        setSelectedImage(null);
        
        // Clear password fields
        setValue("password", "");
        setValue("confirmPassword", "");
      } else {
        showToast.error(result.error || "Failed to update profile");
      }
    } catch (error: any) {
      showToast.error("An error occurred. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="default">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Profile Card */}
          <Card className="p-8 mb-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Profile Photo Section */}
              <div className="flex items-center gap-6 mb-8 pb-6 border-b">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={imagePreview}
                        alt={user.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <Input
                      {...register("fullName")}
                      className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                  )}
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                  {isEditing ? (
                    <Input
                      {...register("email")}
                      className="text-gray-600 border-none p-0 h-auto focus-visible:ring-0 mt-1"
                      placeholder="Email (optional)"
                      type="email"
                    />
                  ) : (
                    <p className="text-gray-600">{user.email || "No email provided"}</p>
                  )}
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <User className="h-5 w-5 text-gray-500" />
                    Full Name *
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        {...register("fullName")}
                        placeholder="Full Name"
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.fullName}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    Phone Number *
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        {...register("phoneNumber")}
                        placeholder="Phone Number"
                        className={errors.phoneNumber ? "border-red-500" : ""}
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.phoneNumber || "Not provided"}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        {...register("email")}
                        placeholder="Email (optional)"
                        type="email"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.email || "Not provided"}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    Gender *
                  </Label>
                  {isEditing ? (
                    <>
                      <Select
                        {...register("gender")}
                        className={errors.gender ? "border-red-500" : ""}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900 capitalize">
                      {user.gender || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Blood Group */}
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    Blood Group
                  </Label>
                  {isEditing ? (
                    <>
                      <Select
                        {...register("bloodGroup")}
                      >
                        <option value="">Select Blood Group</option>
                        {bloodGroups.map((bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </Select>
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.bloodGroup || "Not provided"}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    Age *
                  </Label>
                  {isEditing ? (
                    <>
                      <Input
                        {...register("age", { valueAsNumber: true })}
                        placeholder="Age"
                        type="number"
                        className={errors.age ? "border-red-500" : ""}
                      />
                      {errors.age && (
                        <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.age || "Not provided"}</p>
                  )}
                </div>

                {/* Password */}
                {isEditing && (
                  <>
                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 mb-2">
                        New Password (leave blank to keep current)
                      </Label>
                      <div className="relative">
                        <Input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="New Password"
                          className={errors.password ? "border-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-gray-700 mb-2">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          {...register("confirmPassword")}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          className={errors.confirmPassword ? "border-red-500" : ""}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Member Since */}
                {!isEditing && user.createdAt && (
                  <div>
                    <Label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      Member Since
                    </Label>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-4 mt-8 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="flex-1"
                  >
                    {isSaving || isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isUploading ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedImage(null);
                      // Reset form to original values
                      setValue("fullName", user.fullName || "");
                      setValue("email", user.email || "");
                      setValue("phoneNumber", user.phoneNumber || "");
                      setValue("gender", (user.gender as any) || "male");
                      setValue("bloodGroup", user.bloodGroup || "");
                      setValue("age", (user.age || "") as any);
                      setValue("password", "");
                      setValue("confirmPassword", "");
                      if (user.photo) {
                        setImagePreview(user.photo);
                      } else {
                        setImagePreview(null);
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Quick Stats */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{appointments.length}</p>
                <p className="text-sm text-gray-600">Total Appointments</p>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length}
                </p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </Card>
            </div>
          )}

          {/* Appointments List */}
          {!isEditing && (
            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Appointments</h3>
                <Button
                  onClick={() => router.push('/appointments')}
                  variant="outline"
                  size="sm"
                >
                  View All
                </Button>
              </div>

              {appointmentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No appointments found</p>
                  <Button
                    onClick={() => router.push('/doctor')}
                    className="mt-4"
                    variant="outline"
                  >
                    Book Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-gray-900">
                              {appointment.doctorId?.name || 'Unknown Doctor'}
                            </h4>
                          </div>
                          {appointment.doctorId?.qualification && (
                            <p className="text-sm text-gray-600 mb-2">
                              {appointment.doctorId.qualification}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.hospitalName}</span>
                        </div>
                        {appointment.serialNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Activity className="h-4 w-4" />
                            <span className="font-mono">Serial: {appointment.serialNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {appointments.length > 5 && (
                    <Button
                      onClick={() => router.push('/appointments')}
                      variant="outline"
                      className="w-full"
                    >
                      View All {appointments.length} Appointments
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Actions */}
          {!isEditing && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/doctor')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
                <Button
                  onClick={() => router.push('/appointments')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View My Appointments
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
