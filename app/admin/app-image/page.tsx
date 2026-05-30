"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Globe, AlertCircle, Check, Smartphone, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { showToast } from "@/lib/toast";

export default function AppImageManager() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchAppImage();
  }, []);

  const fetchAppImage = async () => {
    try {
      const response = await fetch("/api/app-image");
      const data = await response.json();
      if (data.success && data.appImage) {
        setImageUrl(data.appImage.imageUrl || "");
        setIsActive(data.appImage.isActive !== undefined ? data.appImage.isActive : true);
      }
    } catch (error) {
      console.error("Error fetching app image settings:", error);
      showToast.error(language === "bn" ? "সেটিংস লোড করতে ব্যর্থ হয়েছে" : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      showToast.error(language === "bn" ? "অনুগ্রহ করে একটি ছবি নির্বাচন করুন" : "Please select an image file");
      return;
    }

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
        setImageUrl(json.url);
        showToast.success(language === "bn" ? "ছবি আপলোড সফল হয়েছে" : "Image uploaded successfully");
      } else {
        showToast.error(language === "bn" ? "ছবি আপলোড ব্যর্থ হয়েছে" : "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast.error(language === "bn" ? "ছবি আপলোড ব্যর্থ হয়েছে" : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl) {
      showToast.error(language === "bn" ? "অনুগ্রহ করে একটি ছবি আপলোড করুন" : "Please upload an image first");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/app-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, isActive }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showToast.success(
          language === "bn" ? "সেটিংস সফলভাবে সেভ করা হয়েছে" : "Settings updated successfully"
        );
      } else {
        showToast.error(result.error || (language === "bn" ? "সেভ করতে ব্যর্থ হয়েছে" : "Failed to update"));
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast.error(language === "bn" ? "সেভ করতে ব্যর্থ হয়েছে" : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">
          {language === "bn" ? "লোডিং হচ্ছে..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              {language === "bn" ? "মোবাইল অ্যাপ ছবি ম্যানেজার" : "Mobile App Image Manager"}
            </h1>
            <p className="text-gray-500 mt-1 text-base sm:text-lg font-medium">
              {language === "bn" 
                ? "অ্যাপ ডাউনলোড সেকশনের কেন্দ্রবিন্দুর ফোন স্ক্রিনশট ইমেজ পরিচালনা করুন" 
                : "Manage the smartphone preview image shown in the app download section"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Panel */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 sm:p-8 border-2 border-gray-100 rounded-[2rem] shadow-sm bg-white relative overflow-hidden">
            {/* Status Switcher Header */}
            <div className="flex items-center justify-between pb-6 border-b mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl transition-colors ${
                    isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isActive ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 leading-none">
                    {language === "bn" ? "অ্যাপ ছবি প্রদর্শন" : "Display App Image"}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
                    {isActive 
                      ? (language === "bn" ? "সক্রিয়" : "Active") 
                      : (language === "bn" ? "নিষ্ক্রিয়" : "Inactive")}
                  </p>
                </div>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked)}
                className="scale-125 data-[state=checked]:bg-primary"
              />
            </div>

            {/* Main Upload Box */}
            <div className="space-y-6">
              <div className="space-y-1">
                <Label className="text-base font-bold text-gray-900">
                  {language === "bn" ? "স্ক্রিনশট ইমেজ আপলোড করুন" : "Upload Screenshot Image"}
                </Label>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {language === "bn" 
                    ? "সুপারিশকৃত সাইজ: ৫৪০x১০৮০ পিক্সেল (লম্বা অনুপাত)" 
                    : "Recommended: Portrait layout (e.g. 540x1080px)"}
                </p>
              </div>

              <div className="relative border-4 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center group hover:border-primary/30 transition-all">
                {imageUrl ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 mx-auto w-fit font-bold text-sm">
                      <Check className="h-4 w-4 mr-2" />
                      {language === "bn" ? "ছবি নির্বাচন করা হয়েছে" : "Image selected successfully"}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setImageUrl("")}
                        className="font-bold rounded-xl h-10 px-4"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {language === "bn" ? "ছবি মুছে ফেলুন" : "Remove Image"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    <div className="bg-white p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                      <Upload className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-gray-950">
                        {language === "bn" ? "ছবি আপলোড করুন" : "Select screenshot image"}
                      </h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {language === "bn" ? "ImgBB-এর মাধ্যমে আপলোড করুন" : "Upload directly via ImgBB"}
                      </p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {language === "bn" 
                        ? (uploading ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন") 
                        : (uploading ? "Uploading..." : "Select File")}
                    </Label>
                  </div>
                )}
              </div>

              {/* Alert Tips */}
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-blue-700 leading-relaxed italic">
                  {language === "bn"
                    ? "টিপ: একটি সুন্দর পোর্ট্রেট স্ক্রিনশট ব্যবহার করুন যাতে মোবাইল ফোন ফ্রেমের সাথে নিখুঁতভাবে মানানসই হয়।"
                    : "Tip: Use a clean mobile app portrait screenshot. It will be loaded inside the phone frame on the homepage."}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-14 rounded-2xl font-bold border-2"
              onClick={() => window.location.reload()}
              disabled={saving || uploading}
            >
              {language === "bn" ? "বাতিল করুন" : "Cancel"}
            </Button>
            <Button
              type="button"
              className="flex-[2] h-14 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              onClick={handleSave}
              disabled={saving || uploading || !imageUrl}
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  {language === "bn" ? "কনফিগারেশন সেভ করুন" : "Save Configuration"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Visual Mockup Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {language === "bn" ? "লাইভ প্রিভিউ মকআপ" : "Live Preview Mockup"}
            </span>
          </div>

          {/* Premium Phone Mockup Card */}
          <div className="relative bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-xl flex items-center justify-center w-full max-w-[320px] aspect-[9/16] overflow-hidden group">
            {/* Inner Phone Case Border */}
            <div className="absolute inset-2 rounded-[2.2rem] border-8 border-slate-900 bg-slate-950 flex flex-col overflow-hidden relative shadow-inner">
              {/* Dynamic Notch / Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute left-3"></div>
              </div>

              {/* Render Image or Fallback Screen */}
              {imageUrl && isActive ? (
                <div className="w-full h-full relative z-10 select-none">
                  <Image
                    src={imageUrl}
                    alt="App preview live mockup"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-6 text-center select-none space-y-4">
                  <div className="bg-slate-800 p-4 rounded-full">
                    <ImageIcon className="h-10 w-10 text-slate-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {isActive 
                        ? (language === "bn" ? "কোন ছবি সেট করা নেই" : "No active image") 
                        : (language === "bn" ? "প্রদর্শন নিষ্ক্রিয়" : "Display inactive")}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {isActive 
                        ? (language === "bn" ? "বাম পাশে ছবি আপলোড করুন" : "Upload a screenshot on the left to preview")
                        : (language === "bn" ? "টগল অন করুন" : "Enable the display toggle to show")}
                    </p>
                  </div>
                </div>
              )}

              {/* Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full z-30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
