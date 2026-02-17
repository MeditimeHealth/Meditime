"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Percent, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditDiagnosticCenterPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [divisions, setDivisions] = useState<Array<{_id: string; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{_id: string; name: string}>>([]);
  const [thanas, setThanas] = useState<Array<{_id: string; name: string}>>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    division: "",
    district: "",
    thana: "",
    address: "",
    phone: "",
    email: "",
    packageDiscount: "",
    minTestsForPackage: "3",
  });

  useEffect(() => {
    const init = async () => {
      await fetchDivisions();
      await fetchCenter();
    };
    init();
  }, [id]);

  useEffect(() => {
    if (formData.division && divisions.length > 0) {
      const division = divisions.find(d => d.name === formData.division);
      if (division) {
        fetch(`/api/locations/districts?division=${division._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.districts) setDistricts(data.districts);
          });
      }
    } else {
      setDistricts([]);
      setThanas([]);
    }
  }, [formData.division, divisions]);

  useEffect(() => {
    if (formData.district && districts.length > 0) {
      const district = districts.find(d => d.name === formData.district);
      if (district) {
        fetch(`/api/locations/thanas?district=${district._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.thanas) setThanas(data.thanas);
          });
      }
    } else {
      setThanas([]);
    }
  }, [formData.district, districts]);

  const fetchDivisions = async () => {
    try {
      const response = await fetch("/api/locations/divisions");
      const data = await response.json();
      if (response.ok) {
        setDivisions(data.divisions);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchCenter = async () => {
    try {
      const response = await fetch(`/api/diagnostic/centers/${id}`);
      const data = await response.json();
      if (response.ok && data.center) {
        setFormData({
          name: data.center.name,
          nameBn: data.center.nameBn || "",
          division: data.center.division || "",
          district: data.center.district || "",
          thana: data.center.thana || "",
          address: data.center.address || "",
          phone: data.center.phone || "",
          email: data.center.email || "",
          packageDiscount: data.center.packageDiscount?.toString() || "",
          minTestsForPackage: data.center.minTestsForPackage?.toString() || "3",
        });
      } else {
        showToast.error("Failed to fetch center details");
        router.push("/admin/diagnostic/centers");
      }
    } catch (error) {
      console.error("Error fetching center:", error);
      showToast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/diagnostic/centers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: formData.name,
          nameBn: formData.nameBn,
          division: formData.division || undefined,
          district: formData.district || undefined,
          thana: formData.thana || undefined,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          packageDiscount: formData.packageDiscount ? parseFloat(formData.packageDiscount) : 0,
          minTestsForPackage: formData.minTestsForPackage ? parseInt(formData.minTestsForPackage) : 3,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(language === 'bn' ? "সেন্টার সফলভাবে আপডেট হয়েছে" : "Center updated successfully");
        router.push("/admin/diagnostic/centers");
        router.refresh();
      } else {
        showToast.error(data.error || "Failed to update diagnostic center");
      }
    } catch (error) {
      console.error("Error updating center:", error);
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
            {t("editDiagnosticCenter", language)}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {language === 'bn' ? 'ডায়াগনস্টিক সেন্টারের তথ্য আপডেট করুন' : 'Update diagnostic center information'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {formLanguage === 'en' ? (
                <>
                  <Label htmlFor="name" className="text-base font-bold text-gray-700">
                    {t("diagnosticCenterName", language)} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Square Diagnostic Center"
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
                    placeholder="স্কয়ার ডায়াগনস্টিক সেন্টার"
                    className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                </>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="division" className="text-base font-bold text-gray-700">{t("division", language)}</Label>
              <select
                id="division"
                value={formData.division}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    division: e.target.value,
                    district: "",
                    thana: "",
                  });
                }}
                className="flex w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg focus:ring-primary focus:border-primary outline-none transition-all"
              >
                <option value="">{t("selectDivision", language)}</option>
                {divisions.map((div) => (
                  <option key={div._id} value={div.name}>{div.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="district" className="text-base font-bold text-gray-700">{t("district", language)}</Label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => {
                  setFormData({ ...formData, district: e.target.value, thana: "" });
                }}
                disabled={!formData.division}
                className="flex w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg focus:ring-primary focus:border-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{t("selectDistrict", language)}</option>
                {districts.map((dist) => (
                  <option key={dist._id} value={dist.name}>{dist.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="thana" className="text-base font-bold text-gray-700">{t("thana", language)}</Label>
              <select
                id="thana"
                value={formData.thana}
                onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                disabled={!formData.district}
                className="flex w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg focus:ring-primary focus:border-primary outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{t("selectThana", language)}</option>
                {thanas.map((thana) => (
                  <option key={thana._id} value={thana.name}>{thana.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="address" className="text-base font-bold text-gray-700">{t("address", language)}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Road, Area, City"
              className="h-12 text-lg border-gray-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-base font-bold text-gray-700">{t("phone", language)}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+8801234567890"
                className="h-12 text-lg border-gray-200 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-bold text-gray-700">{t("email", language)}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="center@example.com"
                className="h-12 text-lg border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
            <div className="space-y-3">
              <Label htmlFor="packageDiscount" className="text-base font-bold text-primary flex items-center">
                <Percent className="h-4 w-4 mr-1" />
                {t("packageDiscount", language)}
              </Label>
              <Input
                id="packageDiscount"
                type="number"
                min="0"
                max="100"
                value={formData.packageDiscount}
                onChange={(e) => setFormData({ ...formData, packageDiscount: e.target.value })}
                placeholder="10"
                className="h-12 text-lg bg-white border-gray-200 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="minTestsForPackage" className="text-base font-bold text-primary flex items-center">
                <Layers className="h-4 w-4 mr-1" />
                {t("minTestsForPackage", language)}
              </Label>
              <Input
                id="minTestsForPackage"
                type="number"
                min="1"
                value={formData.minTestsForPackage}
                onChange={(e) => setFormData({ ...formData, minTestsForPackage: e.target.value })}
                placeholder="3"
                className="h-12 text-lg bg-white border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <Button 
              type="submit" 
              disabled={saving}
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
