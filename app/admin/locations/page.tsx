"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Trash2, Map, Navigation, Locate, Building2, Loader2, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface Division {
  _id: string;
  name: string;
  nameBn?: string;
}

interface District {
  _id: string;
  name: string;
  nameBn?: string;
  division: Division;
}

interface Thana {
  _id: string;
  name: string;
  nameBn?: string;
  district: District;
}

interface Hospital {
  _id: string;
  name: string;
  nameBn?: string;
  thana?: Thana;
  address?: string;
  phone?: string;
  email?: string;
}

type TabType = "division" | "district" | "thana" | "hospital";

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("division");
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);

  // Data states
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [thanas, setThanas] = useState<Thana[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    division: "",
    district: "",
    thana: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (!showForm) {
      setFormLanguage(language);
    }
  }, [language, showForm]);

  // Fetch divisions when needed
  useEffect(() => {
    if (activeTab === "district" || activeTab === "thana" || activeTab === "hospital") {
      fetch("/api/locations/divisions")
        .then((res) => res.json())
        .then((data) => {
          if (data.divisions) setDivisions(data.divisions);
        });
    }
  }, [activeTab]);

  // Fetch districts when division is selected
  useEffect(() => {
    if (formData.division && (activeTab === "district" || activeTab === "thana")) {
      fetch(`/api/locations/districts?division=${formData.division}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.districts) setDistricts(data.districts);
        });
    }
  }, [formData.division, activeTab]);

  // Fetch thanas when district is selected
  useEffect(() => {
    if (formData.district && activeTab === "thana") {
      fetch(`/api/locations/thanas?district=${formData.district}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.thanas) setThanas(data.thanas);
        });
    }
  }, [formData.district, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "division") {
        const res = await fetch("/api/locations/divisions");
        const data = await res.json();
        if (res.ok) setDivisions(data.divisions);
      } else if (activeTab === "district") {
        const res = await fetch("/api/locations/districts");
        const data = await res.json();
        if (res.ok) setDistricts(data.districts);
      } else if (activeTab === "thana") {
        const res = await fetch("/api/locations/thanas");
        const data = await res.json();
        if (res.ok) setThanas(data.thanas);
      } else if (activeTab === "hospital") {
        const res = await fetch("/api/locations/hospitals");
        const data = await res.json();
        if (res.ok) setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = "";
      const method = "POST";
      let body: any = {};

      if (activeTab === "division") {
        url = "/api/locations/divisions";
        body = { name: formData.name, nameBn: formData.nameBn };
      } else if (activeTab === "district") {
        url = "/api/locations/districts";
        body = { name: formData.name, nameBn: formData.nameBn, division: formData.division };
      } else if (activeTab === "thana") {
        url = "/api/locations/thanas";
        body = { name: formData.name, nameBn: formData.nameBn, district: formData.district };
      } else if (activeTab === "hospital") {
        url = "/api/locations/hospitals";
        body = {
          name: formData.name,
          nameBn: formData.nameBn,
          thana: formData.thana || undefined,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showToast.success(editingId ? "Updated successfully" : "Created successfully");
        setShowForm(false);
        resetForm();
        fetchData();
      } else {
        showToast.error(data.error || "Failed to save");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?" : "Are you sure you want to delete this?")) return;

    try {
      let endpoint = "";
      switch (activeTab) {
        case "division": endpoint = `/api/locations/divisions/${id}`; break;
        case "district": endpoint = `/api/locations/districts/${id}`; break;
        case "thana": endpoint = `/api/locations/thanas/${id}`; break;
        case "hospital": endpoint = `/api/locations/hospitals/${id}`; break;
      }

      const response = await fetch(endpoint, { method: "DELETE" });

      if (response.ok) {
        showToast.success("Deleted successfully");
        fetchData();
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showToast.error("An error occurred");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameBn: "",
      division: "",
      district: "",
      thana: "",
      address: "",
      phone: "",
      email: "",
    });
    setEditingId(null);
  };

  const tabs = [
    { id: "division" as TabType, label: t("divisions", language), icon: Map },
    { id: "district" as TabType, label: t("districts", language), icon: Navigation },
    { id: "thana" as TabType, label: t("thanas", language), icon: Locate },
    { id: "hospital" as TabType, label: "Hospitals", icon: Building2 },
  ];

  if (loading && divisions.length === 0 && districts.length === 0 && thanas.length === 0 && hospitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("manageLocations", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {language === 'bn' ? 'বিভাগ, জেলা, থানা এবং হাসপাতালের অবস্থান পরিচালনা করুন' : 'Administrative control over geographic medical infrastructure'}
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-6 text-lg font-semibold rounded-xl shadow-md transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {language === 'bn' ? `${tabs.find(t => t.id === activeTab)?.label} যোগ করুন` : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 bg-gray-100/50 p-2 rounded-2xl border border-gray-100 shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowForm(false);
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm scale-105 border border-primary/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`h-5 w-5 ${activeTab === tab.id ? "text-primary" : "text-gray-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {showForm && (
        <Card className="p-8 bg-white border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {language === 'bn' ? `${tabs.find(t => t.id === activeTab)?.label} যোগ করুন` : `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setShowForm(false); resetForm(); }}
              className="rounded-full h-10 w-10 p-0 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-end mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className={formLanguage === 'en' ? 'block' : 'hidden'}>
                  <Label htmlFor="name" className="text-base font-bold text-gray-700">{t("name", language)} <span className="text-gray-400 text-sm">({t("optional", language)})</span></Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dhaka" className="h-12 text-lg rounded-xl mt-2" required={formLanguage === 'en' && activeTab === 'division'} />
                </div>
                <div className={formLanguage === 'bn' ? 'block' : 'hidden'}>
                  <Label htmlFor="nameBn" className="text-base font-bold text-gray-700">{t("nameBn", language)} <span className="text-red-500">*</span></Label>
                  <Input id="nameBn" value={formData.nameBn} onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })} placeholder="ঢাকা" className="h-12 text-lg rounded-xl mt-2"  required={formLanguage === 'bn'} />
                </div>
              </div>

              {(activeTab === "district" || activeTab === "thana") && (
                <div className="space-y-3">
                  <Label htmlFor="division" className="text-base font-bold text-gray-700">{t("division", language)} <span className="text-red-500">*</span></Label>
                  <select
                    id="division"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value, district: "" })}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg focus:ring-primary outline-none"
                    required
                  >
                    <option value="">{t("selectDivision", language)}</option>
                    {divisions.map((div) => (
                      <option key={div._id} value={div._id}>{div.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "thana" && (
                <div className="space-y-3">
                  <Label htmlFor="district" className="text-base font-bold text-gray-700">{t("district", language)} <span className="text-red-500">*</span></Label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    disabled={!formData.division}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg focus:ring-primary outline-none disabled:bg-gray-50"
                    required
                  >
                    <option value="">{t("selectDistrict", language)}</option>
                    {districts.map((dist) => (
                      <option key={dist._id} value={dist._id}>{dist.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {activeTab === "hospital" && (
              <div className="space-y-8 bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="hospital-thana" className="text-base font-bold text-gray-700">{t("thana", language)}</Label>
                    <select
                      id="hospital-thana"
                      value={formData.thana}
                      onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg"
                    >
                      <option value="">{t("selectThana", language)}</option>
                      {thanas.map((t) => (
                        <option key={t._id} value={t._id}>{t.name} ({t.district?.name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-base font-bold text-gray-700">{t("address", language)}</Label>
                    <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Hospital St." className="h-12 text-lg" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-base font-bold text-gray-700">{t("phone", language)}</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+88017..." className="h-12 text-lg" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-base font-bold text-gray-700">{t("email", language)}</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="hosp@meditime.com" className="h-12 text-lg" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={loading} className="flex-1 h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-lg rounded-xl">
                {loading ? <Loader2 className="animate-spin h-6 w-6 mr-2" /> : t("create", language)}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-14 text-xl font-bold border-2 rounded-xl">
                {t("cancel", language)}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-8 border-2 border-gray-100 rounded-3xl shadow-sm bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <Loader2 className="h-12 w-12 animate-spin text-gray-200" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "division" && divisions.map(div => (
              <Card key={div._id} className="p-5 flex items-center justify-between group hover:border-primary/30 hover:shadow-md transition-all rounded-2xl bg-gray-50/30">
                <div>
                  <div className="font-extrabold text-gray-900 text-lg">{div.name}</div>
                  {div.nameBn && <div className="text-sm font-bold text-gray-400 mt-1">{div.nameBn}</div>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(div._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full h-10 w-10 p-0">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </Card>
            ))}

            {activeTab === "district" && districts.map(dist => (
              <Card key={dist._id} className="p-5 flex flex-col justify-between group hover:border-primary/30 hover:shadow-md transition-all rounded-2xl bg-gray-50/30 gap-4">
                <div className="flex justify-between items-start">
                   <div>
                    <div className="font-extrabold text-gray-900 text-lg">{dist.name}</div>
                    {dist.nameBn && <div className="text-sm font-bold text-gray-400 mt-1">{dist.nameBn}</div>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(dist._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full h-10 w-10 p-0">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-primary bg-primary/5 w-fit px-2 py-1 rounded">
                   {dist.division?.name}
                </div>
              </Card>
            ))}

            {activeTab === "thana" && thanas.map(thana => (
              <Card key={thana._id} className="p-5 flex flex-col justify-between group hover:border-primary/30 hover:shadow-md transition-all rounded-2xl bg-gray-50/30 gap-4">
                <div className="flex justify-between items-start">
                   <div>
                    <div className="font-extrabold text-gray-900 text-lg">{thana.name}</div>
                    {thana.nameBn && <div className="text-sm font-bold text-gray-400 mt-1">{thana.nameBn}</div>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(thana._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full h-10 w-10 p-0">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex gap-2">
                   <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded">
                      {thana.district?.division?.name}
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {thana.district?.name}
                   </div>
                </div>
              </Card>
            ))}

            {activeTab === "hospital" && hospitals.map(hosp => (
              <Card key={hosp._id} className="p-6 flex flex-col justify-between group hover:border-primary/30 hover:shadow-md transition-all rounded-[2rem] bg-gray-50/30 gap-6">
                <div className="flex justify-between items-start pt-2 pr-2">
                   <div className="space-y-4">
                    <div>
                      <div className="font-black text-gray-900 text-xl leading-tight">{hosp.name}</div>
                      {hosp.nameBn && <div className="text-sm font-bold text-gray-400 mt-1">{hosp.nameBn}</div>}
                    </div>
                    
                    <div className="space-y-2">
                      {hosp.thana && (
                        <div className="flex items-start gap-2 text-xs font-bold text-gray-500">
                           <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary/50" />
                           <span>{hosp.thana.name}, {hosp.thana.district?.name}</span>
                        </div>
                      )}
                      {hosp.phone && (
                        <div className="flex items-center gap-2 text-xs font-black text-green-600">
                           <Phone className="h-3.5 w-3.5" />
                           <span>{hosp.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(hosp._id)} className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full h-10 w-10 p-0 shrink-0">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
