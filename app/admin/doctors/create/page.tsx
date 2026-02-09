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
import { Plus, X, Loader2, Image as ImageIcon, Check, Stethoscope, GraduationCap, Briefcase, DollarSign, Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const doctorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  nameBn: z.string().optional(),
  hospital: z.string().optional(),
  department: z.string().optional(),
  specialty: z.string().optional(),
  specialtyBn: z.string().optional(),
  qualification: z.string().optional(),
  qualificationBn: z.string().optional(),
  designation: z.string().optional(),
  designationBn: z.string().optional(),
  consultationFee: z.number().min(0).optional(),
  newPatientFee: z.number().min(0).optional(),
  oldPatientFee: z.number().min(0).optional(),
  bio: z.string().optional(),
  bioBn: z.string().optional(),
  phone: z.string().optional(),
  experience: z.number().min(0).optional(),
  availability: z.array(z.object({
    days: z.array(z.string()),
    time: z.string(),
  })).optional(),
  image: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function CreateDoctorPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);

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
      availability: [{ days: [], time: "" }],
      consultationFee: 0,
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
          fetch("/api/hospitals")
        ]);
        const deptsData = await deptsRes.json();
        const hospsData = await hospsRes.json();
        setDepartments(deptsData.departments || []);
        setHospitals(hospsData.hospitals || []);
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: DoctorFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("createDoctorProfile", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {language === 'bn' ? 'নতুন ডাক্তারের তথ্য এবং শিডিউল যোগ করুন' : 'Add new doctor information and schedule to the system'}
          </p>
        </div>
        <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner h-fit">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Image Section */}
        <Card className="p-8 border-2 border-primary/5 shadow-sm rounded-2xl bg-white overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              {imageUrl ? (
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-2 ring-primary/10">
                  <img src={imageUrl} alt="Doctor" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  <button
                    type="button"
                    onClick={() => setValue("image", "")}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="text-white h-8 w-8" />
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-50 border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 group-hover:border-primary/30 transition-all">
                  <ImageIcon className="h-12 w-12 mb-2 opacity-30" />
                  <span className="text-xs font-bold uppercase tracking-wider">{t("selectImage", language)}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-800">{t("profileImage", language)}</h3>
              <p className="text-sm text-gray-500 font-medium">
                {language === 'bn' ? 'ডাক্তারের একটি পরিষ্কার এবং পেশাদার ছবি আপলোড করুন।' : 'Upload a clear and professional headshot for the medical profile.'}
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="doctor-image-upload"
              />
              <Label
                htmlFor="doctor-image-upload"
                className="inline-flex items-center px-6 py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold rounded-xl cursor-pointer transition-all shadow-sm"
              >
                {t(imageUrl ? "changeImage" : "selectImage", language)}
              </Label>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6 rounded-2xl border-2 border-gray-100 shadow-sm bg-white">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {formLanguage === 'en' ? (
                  <>
                    <Label htmlFor="name" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("name", language)} <span className="text-red-500">*</span></Label>
                    <Input id="name" {...register("name")} placeholder="Dr. John Doe" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" />
                    {errors.name && <p className="text-sm text-red-500 font-bold">{errors.name.message}</p>}
                  </>
                ) : (
                  <>
                    <Label htmlFor="nameBn" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("nameBn", language)}</Label>
                    <Input id="nameBn" {...register("nameBn")} placeholder="ডাঃ জন ডো" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }} />
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("phone", language)}</Label>
                <Input id="phone" {...register("phone")} placeholder="+88017..." className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6 rounded-2xl border-2 border-gray-100 shadow-sm bg-white">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              {language === 'bn' ? 'পেশাদার তথ্য' : 'Professional Background'}
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {formLanguage === 'en' ? (
                  <>
                    <Label htmlFor="qualification" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("qualification", language)}</Label>
                    <Input id="qualification" {...register("qualification")} placeholder="MBBS, FCPS" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" />
                  </>
                ) : (
                  <>
                    <Label htmlFor="qualificationBn" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("qualificationBn", language)}</Label>
                    <Input id="qualificationBn" {...register("qualificationBn")} placeholder="এমবিবিএস, এফসিপিএস" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }} />
                  </>
                )}
              </div>

              <div className="space-y-2">
                {formLanguage === 'en' ? (
                  <>
                    <Label htmlFor="designation" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("designation", language)}</Label>
                    <Input id="designation" {...register("designation")} placeholder="Associate Professor" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" />
                  </>
                ) : (
                  <>
                    <Label htmlFor="designationBn" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("designationBn", language)}</Label>
                    <Input id="designationBn" {...register("designationBn")} placeholder="সহযোগী অধ্যাপক" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }} />
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Specialization & Experience */}
        <Card className="p-8 space-y-8 rounded-2xl border-2 border-gray-100 shadow-sm bg-white">
           <h2 className="text-xl font-bold text-gray-800 border-b pb-4 flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              {formLanguage === 'bn' ? 'বিশেষজ্ঞ এবং অভিজ্ঞতা' : 'Specialization & Experience'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                {formLanguage === 'en' ? (
                  <>
                    <Label htmlFor="specialty" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("specialty", language)}</Label>
                    <Input id="specialty" {...register("specialty")} placeholder="Cardiologist" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" />
                  </>
                ) : (
                  <>
                    <Label htmlFor="specialtyBn" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("specialtyBn", language)}</Label>
                    <Input id="specialtyBn" {...register("specialtyBn")} placeholder="হৃদরোগ বিশেষজ্ঞ" className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }} />
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("selectDepartment", formLanguage)}</Label>
                <select 
                  id="department" 
                  {...register("department")} 
                  className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg focus:ring-primary outline-none transition-all"
                >
                  <option value="">{t("selectDepartment", formLanguage)}</option>
                  {departments.map(d => (
                    <option key={d._id} value={d.name}>{formLanguage === 'bn' && d.nameBn ? d.nameBn : d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{formLanguage === 'bn' ? 'অভিজ্ঞতা (বছর)' : 'Experience (Years)'}</Label>
                <Input id="experience" type="number" {...register("experience", { valueAsNumber: true })} className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary" />
              </div>
            </div>
        </Card>

        {/* Fees & Hospital */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6 rounded-2xl border-2 border-gray-100 shadow-sm bg-white">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              {language === 'bn' ? 'ফি সংক্রান্ত তথ্য' : 'Consultation Fees'}
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="consultationFee" className="text-xs font-black uppercase text-gray-400 tracking-[0.1em]">{t("consultationFee", language)}</Label>
                <Input id="consultationFee" type="number" {...register("consultationFee", { valueAsNumber: true })} className="h-12 text-lg font-black border-gray-200 rounded-xl bg-primary/5 text-primary" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPatientFee" className="text-xs font-black uppercase text-gray-400 tracking-[0.1em]">{t("newPatientFee", language)}</Label>
                <Input id="newPatientFee" type="number" {...register("newPatientFee", { valueAsNumber: true })} className="h-12 text-lg font-black border-gray-200 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldPatientFee" className="text-xs font-black uppercase text-gray-400 tracking-[0.1em]">{t("oldPatientFee", language)}</Label>
                <Input id="oldPatientFee" type="number" {...register("oldPatientFee", { valueAsNumber: true })} className="h-12 text-lg font-black border-gray-200 rounded-xl" />
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-6 rounded-2xl border-2 border-gray-100 shadow-sm bg-white">
             <h2 className="text-xl font-bold text-gray-800 border-b pb-4 flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              {formLanguage === 'bn' ? 'হাসপাতাল নিবার্চন করুন' : 'Hospital Placement'}
            </h2>
            <div className="space-y-4">
              <Label htmlFor="hospital" className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t("hospitalName", formLanguage)}</Label>
              <select 
                id="hospital" 
                {...register("hospital")} 
                className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg focus:ring-primary outline-none transition-all"
              >
                <option value="">{t("selectHospital", formLanguage)}</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h.name}>{formLanguage === 'bn' && h.nameBn ? h.nameBn : h.name}</option>
                ))}
              </select>
            </div>
          </Card>
        </div>

        {/* Bio */}
        <Card className="p-8 space-y-6 rounded-2xl border-2 border-gray-100 shadow-sm bg-white">
           <div className="space-y-2">
            {formLanguage === 'en' ? (
              <>
                <Label htmlFor="bio" className="text-base font-bold text-gray-700">{t("bio", language)}</Label>
                <Textarea id="bio" {...register("bio")} rows={5} placeholder="Dr. John Doe has over 14 years of experience..." className="text-lg border-gray-200 rounded-xl p-4 focus:ring-primary" />
              </>
            ) : (
              <>
                <Label htmlFor="bioBn" className="text-base font-bold text-gray-700">{t("bioBn", language)}</Label>
                <Textarea id="bioBn" {...register("bioBn")} rows={5} placeholder="ডাঃ জন ডো এর ১৪ বছরের বেশি অভিজ্ঞতা রয়েছে..." className="text-lg border-gray-200 rounded-xl p-4 focus:ring-primary" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }} />
              </>
            )}
           </div>
        </Card>

        {/* Availability */}
        <Card className="p-8 space-y-8 rounded-2xl border-2 border-primary/10 shadow-lg bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center">
              <div className="bg-primary text-white p-2 rounded-xl mr-4">
                <Calendar className="h-6 w-6" />
              </div>
              {t("availability", language)}
            </h2>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ days: [], time: "" })}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-black px-6 py-4 rounded-xl"
            >
              <Plus className="h-5 w-5 mr-1" />
              {t("addSlot", language)}
            </Button>
          </div>

          <div className="space-y-8">
            {fields.map((field, index) => (
              <div key={field.id} className="relative p-8 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-primary/20 transition-all animate-in zoom-in-95">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {t("selectDays", language)}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                        const currentDays = watch(`availability.${index}.days`) || [];
                        const isSelected = currentDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const newDays = isSelected
                                ? currentDays.filter(d => d !== day)
                                : [...currentDays, day];
                              setValue(`availability.${index}.days`, newDays);
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                              isSelected
                                ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105"
                                : "bg-white border-gray-200 text-gray-500 hover:border-primary/30"
                            }`}
                          >
                            {language === 'bn' ? (
                              day === 'Saturday' ? 'শনিবার' :
                              day === 'Sunday' ? 'রবিবার' :
                              day === 'Monday' ? 'সোমবার' :
                              day === 'Tuesday' ? 'মঙ্গলবার' :
                              day === 'Wednesday' ? 'বুধবার' :
                              day === 'Thursday' ? 'বৃহস্পতিবার' : 'শুক্রবার'
                            ) : day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black uppercase text-gray-400 tracking-widest flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {t("timeSlot", language)}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        {...register(`availability.${index}.time`)}
                        placeholder="e.g. 05:00 PM - 09:00 PM"
                        className="h-14 text-lg font-bold border-gray-200 rounded-xl bg-white"
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => remove(index)}
                          className="h-14 w-14 rounded-xl text-red-500 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="h-6 w-6" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 pt-10 sticky bottom-0 bg-white/80 backdrop-blur-md p-6 border-t z-10 -mx-6">
          <Button 
            type="submit" 
            disabled={loading} 
            className="flex-1 h-16 text-2xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                {t("saving", language)}
              </>
            ) : (
              t("createDoctorProfile", language)
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="flex-1 h-16 text-2xl font-black border-4 border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
          >
            {t("cancel", language)}
          </Button>
        </div>
      </form>
    </div>
  );
}
