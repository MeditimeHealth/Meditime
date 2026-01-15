"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { showToast } from "@/lib/toast";
const doctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  specialty: z.string().optional(),
  qualification: z.string().min(2, "Qualification is required"),
  designation: z.string().optional(),


  hospital: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  thana: z.string().optional(),

  department: z.string().optional(),
  consultationFee: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Consultation fee must be at least 0").optional()
  ),
  oldPatientFee: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "Old patient fee must be at least 0").optional()
  ),
  newPatientFee: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, "New patient fee must be at least 0").optional()
  ),
  bio: z.string().optional(),
  image: z.string().optional(),
  availabilitySlots: z.array(z.object({
    days: z.array(z.string()).min(1, "Select at least one day"),
    time: z.string().min(1, "Time is required"),
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
  "সোম",
  "মঙ্গল",
  "বুধ",
  "বৃহস্পতি",
  "শুক্র",
  "শনি",
  "রবি",
];

interface AvailabilitySlot {
  days: string[];
  time: string;
}

type HospitalWithLocation = {
  _id: string;
  name: string;
  thana?: {
    _id: string;
    name: string;
    district?: {
      _id: string;
      name: string;
      division?: {
        _id: string;
        name: string;
      };
    };
  };
};

export default function CreateDoctorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Location state

  const [hospitals, setHospitals] = useState<HospitalWithLocation[]>([]);
  const [availableHospitals, setAvailableHospitals] = useState<string[]>([]);
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const [hospitalPage, setHospitalPage] = useState(1);
  const [hasMoreHospitals, setHasMoreHospitals] = useState(false);
  const [isHospitalLoading, setIsHospitalLoading] = useState(false);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [selectedHospitalName, setSelectedHospitalName] = useState("");
  const hospitalDropdownRef = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Array<{_id: string; name: string; image?: string}>>([]);

  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { days: [], time: "" },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema) as any,
    defaultValues: {
      availabilitySlots: [{ days: [], time: "" }],
    },
  });

  const hospitalSearchInitialized = useRef(false);

  const fetchHospitals = useCallback(
    async (searchValue: string = "", pageToLoad = 1) => {
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
                      (newHospital: HospitalWithLocation) =>
                        !prev.some((existing) => existing._id === newHospital._id)
                    ),
                  ];

            setAvailableHospitals(nextHospitals.map((hospital: HospitalWithLocation) => hospital.name));
            return nextHospitals;
          });
          setHasMoreHospitals(Boolean(data.hasMore));
          setHospitalPage(pageToLoad);
        } else {
          console.error("Failed to fetch hospitals", data?.error);
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
    },
    []
  );

  useEffect(() => {
    fetchHospitals("", 1);
  }, [fetchHospitals]);

  useEffect(() => {
    if (!hospitalSearchInitialized.current) {
      hospitalSearchInitialized.current = true;
      return;
    }

    const debounce = setTimeout(() => {
      fetchHospitals(hospitalSearchTerm, 1);
    }, 400);

    return () => clearTimeout(debounce);
  }, [hospitalSearchTerm, fetchHospitals]);



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

  // Fetch departments on mount
  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) setDepartments(data.departments);
      });
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

  // Add new availability slot
  const addAvailabilitySlot = () => {
    const newSlot = { days: [], time: "" };
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
  const updateSlotTime = (slotIndex: number, value: string) => {
    const updated = [...availabilitySlots];
    updated[slotIndex].time = value;
    setAvailabilitySlots(updated);
    setValue("availabilitySlots", updated);
  };



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast.error("Image size must be less than 10MB");
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

      // Upload image if a file was selected
      if (selectedImage) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(selectedImage);
          setValue("image", imageUrl);
        } catch (error: any) {
          showToast.error(error.message || "Failed to upload image. Please try again.");
          setIsLoading(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const { availabilitySlots, ...doctorData } = data;

      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...doctorData,
          image: imageUrl || undefined,
          availability: availabilitySlots,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Doctor profile created successfully!");
        router.push("/admin/doctors");
      } else {
        showToast.error(result.error || "Failed to create doctor profile");
      }
    } catch (err) {
      console.error("Error creating doctor:", err);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Doctor Profile</h1>
        <p className="text-gray-600 mt-2">Add a new doctor to the system</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
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
              <Label htmlFor="specialty">
                Specialty
              </Label>
              <Input
                id="specialty"
                {...register("specialty")}
                placeholder="e.g. Cardiologist"
                className="mt-1"
              />
              {errors.specialty && (
                <p className="text-sm text-red-500 mt-1">{errors.specialty.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="qualification">
                Qualification <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="qualification"
                {...register("qualification")}
                placeholder="MBBS, MD"
                rows={2}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              />
              {errors.qualification && (
                <p className="text-sm text-red-500 mt-1">{errors.qualification.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="designation">
                Designation
              </Label>
              <Input
                id="designation"
                {...register("designation")}
                placeholder="e.g. Senior Consultant"
                className="mt-1"
              />
              {errors.designation && (
                <p className="text-sm text-red-500 mt-1">{errors.designation.message}</p>
              )}
            </div>








            <div className="relative" ref={hospitalDropdownRef}>
              <Label htmlFor="hospital">Hospital</Label>
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

                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <Label htmlFor={`time-${slotIndex}`}>
                        সময় (Time) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`time-${slotIndex}`}
                        type="text"
                        placeholder="e.g. 10:00 AM - 04:00 PM"
                        value={slot.time}
                        onChange={(e) => updateSlotTime(slotIndex, e.target.value)}
                        className="mt-1"
                      />
                    </div>
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
                ? "Creating..."
                : "Create Doctor Profile"}
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

