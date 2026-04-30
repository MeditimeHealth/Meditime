"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { User, Mail, Phone, Shield, UserCog, Activity, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
    bloodGroup: "",
    currentPassword: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      if (response.ok && data.user) {
        setFormData(prev => ({
          ...prev,
          fullName: data.user.fullName || "",
          email: data.user.email || "",
          phoneNumber: data.user.phoneNumber || "",
          age: data.user.age?.toString() || "",
          gender: data.user.gender || "",
          bloodGroup: data.user.bloodGroup || "",
        }));
      }
    } catch (err) {
      setError(language === 'bn' ? "প্রোফাইল লোড করতে সমস্যা হয়েছে" : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError(language === 'bn' ? "নতুন পাসওয়ার্ড মিলছে না" : "New passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        age: Number(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.currentPassword = formData.currentPassword;
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setSuccess(language === 'bn' ? "প্রোফাইল সফলভাবে আপডেট হয়েছে!" : "Profile updated successfully!");
      
      // Update local storage so the UI updates immediately
      if (typeof window !== "undefined") {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data.user }));
        window.dispatchEvent(new Event("userLogin"));
      }

      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: "", password: "", confirmPassword: "" }));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserCog className="h-8 w-8 text-primary" />
                {language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
              </h1>
              <p className="text-gray-500 mt-1">
                {language === 'bn' ? 'আপনার ব্যক্তিগত তথ্য এবং পাসওয়ার্ড আপডেট করুন' : 'Update your personal information and password'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center gap-2">
              <Activity className="h-5 w-5" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm flex items-center gap-2">
              <Shield className="h-5 w-5" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information Card */}
            <Card className="p-8 shadow-md border-0 bg-white rounded-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                <User className="h-5 w-5 text-primary" />
                {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'পুরো নাম' : 'Full Name'}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      value={formData.email} 
                      disabled 
                      className="pl-10 h-12 rounded-xl bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500" 
                      title="Email cannot be changed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      name="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={handleChange} 
                      className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'বয়স' : 'Age'}</Label>
                  <Input 
                    type="number" 
                    name="age" 
                    value={formData.age} 
                    onChange={handleChange} 
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white px-4" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'লিঙ্গ' : 'Gender'}</Label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange}
                    className="flex w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                    <option value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                    <option value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                    <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</Label>
                  <select 
                    name="bloodGroup" 
                    value={formData.bloodGroup} 
                    onChange={handleChange}
                    className="flex w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="">{language === 'bn' ? 'জানা নেই' : 'Unknown'}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Security Section */}
            <Card className="p-8 shadow-md border-0 bg-white rounded-2xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">
                <Shield className="h-5 w-5 text-primary" />
                {language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)' : 'Change Password (Optional)'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}</Label>
                  <Input 
                    type="password" 
                    name="currentPassword" 
                    value={formData.currentPassword} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white px-4" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}</Label>
                  <Input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white px-4" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}</Label>
                  <Input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white px-4" 
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={saving}
                className="h-14 px-10 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {saving ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'পরিবর্তনগুলো সংরক্ষণ করুন' : 'Save Changes')}
              </Button>
            </div>
          </form>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
