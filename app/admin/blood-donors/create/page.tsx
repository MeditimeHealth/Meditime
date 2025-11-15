"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const bloodDonorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phoneNumber: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    message: "Blood group is required",
  }),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),
  photo: z.string().optional(),
  availabilityStatus: z.enum(["Available", "Unavailable", "Recently Donated"], {
    message: "Availability status is required",
  }),
  lastDonationDate: z.string().optional(),
});

type BloodDonorFormValues = z.infer<typeof bloodDonorSchema>;

export default function CreateBloodDonorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  } = useForm<BloodDonorFormValues>({
    resolver: zodResolver(bloodDonorSchema),
    defaultValues: {
      availabilityStatus: "Available",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
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

  const onSubmit = async (data: BloodDonorFormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = data.photo;

      if (selectedImage) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedImage);
          setValue("photo", imageUrl);
        } catch (error: any) {
          alert(error.message || "Failed to upload image. Please try again.");
          setIsLoading(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const response = await fetch("/api/blood-donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photo: imageUrl || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/admin/blood-donors");
        alert("Blood donor created successfully!");
      } else {
        alert(result.error || "Failed to create blood donor");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Blood Donor Profile</h1>
        <p className="text-gray-600 mt-2">Add a new blood donor to the system</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="John Doe"
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="donor@example.com"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bloodGroup">
                Blood Group <span className="text-red-500">*</span>
              </Label>
              <select
                id="bloodGroup"
                {...register("bloodGroup")}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">Select Blood Group</option>
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
                <p className="text-sm text-red-500 mt-1">{errors.bloodGroup.message}</p>
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
                <option value="Recently Donated">Recently Donated</option>
              </select>
              {errors.availabilityStatus && (
                <p className="text-sm text-red-500 mt-1">{errors.availabilityStatus.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastDonationDate">Last Donation Date</Label>
              <Input
                id="lastDonationDate"
                type="date"
                {...register("lastDonationDate")}
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="mt-1 space-y-3">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                  >
                    {selectedImage ? "Change Image" : "Select Image"}
                  </Button>
                  {selectedImage && (
                    <span className="text-sm text-gray-600">
                      {selectedImage.name}
                    </span>
                  )}
                </div>
                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex-1"
            >
              {isUploading
                ? "Uploading Image..."
                : isLoading
                ? "Creating..."
                : "Create Blood Donor Profile"}
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
  );
}

