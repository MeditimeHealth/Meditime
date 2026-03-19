"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";


const doctorSchema = z.object({
  name: z.string().optional(),
  nameBn: z.string().optional(),
  hospital: z.string().optional(),
  department: z.string().optional(),
  specialty: z.string().optional(),
  specialtyBn: z.string().optional(),
  qualification: z.string().optional(),
  qualificationBn: z.string().optional(),
  designation: z.string().optional(),
  designationBn: z.string().optional(),
  newPatientFee: z.number().min(0).optional(),
  oldPatientFee: z.number().min(0).optional(),
  bio: z.string().optional(),
  bioBn: z.string().optional(),
  phone: z.string().optional(),
  experience: z.number().min(0).optional(),
  availability: z.array(z.object({
    days: z.array(z.string()),
    time: z.string().optional(),
    timeBn: z.string().optional(),
  })).optional(),
  image: z.string().optional(),
}).refine((data) => data.name || data.nameBn, {
  message: "At least one name (English or Bangla) is required",
  path: ["name"],
}).refine((data) => data.qualification || data.qualificationBn, {
  message: "At least one qualification (English or Bangla) is required",
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

const banglaDays = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র"];

export default function CreateDoctorPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<any[]>([]);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      nameBn: "",
      hospital: "",
      department: "",
      specialty: "",
      specialtyBn: "",
      qualification: "",
      qualificationBn: "",
      designation: "",
      designationBn: "",
      bio: "",
      bioBn: "",
      phone: "",
      image: "",
      availability: [{ days: [], time: "", timeBn: "" }],
      newPatientFee: 0,
      oldPatientFee: 0,
      experience: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "availability",
  });

  const imageUrl = watch("image");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsRes, hospsRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/locations/hospitals?limit=1000")
        ]);
        
        if (deptsRes.ok) {
          const deptsData = await deptsRes.json();
          setDepartments(deptsData.departments || []);
        }
        
        if (hospsRes.ok) {
          const hospsData = await hospsRes.json();
          setHospitals(hospsData.hospitals || []);
        }

        const diseasesRes = await fetch("/api/diseases");
        if (diseasesRes.ok) {
          const diseasesData = await diseasesRes.json();
          setDiseases(diseasesData.diseases || []);
          setFilteredDiseases(diseasesData.diseases || []);
        }
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };
    fetchData();
  }, []);

  // Sync formLanguage with global language on initial load
  useEffect(() => {
    setFormLanguage(language);
  }, [language]);

  const selectedDepartment = watch("department");
  useEffect(() => {
    if (!selectedDepartment) {
      setFilteredDiseases(diseases);
    } else {
      const filtered = diseases.filter(d => {
        const deptId = d.department?._id || d.department;
        const dept = departments.find(dep => dep.name === selectedDepartment);
        return deptId === dept?._id;
      });
      setFilteredDiseases(filtered);
    }
  }, [selectedDepartment, diseases, departments]);

  const onSubmit = async (data: DoctorFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          diseases: selectedDiseases
        }),
      });

      if (response.ok) {
        showToast.success(language === 'bn' ? "ডাক্তার প্রোফাইল সফলভাবে তৈরি করা হয়েছে" : "Doctor profile created successfully");
        router.push("/admin/doctors");
      } else {
        const err = await response.json();
        showToast.error(err.error || "Failed to create doctor profile");
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await fetch("/api/upload/imgbb", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (json.url) {
          setValue("image", json.url);
          showToast.success(language === 'bn' ? "ছবি আপলোড সফল হয়েছে" : "Image uploaded successfully");
        } else {
          showToast.error("Failed to upload image");
        }
      } catch (err) {
        console.error("Upload error:", err);
        showToast.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("createDoctorProfile", language)}
        </h1>
        <p className="text-gray-600 mt-2">
          {language === 'bn' ? 'নতুন ডাক্তারের তথ্য এবং শিডিউল যোগ করুন' : 'Add new doctor information and schedule to the system'}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex justify-end mb-8">
          <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner">
            <button
              type="button"
              onClick={() => setFormLanguage('en')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                formLanguage === 'en'
                  ? 'bg-white text-primary shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setFormLanguage('bn')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                formLanguage === 'bn'
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
              <div className={formLanguage === 'en' ? 'block' : 'hidden'}>
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
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
              </div>
              <div className={formLanguage === 'bn' ? 'block' : 'hidden'}>
                  <Label htmlFor="nameBn">
                    {t("nameBn", language)}
                  </Label>
                  <Input
                    id="nameBn"
                    {...register("nameBn")}
                    placeholder="ডাঃ জন ডো"
                    className="mt-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <div className={formLanguage === 'en' ? 'block' : 'hidden'}>
                  <Label htmlFor="specialty">
                    {t("specialty", language)}
                  </Label>
                  <Input
                    id="specialty"
                    {...register("specialty")}
                    placeholder="e.g. Cardiologist"
                    className="mt-1"
                  />
              </div>
              <div className={formLanguage === 'bn' ? 'block' : 'hidden'}>
                  <Label htmlFor="specialtyBn">
                    {t("specialtyBn", language)}
                  </Label>
                  <Input
                    id="specialtyBn"
                    {...register("specialtyBn")}
                    placeholder="হৃদরোগ বিশেষজ্ঞ"
                    className="mt-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
              </div>
            </div>

            <div>
              <div className={formLanguage === 'en' ? 'block' : 'hidden'}>
                  <Label htmlFor="qualification">
                    {t("qualification", language)} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="qualification"
                    {...register("qualification")}
                    placeholder="MBBS, MD"
                    rows={2}
                    className="mt-1"
                  />
                  {errors.qualification && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.qualification.message}
                    </p>
                  )}
              </div>
              <div className={formLanguage === 'bn' ? 'block' : 'hidden'}>
                  <Label htmlFor="qualificationBn">
                    {t("qualificationBn", language)}
                  </Label>
                  <Textarea
                    id="qualificationBn"
                    {...register("qualificationBn")}
                    placeholder="এমবিবিএস, এমডি"
                    rows={2}
                    className="mt-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                  {errors.qualification && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.qualification.message}
                    </p>
                  )}
              </div>
            </div>

            <div>
              <div className={formLanguage === 'en' ? 'block' : 'hidden'}>
                  <Label htmlFor="designation">{t("designation", language)}</Label>
                  <Input
                    id="designation"
                    {...register("designation")}
                    placeholder="e.g. Senior Consultant"
                    className="mt-1"
                  />
              </div>
              <div className={formLanguage === 'bn' ? 'block' : 'hidden'}>
                  <Label htmlFor="designationBn">{t("designationBn", language)}</Label>
                  <Input
                    id="designationBn"
                    {...register("designationBn")}
                    placeholder="সিনিয়র কনসালটেন্ট"
                    className="mt-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
              </div>
            </div>

            <div>
              <Label htmlFor="hospital">
                {t("hospitalName", formLanguage)} <span className="text-red-500">*</span>
              </Label>
              <select
                id="hospital"
                {...register("hospital")}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">{t("selectHospital", formLanguage)}</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h.name}>
                    {formLanguage === 'bn' && h.nameBn ? h.nameBn : h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="department">
                {t("selectDepartment", formLanguage)}
              </Label>
              <select
                id="department"
                {...register("department")}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
              >
                <option value="">{t("selectDepartment", formLanguage)}</option>
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>
                    {formLanguage === 'bn' && d.nameBn ? d.nameBn : d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="newPatientFee">
                {t("newPatientFee", language)}
              </Label>
              <Input
                id="newPatientFee"
                type="number"
                {...register("newPatientFee", { valueAsNumber: true })}
                placeholder="500"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="oldPatientFee">
                {t("oldPatientFee", language)}
              </Label>
              <Input
                id="oldPatientFee"
                type="number"
                {...register("oldPatientFee", { valueAsNumber: true })}
                placeholder="400"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <Label className="block font-semibold text-gray-900">
                  {language === 'bn' ? 'যে সকল রোগের চিকিৎসা করা হয় (Diseases Treated)' : 'Diseases Treated'}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const visibleValues = filteredDiseases.map(d => {
                        const rawBangla = d.bangla;
                        const rawEnglish = d.name;
                        const banglaValue = rawBangla ? String(rawBangla).trim() : '';
                        const englishValue = rawEnglish ? String(rawEnglish).trim() : '';
                        return (banglaValue !== '' && banglaValue !== englishValue) ? banglaValue : englishValue;
                      });
                      const updated = Array.from(new Set([...selectedDiseases, ...visibleValues]));
                      setSelectedDiseases(updated);
                      setValue("availability", watch("availability")); // Dummy trigger
                      // Actually we need to set diseases in form
                    }}
                    className="h-8 text-xs"
                  >
                    Select All
                  </Button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredDiseases.map((disease) => {
                  const diseaseName = formLanguage === 'bn' ? (disease.bangla || disease.name) : (disease.name || disease.bangla);
                  const diseaseValue = (disease.bangla && disease.bangla !== disease.name) ? disease.bangla : disease.name;
                  
                  return (
                    <label key={disease._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDiseases.includes(diseaseValue)}
                        onChange={(e) => {
                          const updated = e.target.checked 
                            ? [...selectedDiseases, diseaseValue]
                            : selectedDiseases.filter(d => d !== diseaseValue);
                          setSelectedDiseases(updated);
                        }}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm">{diseaseName}</span>
                    </label>
                  );
                })}
              </div>
            </div>


             <div>
              <Label htmlFor="experience">
                {formLanguage === 'bn' ? 'অভিজ্ঞতা (বছর)' : 'Experience (Years)'}
              </Label>
              <Input
                id="experience"
                type="number"
                {...register("experience", { valueAsNumber: true })}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="image">{t("profileImage", language)}</Label>
              <div className="mt-1 space-y-3">
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    disabled={loading || uploading}
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      t(imageUrl ? "changeImage" : "selectImage", language)
                    )}
                  </Button>
                  {imageUrl && (
                    <span className="text-sm text-green-600 flex items-center">
                       <ImageIcon className="h-4 w-4 mr-1"/> Image Selected
                    </span>
                  )}
                </div>
                {imageUrl && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className={formLanguage === 'en' ? 'block' : 'hidden'}>
                <Label htmlFor="bio">
                  {t("bio", language)} <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  rows={4}
                  className="mt-1"
                  placeholder="Doctor's biography..."
                />
            </div>
            <div className={formLanguage === 'bn' ? 'block' : 'hidden'}>
                <Label htmlFor="bioBn">
                  {t("bioBn", language)} <span className="text-gray-500 text-xs">(Optional)</span>
                </Label>
                <Textarea
                  id="bioBn"
                  {...register("bioBn")}
                  rows={4}
                  className="mt-1"
                  placeholder="ডাক্তারের জীবনী..."
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
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
                onClick={() => append({ days: [], time: "", timeBn: "" })}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("addSlot", language)}
              </Button>
            </div>

            {fields.map((field, slotIndex) => (
              <Card key={field.id} className="p-4 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">
                    {language === 'bn' ? 'স্লট' : 'Slot'} {slotIndex + 1}
                  </Label>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => remove(slotIndex)}
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
                      {daysOfWeek.map((day, dayIndex) => {
                         const currentDays = watch(`availability.${slotIndex}.days`) || [];
                         const isSelected = currentDays.includes(day);
                         return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                               const newDays = isSelected
                                 ? currentDays.filter(d => d !== day)
                                 : [...currentDays, day];
                               setValue(`availability.${slotIndex}.days`, newDays);
                            }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              isSelected
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            style={{
                              fontFamily: language === 'bn' ? "'Kalpurush', 'SolaimanLipi', sans-serif" : undefined
                            }}
                          >
                            {language === 'bn' ? banglaDays[dayIndex] + 'বার' : day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor={`time-${slotIndex}`}>
                        {t("timeSlot", language)} (English)
                      </Label>
                      <Input
                        id={`time-${slotIndex}`}
                        {...register(`availability.${slotIndex}.time`)}
                        placeholder="e.g. 10:00 AM - 04:00 PM"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`timeBn-${slotIndex}`}>
                        সময় স্লট (Bangla Slot)
                      </Label>
                      <Input
                        id={`timeBn-${slotIndex}`}
                        {...register(`availability.${slotIndex}.timeBn`)}
                        placeholder="উদাঃ সকাল ১০:০০ - বিকাল ০৪:০০"
                        className="mt-1"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                      />
                  </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 pt-8">
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
            >
              {uploading
                ? t("uploading", language)
                : loading
                ? (language === 'bn' ? 'তৈরি করা হচ্ছে...' : 'Creating...')
                : t("create", language)}
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
