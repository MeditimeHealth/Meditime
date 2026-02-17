"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Image as ImageIcon, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditDiagnosticTestPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    description: "",
    descriptionBn: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/diagnostic/tests/${id}`);
      const data = await response.json();
      if (response.ok && data.test) {
        setFormData({
          name: data.test.name,
          nameBn: data.test.nameBn || "",
          description: data.test.description || "",
          descriptionBn: data.test.descriptionBn || "",
          price: data.test.price.toString(),
          image: data.test.image || "",
        });
      } else {
        showToast.error("Failed to fetch test details");
        router.push("/admin/diagnostic/tests");
      }
    } catch (error) {
      console.error("Error fetching test:", error);
      showToast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      showToast.error(language === 'bn' ? "দয়া করে টেস্টের জন্য একটি ছবি আপলোড করুন" : "Please upload an image for the test");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/diagnostic/tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: formData.name,
          nameBn: formData.nameBn,
          description: formData.description || undefined,
          descriptionBn: formData.descriptionBn || undefined,
          price: parseFloat(formData.price),
          image: formData.image,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(language === 'bn' ? "টেস্ট সফলভাবে আপডেট হয়েছে" : "Test updated successfully");
        router.push("/admin/diagnostic/tests");
        router.refresh();
      } else {
        showToast.error(data.error || "Failed to update diagnostic test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="rounded-xl border-2 hover:bg-gray-50 bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back", language)}
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("editDiagnosticTest", language)}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {language === 'bn' ? 'ডায়াগনস্টিক টেস্টের তথ্য আপডেট করুন' : 'Update diagnostic test information'}
          </p>
        </div>
      </div>

      <Card className="p-8 bg-white border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4">
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-base font-bold text-gray-700">{t("testImage", language)} <span className="text-red-500">*</span></Label>
            <div className="flex flex-col md:flex-row items-start gap-6 bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
              {formData.image ? (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-gray-200">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-40 h-40 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-300">
                   <ImageIcon className="h-16 w-16" />
                </div>
              )}
              <div className="flex-1 w-full space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploading(true);
                      const data = new FormData();
                      data.append("image", file);
                      try {
                        const res = await fetch("/api/upload/imgbb", {
                          method: "POST",
                          body: data,
                        });
                        const json = await res.json();
                        if (json.url) {
                          setFormData({ ...formData, image: json.url });
                          showToast.success("Image uploaded successfully");
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
                  }}
                  disabled={uploading}
                  className="h-12 file:bg-primary file:text-white file:border-0 file:px-4 file:h-full file:rounded-lg file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
                />
                {uploading && (
                  <div className="flex items-center text-primary font-bold">
                     <Loader2 className="h-4 w-4 animate-spin mr-2" />
                     {t("uploading", language)}
                  </div>
                )}
                <p className="text-xs text-gray-400 font-medium">Recommended: Square image, max 2MB (JPG, PNG)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {formLanguage === 'en' ? (
                <>
                  <Label htmlFor="name" className="text-base font-bold text-gray-700">
                    {t("testName", language)} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
                    required
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="nameBn" className="text-base font-bold text-gray-700">
                    {t("nameBn", language)}
                  </Label>
                  <Input
                    id="nameBn"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="সম্পূর্ণ রক্ত গণনা (CBC)"
                    className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                </>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="price" className="text-base font-bold text-gray-700">
                {t("price", language)} (৳) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="500"
                className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3">
            {formLanguage === 'en' ? (
              <>
                <Label htmlFor="description" className="text-base font-bold text-gray-700">{t("description", language)}</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Detailed description of the diagnostic test..."
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </>
            ) : (
              <>
                <Label htmlFor="descriptionBn" className="text-base font-bold text-gray-700">{t("description", language)}</Label>
                <textarea
                  id="descriptionBn"
                  value={formData.descriptionBn}
                  onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                  rows={4}
                  placeholder="টেস্টের বিস্তারিত বিবরণ লিখুন..."
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                />
              </>
            )}
          </div>

          <div className="flex gap-4 pt-8">
            <Button 
              type="submit" 
              disabled={saving || uploading}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("saving", language)}
                </>
              ) : (
                t("update", language)
              )}
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
