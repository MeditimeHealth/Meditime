"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Upload,
  Bell,
  Check,
  X,
  Globe,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface PopupFormData {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  imageUrl: string;
  buttonText: string;
  buttonTextBn: string;
  buttonLink: string;
  isActive: boolean;
}

export default function PopupManager() {
  const { language } = useLanguage();

  const [formLanguage, setFormLanguage] = useState<"en" | "bn">(
    language === "bn" ? "bn" : "en"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync formLanguage when app language changes
  useEffect(() => {
    setFormLanguage(language === "bn" ? "bn" : "en");
  }, [language]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PopupFormData>({
    defaultValues: {
      isActive: true,
      buttonLink: "#",
    },
  });

  const imageUrl = watch("imageUrl");
  const isActive = watch("isActive");

  // Only fetch once on mount — formLanguage only controls which fields are visible,
  // not which data is loaded. All fields (en + bn) are fetched and stored together.
  useEffect(() => {
    fetchPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPopup = async () => {
    try {
      const response = await fetch("/api/popup");
      const data = await response.json();
      if (data.success && data.popup) {
        reset(data.popup);
      }
    } catch (error) {
      console.error("Error fetching popup settings:", error);
      showToast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setValue("imageUrl", json.url);
        showToast.success(
          language === "bn"
            ? "ছবি আপলোড সফল হয়েছে"
            : "Image uploaded successfully"
        );
      } else {
        showToast.error("Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: PopupFormData) => {
    setSaving(true);
    try {
      const response = await fetch("/api/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        showToast.success(
          language === "bn"
            ? "সেটিংস সফলভাবে আপডেট করা হয়েছে"
            : "Settings updated successfully"
        );
        reset(result.popup);
      } else {
        showToast.error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {t("managePopup", language)}
            </h1>
            <p className="text-gray-500 mt-1 text-lg font-medium">
              {t("togglePopupHelp", language)}
            </p>
          </div>
        </div>

        {/* Language Switcher — outside <form> to avoid any form interference */}
        <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner">
          <button
            type="button"
            onClick={() => setFormLanguage("en")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              formLanguage === "en"
                ? "bg-white text-primary shadow-sm scale-105"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setFormLanguage("bn")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              formLanguage === "bn"
                ? "bg-white text-primary shadow-sm scale-105"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <Card className="p-0 border-2 border-gray-100 rounded-[2.5rem] shadow-sm bg-white overflow-hidden">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-8 bg-gray-50/80 border-b">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {isActive ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
              </div>
              <div>
                <Label
                  htmlFor="isActive"
                  className="text-xl font-black text-gray-900 leading-none"
                >
                  {t("enablePopup", language)}
                </Label>
                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">
                  {isActive
                    ? language === "bn"
                      ? "সক্রিয়"
                      : "Active"
                    : language === "bn"
                    ? "নিষ্ক্রিয়"
                    : "Inactive"}
                </p>
              </div>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              className="scale-150 data-[state=checked]:bg-primary"
            />
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left — Text Fields */}
              <div className="space-y-8">
                {/* Content fields: key forces remount on language switch so
                    react-hook-form picks up the correct registered field values */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <Globe className="h-5 w-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm">
                      {formLanguage === "en"
                        ? "English Content"
                        : "বাংলা কন্টেন্ট"}
                    </h3>
                  </div>

                  <div key={formLanguage} className="space-y-4">
                    {formLanguage === "en" ? (
                      <>
                        <div className="space-y-2">
                          <Label
                            htmlFor="title"
                            className="text-sm font-bold text-gray-600 uppercase tracking-widest"
                          >
                            {t("popupTitle", language)}
                          </Label>
                          <Input
                            id="title"
                            {...register("title", {
                              required: "Title is required",
                            })}
                            placeholder="e.g. Special Offer!"
                            className="h-14 text-lg border-2 border-gray-100 focus:border-primary rounded-2xl"
                          />
                          {errors.title && (
                            <p className="text-xs text-red-500 font-semibold">
                              {errors.title.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-sm font-bold text-gray-600 uppercase tracking-widest"
                          >
                            {t("popupDescription", language)}
                          </Label>
                          <Textarea
                            id="description"
                            {...register("description", {
                              required: "Description is required",
                            })}
                            rows={5}
                            placeholder="Enter your detailed notification message here..."
                            className="text-lg border-2 border-gray-100 focus:border-primary rounded-2xl p-4"
                          />
                          {errors.description && (
                            <p className="text-xs text-red-500 font-semibold">
                              {errors.description.message}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label
                            htmlFor="titleBn"
                            className="text-sm font-bold text-gray-600 uppercase tracking-widest"
                          >
                            {t("popupTitleBn", language)}
                          </Label>
                          <Input
                            id="titleBn"
                            {...register("titleBn")}
                            placeholder="যেমন: বিশেষ অফার!"
                            className="h-14 text-lg border-2 border-gray-100 focus:border-primary rounded-2xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="descriptionBn"
                            className="text-sm font-bold text-gray-600 uppercase tracking-widest"
                          >
                            {t("popupDescriptionBn", language)}
                          </Label>
                          <Textarea
                            id="descriptionBn"
                            {...register("descriptionBn")}
                            rows={5}
                            placeholder="আপনার অফারের বিস্তারিত এখানে লিখুন..."
                            className="text-lg border-2 border-gray-100 focus:border-primary rounded-2xl p-4"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="space-y-6 pt-6 border-t border-dashed">
                  <div className="flex items-center gap-3 text-primary">
                    <LinkIcon className="h-5 w-5" />
                    <h3 className="font-black uppercase tracking-widest text-sm">
                      {language === "bn" ? "অ্যাকশন বাটন" : "Action Button"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400 tracking-wider">
                        {formLanguage === "en"
                          ? t("buttonText", language)
                          : t("buttonTextBn", language)}
                      </Label>
                      {/* key forces remount so the correct field value is displayed */}
                      <Input
                        key={`btn-${formLanguage}`}
                        {...register(
                          formLanguage === "en" ? "buttonText" : "buttonTextBn"
                        )}
                        placeholder={
                          formLanguage === "en" ? "Learn More" : "আরও জানুন"
                        }
                        className="h-12 font-bold border-2 border-gray-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-gray-400 tracking-wider">
                        {t("buttonLink", language)}
                      </Label>
                      <Input
                        {...register("buttonLink")}
                        placeholder="/services"
                        className="h-12 font-bold border-2 border-gray-100 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — Image Upload */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-black text-gray-900">
                      {t("popupImage", language)}
                    </Label>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Recommended: 1200x800px
                    </p>
                  </div>
                </div>

                <div className="relative aspect-[4/3] w-full rounded-[2.5rem] border-4 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center overflow-hidden group hover:border-primary/30 transition-all">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="destructive"
                          size="lg"
                          onClick={() => setValue("imageUrl", "")}
                          className="font-black rounded-xl"
                        >
                          <X className="h-5 w-5 mr-2" />
                          {language === "bn" ? "ছবি মুছে ফেলুন" : "Remove Image"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-10 space-y-6">
                      <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                        <Upload className="h-10 w-10 text-gray-200 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900">
                          {t("selectImage", language)}
                        </h3>
                        <p className="text-sm font-bold text-gray-400 max-w-[200px] mx-auto leading-relaxed uppercase tracking-widest">
                          Click to upload via ImgBB
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
                        className="cursor-pointer inline-flex items-center px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-5 w-5 mr-2" />
                        )}
                        {t(uploading ? "uploading" : "selectImage", language)}
                      </Label>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-blue-700 leading-relaxed italic">
                    {language === "bn"
                      ? "টিপ: পপআপটি দৃশ্যমান রাখতে নিশ্চিত করুন যে একটি ছবি আপলোড করা হয়েছে এবং এটি সক্রিয় করা হয়েছে।"
                      : "Tip: Ensure an image is uploaded and the active toggle is ON for the popup to be visible to users."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-6 justify-center">
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[300px] h-20 text-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 rounded-3xl transition-all active:scale-95 group"
          >
            {saving ? (
              <>
                <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                {t("saving", language)}
              </>
            ) : (
              <>
                <Check className="mr-3 h-8 w-8 group-hover:scale-125 transition-transform" />
                {language === "bn" ? "সেটিংস সেভ করুন" : "Save Configuration"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}