"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Plus, X } from "lucide-react";

const doctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  qualification: z.string().min(2, "Qualification is required"),
  currentPosition: z.string().optional(),
  experience: z.coerce.number().min(0, "Experience must be at least 0"),
  hospital: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),
  chamber: z.string().optional(),
  department: z.string().optional(),
  consultationFee: z.coerce.number().min(0, "Consultation fee must be at least 0").optional(),
  oldPatientFee: z.coerce.number().min(0, "Old patient fee must be at least 0").optional(),
  newPatientFee: z.coerce.number().min(0, "New patient fee must be at least 0").optional(),
  diseases: z.array(z.string()).optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  availabilitySlots: z.array(z.object({
    days: z.array(z.string()).min(1, "Select at least one day"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    chamber: z.string().optional(),
  })).min(1, "Add at least one availability slot"),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const banglaDays = [
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
  "রবিবার",
];

interface AvailabilitySlot {
  days: string[];
  startTime: string;
  endTime: string;
  chamber?: string;
}

export default function EditDoctorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.id as string;

  // Location state
  const [divisions, setDivisions] = useState<Array<{_id: string; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{_id: string; name: string}>>([]);
  const [thanas, setThanas] = useState<Array<{_id: string; name: string}>>([]);
  const [, setHospitals] = useState<Array<{_id: string; name: string}>>([]);
  const [availableHospitals, setAvailableHospitals] = useState<string[]>([]);
  const [departments, setDepartments] = useState<Array<{_id: string; name: string; image?: string}>>([]);
  const [diseases, setDiseases] = useState<Array<{_id: string; name: string; bangla: string}>>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { days: [], startTime: "", endTime: "", chamber: "" },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema) as any,
    defaultValues: {
      availabilitySlots: [{ days: [], startTime: "", endTime: "", chamber: "" }],
    },
  });
  const watchedDivision = watch("division");
  const watchedDistrict = watch("district");
  const watchedThana = watch("thana");

  // Fetch divisions and departments on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Load divisions
      const divisionsRes = await fetch("/api/locations/divisions");
      const divisionsData = await divisionsRes.json();
      if (divisionsData.divisions) {
        setDivisions(divisionsData.divisions);
      }

      // Load departments
      const deptsRes = await fetch("/api/departments");
      const deptsData = await deptsRes.json();
      if (deptsData.departments) {
        setDepartments(deptsData.departments);
      }

      // Load diseases
      const diseasesRes = await fetch("/api/diseases");
      const diseasesData = await diseasesRes.json();
      if (diseasesData.diseases) {
        setDiseases(diseasesData.diseases);
      }

      // Load doctor data after divisions are loaded
      if (doctorId) {
        await fetchDoctor(divisionsData.divisions || []);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchDoctor = async (divisionsList: Array<{_id: string; name: string}> = []) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/doctors/${doctorId}`);
      const data = await response.json();

      if (response.ok && data.doctor) {
        const doctor = data.doctor;

        // Convert availability to array format if needed
        let availabilityArray: AvailabilitySlot[] = [];
        if (Array.isArray(doctor.availability)) {
          availabilityArray = doctor.availability.map((slot: any) => ({
            days: Array.isArray(slot.days) ? slot.days : [],
            startTime: slot.startTime || "",
            endTime: slot.endTime || "",
            chamber: slot.chamber || "",
          }));
        } else if (doctor.availability) {
          availabilityArray = [{
            days: Array.isArray(doctor.availability.days) ? doctor.availability.days : [],
            startTime: doctor.availability.startTime || "",
            endTime: doctor.availability.endTime || "",
            chamber: doctor.availability.chamber || "",
          }];
        }

        if (availabilityArray.length === 0) {
          availabilityArray = [{ days: [], startTime: "", endTime: "", chamber: "" }];
        }

        setAvailabilitySlots(availabilityArray);

        // Set diseases
        if (doctor.diseases && Array.isArray(doctor.diseases)) {
          setSelectedDiseases(doctor.diseases);
        }

        // Set form values
        reset({
          name: doctor.name || "",
          qualification: doctor.qualification || "",
          currentPosition: doctor.currentPosition || "",
          experience: doctor.experience || 0,
          hospital: doctor.hospital || "",
          division: doctor.division || "",
          district: doctor.district || "",
          thana: doctor.thana || "",
          chamber: doctor.chamber || "",
          department: doctor.department || "",
          consultationFee: doctor.consultationFee || 0,
          oldPatientFee: doctor.oldPatientFee || 0,
          newPatientFee: doctor.newPatientFee || (doctor.consultationFee || 0),
          diseases: doctor.diseases || [],
          bio: doctor.bio || "",
          image: doctor.image || "",
          availabilitySlots: availabilityArray,
        });

        // Set image preview if image exists
        if (doctor.image) {
          setImagePreview(doctor.image);
        }

        // Load location cascades if location data exists
        const divisionsToUse = divisionsList.length > 0 ? divisionsList : divisions;
        if (doctor.division && divisionsToUse.length > 0) {
          const loadedDistricts = await loadDistricts(doctor.division, divisionsToUse);
          if (doctor.district && loadedDistricts.length > 0) {
            const loadedThanas = await loadThanas(doctor.district);
            if (doctor.thana && loadedThanas.length > 0) {
              await loadHospitals(doctor.thana);
            }
          }
        }
      } else {
        alert(data.error || "Failed to fetch doctor data");
        router.push("/admin/doctors");
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      alert("Failed to fetch doctor data");
      router.push("/admin/doctors");
    } finally {
      setIsFetching(false);
    }
  };

  const loadDistricts = async (divisionName: string, divisionsList?: Array<{_id: string; name: string}>) => {
    const divisionsToSearch = divisionsList || divisions;
    const division = divisionsToSearch.find(d => d.name === divisionName);
    if (division) {
      const response = await fetch(`/api/locations/districts?division=${division._id}`);
      const data = await response.json();
      if (data.districts) {
        setDistricts(data.districts);
        return data.districts;
      }
    }
    return [];
  };

  const loadThanas = async (districtName: string) => {
    const district = districts.find(d => d.name === districtName);
    if (district) {
      const response = await fetch(`/api/locations/thanas?district=${district._id}`);
      const data = await response.json();
      if (data.thanas) {
        setThanas(data.thanas);
        return data.thanas;
      }
    }
    return [];
  };

  const loadHospitals = async (thanaName: string) => {
    const thana = thanas.find(t => t.name === thanaName);
    if (thana) {
      const response = await fetch(`/api/locations/hospitals?thana=${thana._id}`);
      const data = await response.json();
      if (data.hospitals) {
        setHospitals(data.hospitals);
        const hospitalNames = data.hospitals.map((h: {name: string}) => h.name);
        setAvailableHospitals(hospitalNames);
        return data.hospitals;
      }
    }
    return [];
  };

  // Fetch districts when division changes
  useEffect(() => {
    if (watchedDivision && !isFetching) {
      loadDistricts(watchedDivision);
      setValue("district", "");
      setValue("thana", "");
      setValue("hospital", "");
      setAvailableHospitals([]);
      setThanas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDivision, divisions, setValue, isFetching]);

  // Fetch thanas when district changes
  useEffect(() => {
    if (watchedDistrict && !isFetching) {
      loadThanas(watchedDistrict);
      setValue("thana", "");
      setValue("hospital", "");
      setAvailableHospitals([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDistrict, districts, setValue, isFetching]);

  // Fetch hospitals when thana changes
  useEffect(() => {
    if (watchedThana && !isFetching) {
      loadHospitals(watchedThana);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedThana, thanas, setValue, watch, isFetching]);

  // Add new availability slot
  const addAvailabilitySlot = () => {
    const newSlot = { days: [], startTime: "", endTime: "", chamber: "" };
    setAvailabilitySlots([...availabilitySlots, newSlot]);
    setValue("availabilitySlots", [...availabilitySlots, newSlot]);
  };

  // Remove availability slot
  const removeAvailabilitySlot = (index: number) => {
    if (availabilitySlots.length > 1) {
      const updated = availabilitySlots.filter((_, i) => i !== index);
      setAvailabilitySlots(updated);
      setValue("availabilitySlots", updated);
    }
  };

  // Toggle day for a specific slot
  const toggleDay = (slotIndex: number, day: string) => {
    const updated = [...availabilitySlots];
    const slot = updated[slotIndex];
    if (slot.days.includes(day)) {
      slot.days = slot.days.filter((d) => d !== day);
    } else {
      slot.days = [...slot.days, day];
    }
    setAvailabilitySlots(updated);
    setValue("availabilitySlots", updated);
  };

  // Update time for a specific slot
  const updateSlotTime = (slotIndex: number, field: "startTime" | "endTime", value: string) => {
    const updated = [...availabilitySlots];
    updated[slotIndex][field] = value;
    setAvailabilitySlots(updated);
    setValue("availabilitySlots", updated);
  };

  // Update chamber for a specific slot
  const updateSlotChamber = (slotIndex: number, value: string) => {
    const updated = [...availabilitySlots];
    updated[slotIndex].chamber = value;
    setAvailabilitySlots(updated);
    setValue("availabilitySlots", updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }

      setSelectedImage(file);
      
      // Create preview
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

  const onSubmit = async (data: DoctorFormValues) => {
    setIsLoading(true);
    try {
      let imageUrl = data.image;

      // Upload image if a new file was selected
      if (selectedImage) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedImage);
          setValue("image", imageUrl);
        } catch (error: any) {
          alert(error.message || "Failed to upload image. Please try again.");
          setIsLoading(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const { availabilitySlots, ...doctorData } = data;

      const response = await fetch(`/api/doctors/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...doctorData,
          image: imageUrl || undefined,
          availability: availabilitySlots,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/admin/doctors");
        alert("Doctor profile updated successfully!");
      } else {
        alert(result.error || "Failed to update doctor profile");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading doctor data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Doctor Profile</h1>
        <p className="text-gray-600 mt-2">Update doctor information</p>
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
                placeholder="Dr. John Doe"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="qualification">
                Qualification <span className="text-red-500">*</span>
              </Label>
              <Input
                id="qualification"
                {...register("qualification")}
                placeholder="MBBS, MD"
                className="mt-1"
              />
              {errors.qualification && (
                <p className="text-sm text-red-500 mt-1">{errors.qualification.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="currentPosition">
                Current Position <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <Input
                id="currentPosition"
                {...register("currentPosition")}
                placeholder="Assistant Professor, Senior Consultant, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="experience">
                Experience (Years) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="experience"
                type="number"
                {...register("experience")}
                placeholder="10"
                className="mt-1"
              />
              {errors.experience && (
                <p className="text-sm text-red-500 mt-1">{errors.experience.message}</p>
              )}
            </div>


            {/* Location Selection Section */}
            <div className="md:col-span-2">
              <Label className="mb-2 block font-semibold text-gray-900">
                Location & Hospital
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
                  setValue("hospital", "");
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
                  setValue("hospital", "");
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
                onChange={(e) => {
                  setValue("thana", e.target.value);
                  setValue("hospital", "");
                }}
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
              <Label htmlFor="hospital">Hospital</Label>
              <select
                id="hospital"
                {...register("hospital")}
                disabled={!watchedThana || availableHospitals.length === 0}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">
                  {availableHospitals.length === 0
                    ? watchedThana
                      ? "No hospitals in this area"
                      : "Select Thana first"
                    : "Select Hospital"}
                </option>
                {availableHospitals.map((hosp) => (
                  <option key={hosp} value={hosp}>
                    {hosp}
                  </option>
                ))}
              </select>
              {availableHospitals.length === 0 && watchedThana && (
                <Input
                  {...register("hospital")}
                  placeholder="Or enter hospital name manually"
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label htmlFor="chamber">
                চেম্বার (Chamber) <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <Input
                id="chamber"
                {...register("chamber")}
                placeholder="চেম্বারের নাম বা ঠিকানা"
                className="mt-1"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              />
            </div>

            <div>
              <Label htmlFor="department">
                বিভাগ (Department) <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <select
                id="department"
                {...register("department")}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                <option value="">বিভাগ নির্বাচন করুন (Select Department)</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="newPatientFee">
                নতুন রোগীর ফি (New Patient Fee) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newPatientFee"
                type="number"
                {...register("newPatientFee")}
                placeholder="500"
                className="mt-1"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              />
              {errors.newPatientFee && (
                <p className="text-sm text-red-500 mt-1">{errors.newPatientFee.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="oldPatientFee">
                পুরাতন রোগীর ফি (Old Patient Fee) <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <Input
                id="oldPatientFee"
                type="number"
                {...register("oldPatientFee")}
                placeholder="400"
                className="mt-1"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              />
              {errors.oldPatientFee && (
                <p className="text-sm text-red-500 mt-1">{errors.oldPatientFee.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label className="mb-3 block font-semibold text-gray-900">
                যে সকল রোগের চিকিৎসা করা হয় (Diseases Treated) <span className="text-gray-500 text-xs">(Optional)</span>
              </Label>
              <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 bg-white">
                {diseases.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No diseases available. Please add diseases from the admin panel.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {diseases.map((disease) => (
                      <label
                        key={disease._id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDiseases.includes(disease.bangla)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const updated = [...selectedDiseases, disease.bangla];
                              setSelectedDiseases(updated);
                              setValue("diseases", updated);
                            } else {
                              const updated = selectedDiseases.filter(d => d !== disease.bangla);
                              setSelectedDiseases(updated);
                              setValue("diseases", updated);
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span
                          className="text-sm"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {disease.bangla}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedDiseases.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedDiseases.length} disease(s) selected
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="image">Profile Image</Label>
              <div className="mt-1 space-y-3">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    id="image"
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
                    {selectedImage ? "Change Image" : imagePreview ? "Change Image" : "Select Image"}
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

          <div>
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              {...register("bio")}
              rows={4}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              placeholder="Doctor's biography..."
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                উপলব্ধতা (Availability) <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                onClick={addAvailabilitySlot}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                স্লট যোগ করুন
              </Button>
            </div>

            {availabilitySlots.map((slot, slotIndex) => (
              <Card key={slotIndex} className="p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">
                    স্লট {slotIndex + 1}
                  </Label>
                  {availabilitySlots.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeAvailabilitySlot(slotIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      দিন নির্বাচন করুন (Select Days) <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {daysOfWeek.map((day, dayIndex) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(slotIndex, day)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            slot.days.includes(day)
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {banglaDays[dayIndex]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor={`startTime-${slotIndex}`}>
                        শুরু সময় (Start Time) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`startTime-${slotIndex}`}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlotTime(slotIndex, "startTime", e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`endTime-${slotIndex}`}>
                        শেষ সময় (End Time) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`endTime-${slotIndex}`}
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlotTime(slotIndex, "endTime", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`chamber-${slotIndex}`}>
                      চেম্বার (Chamber) <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id={`chamber-${slotIndex}`}
                      type="text"
                      value={slot.chamber || ""}
                      onChange={(e) => updateSlotChamber(slotIndex, e.target.value)}
                      placeholder="এই সময়ের জন্য চেম্বার (যদি থাকে)"
                      className="mt-1"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {errors.availabilitySlots && (
              <p className="text-sm text-red-500">{errors.availabilitySlots.message}</p>
            )}
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
                ? "Updating..."
                : "Update Doctor Profile"}
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

