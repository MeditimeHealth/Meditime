"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/lib/toast";
import { convertToBengaliNumber, convertToEnglishNumber } from "@/lib/utils";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const doctorSchema = z.object({
  name: z.string().optional(),
  specialty: z.string().optional(),
  qualification: z.string().optional(),
  designation: z.string().optional(),

  hospital: z.string().optional(),
  hospitalBn: z.string().optional(),
  division: z.string().optional(),
  divisionBn: z.string().optional(),
  district: z.string().optional(),
  districtBn: z.string().optional(),
  thana: z.string().optional(),
  thanaBn: z.string().optional(),

  department: z.string().optional(),
  departmentBn: z.string().optional(),

  reportShowFee: z.coerce.number().min(0, "Report show fee must be at least 0").optional(),
  reportShowFeeBn: z.string().optional(),
  newPatientFee: z.coerce.number().min(0, "New patient fee must be at least 0").optional(),
  newPatientFeeBn: z.string().optional(),

  diseases: z.array(z.string()).optional(),
  diseasesEn: z.array(z.string()).optional(),

  bio: z.string().optional(),

  // Bangla Fields
  nameBn: z.string().optional(),
  specialtyBn: z.string().optional(),
  qualificationBn: z.string().optional(),
  designationBn: z.string().optional(),
  bioBn: z.string().optional(),

  image: z.string().optional(),
  availabilitySlots: z.array(z.object({
    days: z.array(z.string()).min(1, "Select at least one day"),
    daysBn: z.array(z.string()).optional(),
    time: z.string().optional(),
    timeBn: z.string().optional(),
  })).min(1, "Add at least one availability slot"),
}).refine((data) => data.name || data.nameBn, {
  message: "Name (English or Bangla) is required",
  path: ["name"],
}).refine((data) => data.qualification || data.qualificationBn, {
  message: "Qualification (English or Bangla) is required",
  path: ["qualification"],
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

const daysOfWeek = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const banglaDays = [
  "শনি",
  "রবি",
  "সোম",
  "মঙ্গল",
  "বুধ",
  "বৃহস্পতি",
  "শুক্র",
];

interface AvailabilitySlot {
  days: string[];
  daysBn?: string[];
  time: string;
  timeBn?: string;
}

export default function EditDoctorPage() {
  const { language: globalLanguage } = useLanguage();
  const [language, setLanguage] = useState<'en' | 'bn'>(globalLanguage);

  // Debug: log language changes
  useEffect(() => {
    console.log('[LANGUAGE STATE] Current language:', language);
  }, [language]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const params = useParams();
  const doctorId = params?.id as string;



  // Hospital Search State
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [availableHospitals, setAvailableHospitals] = useState<any[]>([]);
  const [hospitalSearchTerm, setHospitalSearchTerm] = useState("");
  const [hospitalPage, setHospitalPage] = useState(1);
  const [hasMoreHospitals, setHasMoreHospitals] = useState(false);
  const [isHospitalLoading, setIsHospitalLoading] = useState(false);
  const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
  const [selectedHospitalName, setSelectedHospitalName] = useState("");
  const hospitalDropdownRef = useRef<HTMLDivElement>(null);
  const hospitalSearchInitialized = useRef(false);
  const [departments, setDepartments] = useState<Array<{ _id: string; name: string; nameBn?: string; image?: string }>>([]);
  const [diseases, setDiseases] = useState<Array<{ _id: string; name: string; bangla: string; department?: { _id: string; name: string } | string }>>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<Array<{ _id: string; name: string; bangla: string; department?: { _id: string; name: string } | string }>>([]);

  const [divisions, setDivisions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [thanas, setThanas] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredThanas, setFilteredThanas] = useState<any[]>([]);

  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { days: [], time: "" },
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
      name: "",
      nameBn: "",
      specialty: "",
      specialtyBn: "",
      qualification: "",
      qualificationBn: "",
      designation: "",
      designationBn: "",
      hospital: "",
      hospitalBn: "",
      division: "",
      divisionBn: "",
      district: "",
      districtBn: "",
      thana: "",
      thanaBn: "",
      department: "",
      departmentBn: "",
      reportShowFee: 0,
      reportShowFeeBn: "",
      newPatientFee: 0,
      newPatientFeeBn: "",
      diseases: [],
      diseasesEn: [],
      bio: "",
      bioBn: "",
      image: "",
      availabilitySlots: [{ days: [], time: "", timeBn: "" }],
    },
  });
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

          setAvailableHospitals(nextHospitals);
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
  }, []);

  // Sync internal language with global language on mount
  useEffect(() => {
    setLanguage(globalLanguage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch department field and filter diseases
  const selectedDepartment = watch("department");

  useEffect(() => {
    if (!selectedDepartment || selectedDepartment === "") {
      // Show all diseases if no department selected
      setFilteredDiseases(diseases);
    } else {
      // Find department by name
      const dept = departments.find(d => d.name === selectedDepartment);
      if (dept) {
        // Filter diseases by department
        const filtered = diseases.filter(disease => {
          if (!disease.department) return false;
          const deptId = typeof disease.department === 'object' ? (disease.department as any)._id : disease.department;
          return deptId === dept._id;
        });
        setFilteredDiseases(filtered);
      } else {
        // If department not found, show diseases without department
        setFilteredDiseases(diseases.filter(disease => !disease.department));
      }
    }
  }, [selectedDepartment, departments, diseases]);

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

  // Removed buggy hospitalSearchTerm update on language toggle

  // Handle hospital selection - auto-populate location
  const handleHospitalSelect = async (hospitalName: string) => {
    setSelectedHospitalName(hospitalName);
    setValue("hospital", hospitalName);
    setShowHospitalDropdown(false);

    const selectedHospital = availableHospitals.find(h => h.name === hospitalName) || hospitals.find(h => h.name === hospitalName);
    const hospitalBn = selectedHospital?.nameBn || "";
    setValue("hospitalBn", hospitalBn);
    setHospitalSearchTerm(language === 'bn' && hospitalBn ? hospitalBn : hospitalName);

    if (!hospitalName || !selectedHospital || !selectedHospital.thana) return;

    try {
      const thanaId = selectedHospital.thana?._id || selectedHospital.thana;
      
      // First try to find in already-loaded data
      let thana = thanas.find(t => t._id === thanaId);
      if (!thana) {
        // Fetch thana data if not in loaded data
        const thanaRes = await fetch(`/api/locations/thanas/${thanaId}`);
        if (!thanaRes.ok) throw new Error(`Failed to fetch thana: ${thanaRes.status}`);
        const thanaData = await thanaRes.json();
        thana = thanaData.thana || thanaData;
      }
      
      if (!thana) return;
      
      const thanaName = thana.name || "";
      const thanaBnName = thana.nameBn || thana.bangla || thanaName;
      
      setValue("thana", thanaName);
      setValue("thanaBn", thanaBnName);
      
      // Get district
      const districtId = thana.district?._id || thana.district;
      if (districtId) {
        let district = districts.find(d => d._id === districtId);
        if (!district) {
          // Fetch district data if not in loaded data
          const districtRes = await fetch(`/api/locations/districts/${districtId}`);
          if (!districtRes.ok) throw new Error(`Failed to fetch district: ${districtRes.status}`);
          const districtData = await districtRes.json();
          district = districtData.district || districtData;
        }
        
        if (district) {
          const districtName = district.name || "";
          const districtBnName = district.nameBn || district.bangla || districtName;
          
          setValue("district", districtName);
          setValue("districtBn", districtBnName);
          
          // Get division
          const divisionId = district.division?._id || district.division;
          if (divisionId) {
            let division = divisions.find(d => d._id === divisionId);
            if (!division) {
              // Fetch division data if not in loaded data
              const divisionRes = await fetch(`/api/locations/divisions/${divisionId}`);
              if (!divisionRes.ok) throw new Error(`Failed to fetch division: ${divisionRes.status}`);
              const divisionData = await divisionRes.json();
              division = divisionData.division || divisionData;
            }
            
            if (division) {
              const divisionName = division.name || "";
              const divisionBnName = division.nameBn || division.bangla || divisionName;
              
              setValue("division", divisionName);
              setValue("divisionBn", divisionBnName);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error auto-populating location:", error);
    }
  };

  const loadMoreHospitals = () => {
    if (isHospitalLoading || !hasMoreHospitals) return;
    fetchHospitals(hospitalSearchTerm, hospitalPage + 1);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      // Fetch all required data in parallel
      const [deptsRes, diseasesRes, divsRes, distsRes, thanasRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/diseases"),
        fetch("/api/locations/divisions"),
        fetch("/api/locations/districts"),
        fetch("/api/locations/thanas")
      ]);

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        if (deptsData.departments) {
          setDepartments(deptsData.departments);
        }
      }

      if (diseasesRes.ok) {
        const diseasesData = await diseasesRes.json();
        if (diseasesData.diseases) {
          setDiseases(diseasesData.diseases);
          setFilteredDiseases(diseasesData.diseases);
        }
      }

      if (divsRes.ok) {
        const data = await divsRes.json();
        setDivisions(data.divisions || []);
      }
      
      if (distsRes.ok) {
        const data = await distsRes.json();
        setDistricts(data.districts || []);
      }
      
      if (thanasRes.ok) {
        const data = await thanasRes.json();
        setThanas(data.thanas || []);
      }

      // Load doctor data
      if (doctorId) {
        await fetchDoctor();
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const selectedDivision = watch("division");
  const selectedDistrict = watch("district");

  useEffect(() => {
    if (selectedDivision) {
      const division = divisions.find(d => d.name === selectedDivision);
      if (division) {
        setFilteredDistricts(districts.filter(d => d.division?._id === division._id || d.division === division._id));
      } else {
        setFilteredDistricts([]);
      }
    } else {
      setFilteredDistricts(districts);
    }
  }, [selectedDivision, divisions, districts]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.name === selectedDistrict);
      if (district) {
        setFilteredThanas(thanas.filter(t => t.district?._id === district._id || t.district === district._id));
      } else {
        setFilteredThanas([]);
      }
    } else {
      setFilteredThanas(thanas);
    }
  }, [selectedDistrict, districts, thanas]);

  const fetchDoctor = async () => {
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
            daysBn: Array.isArray(slot.daysBn) ? slot.daysBn : [],
            time: slot.time || (slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : "") || "",
            timeBn: slot.timeBn || "",
          }));
        } else if (doctor.availability) {
          availabilityArray = [{
            days: Array.isArray(doctor.availability.days) ? doctor.availability.days : [],
            daysBn: Array.isArray(doctor.availability.daysBn) ? doctor.availability.daysBn : [],
            time: doctor.availability.time || (doctor.availability.startTime && doctor.availability.endTime ? `${doctor.availability.startTime} - ${doctor.availability.endTime}` : "") || "",
            timeBn: doctor.availability.timeBn || "",
          }];
        }

        if (availabilityArray.length === 0) {
          availabilityArray = [{ days: [], time: "", timeBn: "" }];
        }

        setAvailabilitySlots(availabilityArray);

        // Set diseases
        if (doctor.diseases && Array.isArray(doctor.diseases)) {
          setSelectedDiseases(doctor.diseases);
        }

        // Set form values
        reset({
          name: doctor.name || "",
          nameBn: doctor.nameBn || "",
          specialty: doctor.specialty || "",
          specialtyBn: doctor.specialtyBn || "",
          qualification: doctor.qualification || "",
          qualificationBn: doctor.qualificationBn || "",
          designation: doctor.designation || "",
          designationBn: doctor.designationBn || "",

          hospital: doctor.hospital || "",
          hospitalBn: doctor.hospitalBn || "",
          division: doctor.division || "",
          divisionBn: doctor.divisionBn || "",
          district: doctor.district || "",
          districtBn: doctor.districtBn || "",
          thana: doctor.thana || "",
          thanaBn: doctor.thanaBn || "",

          department: doctor.department || "",
          departmentBn: doctor.departmentBn || "",
          reportShowFee: doctor.reportShowFee || 0,
          reportShowFeeBn: doctor.reportShowFeeBn || "",
          newPatientFee: doctor.newPatientFee || 0,
          newPatientFeeBn: doctor.newPatientFeeBn || "",

          diseases: doctor.diseases || [],
          diseasesEn: doctor.diseasesEn || [],
          bio: doctor.bio || "",
          bioBn: doctor.bioBn || "",
          image: doctor.image || "",
          availabilitySlots: availabilityArray,
        });

        // Filtered diseases will be updated by the useEffect that watches department

        // Set image preview if image exists
        if (doctor.image) {
          setImagePreview(doctor.image);
        }

        if (doctor.hospital) {
          setSelectedHospitalName(doctor.hospital);
          const initialSearchTerm = language === 'bn' && doctor.hospitalBn ? doctor.hospitalBn : doctor.hospital;
          setHospitalSearchTerm(initialSearchTerm);
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



  // Add new availability slot
  const addAvailabilitySlot = () => {
    const newSlot = { days: [], time: "", timeBn: "" };
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

  const updateSlotTimeBn = (slotIndex: number, value: string) => {
    const updated = [...availabilitySlots];
    updated[slotIndex].timeBn = value;
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

      const selectedHospital = hospitals.find(h => h.name === data.hospital);
      const hospitalBn = selectedHospital?.nameBn || data.hospitalBn || "";

      const availabilityWithDaysBn = availabilitySlots?.map(slot => {
        const daysBn = slot.days.map(day => {
          const index = daysOfWeek.indexOf(day);
          return index !== -1 ? banglaDays[index] + 'বার' : day;
        });
        return { ...slot, daysBn };
      });

      const response = await fetch(`/api/doctors/${doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...doctorData,
          hospitalBn,
          image: imageUrl || undefined,
          availability: availabilityWithDaysBn,

          nameBn: data.nameBn,
          specialtyBn: data.specialtyBn,
          qualificationBn: data.qualificationBn,
          designationBn: data.designationBn,
          bioBn: data.bioBn,
          divisionBn: data.divisionBn,
          districtBn: data.districtBn,
          thanaBn: data.thanaBn,
          departmentBn: data.departmentBn,
          reportShowFeeBn: data.reportShowFeeBn,
          newPatientFeeBn: data.newPatientFeeBn,
          diseasesEn: data.diseasesEn,

          diseases: selectedDiseases,
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
        <h1 className="text-3xl font-bold text-gray-900">{language === 'bn' ? 'ডাক্তারের প্রোফাইল সম্পাদনা করুন' : 'Edit Doctor Profile'}</h1>
        <p className="text-gray-600 mt-2">{language === 'bn' ? 'ডাক্তারের তথ্য আপডেট করুন' : 'Update doctor information'}</p>
      </div>

      <Card className="p-6">
        <div className="flex justify-end mb-8">
          <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner">
            <button
              type="button"
              onClick={() => {
                console.log('Setting language to en');
                setLanguage('en');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en'
                  ? 'bg-white text-primary shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Setting language to bn');
                setLanguage('bn');
              }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${language === 'bn'
                  ? 'bg-white text-primary shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className={language === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="name">
                  {t("name", language)} <span className="text-red-500">*</span>
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
              <div className={language === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="nameBn">
                  {t("nameBn", language)} <span className="text-gray-400 text-sm">({t("optional", language)})</span>
                </Label>
                <Input
                  id="nameBn"
                  {...register("nameBn")}
                  placeholder="ডাঃ জন ডো"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className={language === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="specialty">
                  {t("specialty", language)}
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
              <div className={language === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="specialtyBn">
                  {t("specialtyBn", language)}
                </Label>
                <Input
                  id="specialtyBn"
                  {...register("specialtyBn")}
                  placeholder="হৃদরোগ বিশেষজ্ঞ"
                  className="mt-1"
                />
                {errors.specialtyBn && (
                  <p className="text-sm text-red-500 mt-1">{errors.specialtyBn.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className={language === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="qualification">
                  {t("qualification", language)} <span className="text-red-500">*</span>
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
              <div className={language === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="qualificationBn">
                  {t("qualificationBn", language)} <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="qualificationBn"
                  {...register("qualificationBn")}
                  placeholder="এমবিবিএস, এমডি"
                  rows={2}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                />
                {errors.qualification && (
                  <p className="text-sm text-red-500 mt-1">{errors.qualification.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className={language === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="designation">
                  {t("designation", language)}
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
              <div className={language === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="designationBn">
                  {t("designationBn", language)}
                </Label>
                <Input
                  id="designationBn"
                  {...register("designationBn")}
                  placeholder="সিনিয়র কনসালটেন্ট"
                  className="mt-1"
                />
                {errors.designationBn && (
                  <p className="text-sm text-red-500 mt-1">{errors.designationBn.message}</p>
                )}
              </div>
            </div>






            {/* Location Selection Section */}
            <div className="md:col-span-2">
              <Label className="mb-2 block font-semibold text-gray-900">
                {language === 'bn' ? 'অবস্থান এবং হাসপাতাল' : 'Location & Hospital'}
              </Label>
            </div>

            <div className="relative" ref={hospitalDropdownRef}>
              <Label htmlFor="hospital">{t("hospitalName", language)}</Label>
              <Input
                id="hospital"
                type="text"
                placeholder={t("selectHospital", language)}
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
                          key={hosp._id}
                          onClick={() => handleHospitalSelect(hosp.name)}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm ${selectedHospitalName === hosp.name ? "bg-primary/10" : ""
                            }`}
                        >
                          {language === 'bn' && hosp.nameBn ? hosp.nameBn : hosp.name}
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
              <Label htmlFor="division">
                {language === 'bn' ? 'বিভাগ' : 'Division'}
              </Label>
              <select
                id="division"
                {...register("division")}
                onChange={(e) => {
                  setValue("division", e.target.value);
                  const div = divisions.find(d => d.name === e.target.value);
                  if (div) {
                    setValue("divisionBn", div.nameBn || "");
                  } else {
                    setValue("divisionBn", "");
                  }
                  // Reset child fields
                  setValue("district", "");
                  setValue("districtBn", "");
                  setValue("thana", "");
                  setValue("thanaBn", "");
                }}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">{language === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}</option>
                {divisions.map((d) => (
                  <option key={d._id} value={d.name}>
                    {language === 'bn' && d.nameBn ? d.nameBn : d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="district">
                {language === 'bn' ? 'জেলা' : 'District'}
              </Label>
              <select
                id="district"
                {...register("district")}
                onChange={(e) => {
                  setValue("district", e.target.value);
                  const dist = districts.find(d => d.name === e.target.value);
                  if (dist) {
                    setValue("districtBn", dist.nameBn || "");
                  } else {
                    setValue("districtBn", "");
                  }
                  // Reset child field
                  setValue("thana", "");
                  setValue("thanaBn", "");
                }}
                disabled={!selectedDivision}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">{language === 'bn' ? 'জেলা নির্বাচন করুন' : 'Select District'}</option>
                {filteredDistricts.map((d) => (
                  <option key={d._id} value={d.name}>
                    {language === 'bn' && d.nameBn ? d.nameBn : d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="thana">
                {language === 'bn' ? 'উপজেলা/থানা' : 'Thana/Upazila'}
              </Label>
              <select
                id="thana"
                {...register("thana")}
                onChange={(e) => {
                  setValue("thana", e.target.value);
                  const thanaObj = thanas.find(t => t.name === e.target.value);
                  if (thanaObj) {
                    setValue("thanaBn", thanaObj.nameBn || "");
                  } else {
                    setValue("thanaBn", "");
                  }
                }}
                disabled={!selectedDistrict}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">{language === 'bn' ? 'থানা নির্বাচন করুন' : 'Select Thana'}</option>
                {filteredThanas.map((t) => (
                  <option key={t._id} value={t.name}>
                    {language === 'bn' && t.nameBn ? t.nameBn : t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="department">
                {t("selectDepartment", language)}
              </Label>
              <select
                id="department"
                {...register("department")}
                onChange={(e) => {
                  setValue("department", e.target.value);
                  const dept = departments.find(d => d.name === e.target.value);
                  if (dept) {
                    setValue("departmentBn", dept.nameBn || "");
                  } else {
                    setValue("departmentBn", "");
                  }
                }}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"

              >
                <option value="">{t("selectDepartment", language)}</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {language === 'bn' && dept.nameBn ? dept.nameBn : dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className={language === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="newPatientFee">
                  {t("newPatientFee", language)} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newPatientFee"
                  type="number"
                  {...register("newPatientFee", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const val = e.target.value;
                      setValue("newPatientFeeBn", convertToBengaliNumber(val));
                    }
                  })}
                  placeholder="500"
                  className="mt-1"
                />
                {errors.newPatientFee && (
                  <p className="text-sm text-red-500 mt-1">{errors.newPatientFee.message}</p>
                )}
              </div>
              <div className={language === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="newPatientFeeBn">
                  {t("newPatientFee", language)} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newPatientFeeBn"
                  type="text"
                  {...register("newPatientFeeBn", {
                    onChange: (e) => {
                      const engVal = convertToEnglishNumber(e.target.value);
                      const num = engVal ? Number(engVal) : 0;
                      setValue("newPatientFee", num);
                    }
                  })}
                  placeholder="৫০০"
                  className="mt-1"
                />
                {errors.newPatientFeeBn && (
                  <p className="text-sm text-red-500 mt-1">{errors.newPatientFeeBn.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className={language === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="reportShowFee">
                  {t("reportShowFee", language)} <span className="text-gray-500 text-xs">({t("optional", language)})</span>
                </Label>
                <Input
                  id="reportShowFee"
                  type="number"
                  {...register("reportShowFee", {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const val = e.target.value;
                      setValue("reportShowFeeBn", convertToBengaliNumber(val));
                    }
                  })}
                  placeholder="400"
                  className="mt-1"
                />
                {errors.reportShowFee && (
                  <p className="text-sm text-red-500 mt-1">{errors.reportShowFee.message}</p>
                )}
              </div>
              <div className={language === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="reportShowFeeBn">
                  {t("reportShowFee", language)} <span className="text-gray-500 text-xs">({t("optional", language)})</span>
                </Label>
                <Input
                  id="reportShowFeeBn"
                  type="text"
                  {...register("reportShowFeeBn", {
                    onChange: (e) => {
                      const engVal = convertToEnglishNumber(e.target.value);
                      const num = engVal ? Number(engVal) : 0;
                      setValue("reportShowFee", num);
                    }
                  })}
                  placeholder="৪০০"
                  className="mt-1"
                />
                {errors.reportShowFeeBn && (
                  <p className="text-sm text-red-500 mt-1">{errors.reportShowFeeBn.message}</p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <Label className="block font-semibold text-gray-900">
                  {language === 'bn' ? 'যে সকল রোগের চিকিৎসা করা হয়' : 'Diseases Treated'} <span className="text-gray-500 text-xs">({t("optional", language)})</span>
                </Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {language === 'bn' ? 'বাংলা' : 'English'}
                </span>
              </div>
              {selectedDepartment && (
                <p className="text-xs text-gray-600 mb-2">
                  {language === 'bn'
                    ? `বিভাগ অনুযায়ী রোগসমূহ দেখানো হচ্ছে: ${departments.find(d => d.name === selectedDepartment)?.nameBn || selectedDepartment}`
                    : `Showing diseases for department: ${selectedDepartment}`}
                </p>
              )}
              <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 bg-white">
                {filteredDiseases.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {language === 'bn'
                      ? selectedDepartment
                        ? 'এই বিভাগের জন্য কোনো রোগ পাওয়া যায়নি।'
                        : 'কোনো রোগ পাওয়া যায়নি। অ্যাডমিন প্যানেল থেকে রোগ যোগ করুন।'
                      : selectedDepartment
                        ? 'No diseases found for this department.'
                        : 'No diseases available. Please add diseases from the admin panel.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2" key={`diseases-${language}`}>
                    {filteredDiseases.map((disease) => {
                      // Get raw values - handle null, undefined, empty string
                      const rawBangla = disease.bangla;
                      const rawEnglish = disease.name;

                      // Convert to strings and trim
                      const banglaValue = rawBangla ? String(rawBangla).trim() : '';
                      const englishValue = rawEnglish ? String(rawEnglish).trim() : '';

                      // Check if bangla is actually different from English (not just a copy)
                      const banglaIsDifferent = banglaValue !== '' && banglaValue !== englishValue;

                      // Determine display name based on language
                      let diseaseName: string;
                      if (language === 'bn') {
                        // For Bangla language: show bangla if it exists and is different from English
                        // If bangla is same as English (no translation), still show it but it will be English text
                        diseaseName = banglaValue || englishValue;
                      } else {
                        // For English language: always show English name
                        diseaseName = englishValue || banglaValue;
                      }

                      // Debug: log first disease to verify language is working
                      if (filteredDiseases.indexOf(disease) === 0) {
                        console.log(`[DEBUG] Language: ${language}, Disease: ${diseaseName}, Bangla: ${banglaValue}, English: ${englishValue}, BanglaIsDifferent: ${banglaIsDifferent}`);
                      }

                      // Use bangla for form value if available and different, otherwise use name
                      const diseaseValue = banglaIsDifferent ? banglaValue : englishValue;

                      return (
                        <label
                          key={disease._id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDiseases.includes(diseaseValue)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const updated = [...selectedDiseases, diseaseValue];
                                setSelectedDiseases(updated);
                                setValue("diseases", updated);
                              } else {
                                const updated = selectedDiseases.filter(d => d !== diseaseValue);
                                setSelectedDiseases(updated);
                                setValue("diseases", updated);
                              }
                            }}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span
                            className="text-sm"
                       
                          >
                            {diseaseName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              {selectedDiseases.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedDiseases.length} {language === 'bn' ? 'টি রোগ নির্বাচিত হয়েছে' : 'disease(s) selected'}
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
            <div className={language === 'en' ? 'block' : 'hidden'}>
              <Label htmlFor="bio">{t("bio", language)}</Label>
              <textarea
                id="bio"
                {...register("bio")}
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                placeholder="Doctor's biography..."
              />
            </div>
            <div className={language === 'bn' ? 'block' : 'hidden'}>
              <Label htmlFor="bioBn">{t("bioBn", language)}</Label>
              <textarea
                id="bioBn"
                {...register("bioBn")}
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                placeholder="ডাক্তারের জীবনী..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                {t("availability", language)} <span className="text-red-500">*</span>
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
                      {t("selectDays", language)} <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {daysOfWeek.map((day, dayIndex) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(slotIndex, day)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${slot.days.includes(day)
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}

                        >
                          {language === 'bn' ? banglaDays[dayIndex] + 'বার' : day}
                        </button>
                      ))}
                      {(() => {
                        const isOnCall = slot.days.length === daysOfWeek.length && slot.time === "On Call" && slot.timeBn === "অন কল";

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...availabilitySlots];
                              if (isOnCall) {
                                updated[slotIndex].days = [];
                                updated[slotIndex].time = "";
                                updated[slotIndex].timeBn = "";
                              } else {
                                updated[slotIndex].days = [...daysOfWeek];
                                updated[slotIndex].time = "On Call";
                                updated[slotIndex].timeBn = "অন কল";
                              }
                              setAvailabilitySlots(updated);
                              setValue("availabilitySlots", updated);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all border shadow-sm hover:shadow ${isOnCall
                                ? "bg-amber-600 text-white border-amber-700"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300"
                              }`}
                          >
                            {t("onCall", language)}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={language === 'en' ? 'block' : 'hidden'}>
                      <Label htmlFor={`time-${slotIndex}`}>
                        {t("timeSlot", language)}
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
                    <div className={language === 'bn' ? 'block' : 'hidden'}>
                      <Label htmlFor={`timeBn-${slotIndex}`}>
                        {t("timeSlot", language)}
                      </Label>
                      <Input
                        id={`timeBn-${slotIndex}`}
                        type="text"
                        placeholder="উদাঃ সকাল ১০:০০ - বিকাল ০৪:০০"
                        value={slot.timeBn || ""}
                        onChange={(e) => updateSlotTimeBn(slotIndex, e.target.value)}
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

          <div className="flex gap-4 pt-8 pb-8">
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
            >
              {isUploading
                ? t("uploading", language)
                : isLoading
                  ? t("updating", language)
                  : t("update", language)}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-12 text-lg font-bold border-2 rounded-xl transition-all"
            >
              {t("cancel", language)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

