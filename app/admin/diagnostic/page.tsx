"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Activity, 
  Building2, 
  Layers, 
  Microscope, 
  HeartPulse, 
  RadioTower, 
  Thermometer, 
  Settings,
  ArrowRight,
  TrendingUp,
  Loader2,
  ClipboardList
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

interface DiagnosticTest {
  _id: string;
  name: string;
  category: string;
}

interface DiagnosticCenter {
  _id: string;
}

export default function DiagnosticPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, centersRes] = await Promise.all([
          fetch("/api/diagnostic/tests"),
          fetch("/api/diagnostic/centers"),
        ]);
        
        const testsData = await testsRes.json();
        const centersData = await centersRes.json();
        
        if (testsRes.ok) setTests(testsData.tests || []);
        if (centersRes.ok) setCenters(centersData.centers || []);
      } catch (error) {
        console.error("Error fetching diagnostic data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  const categoryCounts = {
    "Blood Tests": tests.filter((t) => t.category === "Blood Tests").length,
    "Cardiology": tests.filter((t) => t.category === "Cardiology").length,
    "Imaging": tests.filter((t) => t.category === "Imaging").length,
    "Pathology": tests.filter((t) => t.category === "Pathology").length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Header section with brand feel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            {language === 'bn' ? 'ডায়াগনস্টিক ম্যানেজমেন্ট' : 'Diagnostic Management'}
          </h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">
            {language === 'bn' ? 'টেস্ট ক্যাটালগ এবং আপনার পার্টনার সেন্টারগুলো পরিচালনা করুন' : 'Manage test catalog and your partner diagnostic centers'}
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden p-6 border-2 border-gray-100 hover:border-primary/20 transition-all rounded-2xl group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Microscope className="h-20 w-20 text-primary rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{language === 'bn' ? 'মোট টেস্ট' : 'Total Tests'}</p>
              <h2 className="text-3xl font-black text-gray-900">{tests.length}</h2>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 border-2 border-gray-100 hover:border-primary/20 transition-all rounded-2xl group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Building2 className="h-20 w-20 text-primary -rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{language === 'bn' ? 'মোট সেন্টার' : 'Total Centers'}</p>
              <h2 className="text-3xl font-black text-gray-900">{centers.length}</h2>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 border-2 border-primary/5 bg-primary/5 rounded-2xl group">
          <div className="relative z-10 space-y-4">
            <div className="bg-primary shadow-lg shadow-primary/20 w-12 h-12 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">{language === 'bn' ? 'সেবা বৃদ্ধি' : 'Growth'}</p>
              <h2 className="text-3xl font-black text-primary">+12%</h2>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-6 border-2 border-gray-100 hover:border-primary/20 transition-all rounded-2xl group">
          <div className="relative z-10 space-y-4">
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{language === 'bn' ? 'একটিভ সেটিংস' : 'Active Config'}</p>
              <h2 className="text-3xl font-black text-gray-900">Standard</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
           <Activity className="h-5 w-5 text-primary" />
           {language === 'bn' ? 'টেস্ট ক্যাটাগরি বিশ্লেষণ' : 'Test Category Breakdown'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Blood Tests", icon: Microscope, color: "text-red-500", bg: "bg-red-50" },
            { name: "Cardiology", icon: HeartPulse, color: "text-rose-500", bg: "bg-rose-50" },
            { name: "Imaging", icon: RadioTower, color: "text-blue-500", bg: "bg-blue-50" },
            { name: "Pathology", icon: Thermometer, color: "text-orange-500", bg: "bg-orange-50" },
          ].map((cat) => (
            <div key={cat.name} className="flex items-center gap-4 bg-white p-4 rounded-2xl border-2 border-gray-50 hover:border-primary/10 hover:shadow-sm transition-all">
              <div className={`${cat.bg} p-3 rounded-xl`}>
                <cat.icon className={`h-6 w-6 ${cat.color}`} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase mb-0.5">{cat.name}</p>
                <p className="text-xl font-black text-gray-900 leading-none">{categoryCounts[cat.name as keyof typeof categoryCounts]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="group relative overflow-hidden p-8 border-2 border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl flex flex-col justify-between">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-500">
             <Layers className="h-64 w-64 text-primary" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Microscope className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                {language === 'bn' ? 'টেস্ট পরিচালনা করুন' : 'Manage Tests'}
              </h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-[90%]">
                {language === 'bn' ? 'ডায়াগনস্টিক টেস্টের ক্যাটালগ তৈরি এবং আপডেট করুন সব ক্যাটাগরি জুড়ে।' : 'Create and manage diagnostic tests across all categories with full control.'}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 pt-8 mt-auto flex items-center justify-between">
            <Link href="/admin/diagnostic/tests" className="w-full">
              <Button className="w-full h-14 text-lg font-bold bg-gray-900 hover:bg-primary text-white shadow-xl shadow-gray-200/50 rounded-2xl group transition-all">
                {language === 'bn' ? 'ম্যানেজ টেস্ট' : 'Manage Tests'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="group relative overflow-hidden p-8 border-2 border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 rounded-3xl flex flex-col justify-between">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-500">
             <Building2 className="h-64 w-64 text-primary underline" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                {language === 'bn' ? 'সেন্টার পরিচালনা করুন' : 'Manage Centers'}
              </h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-[90%]">
                {language === 'bn' ? 'সেন্টারগুলোর লোকেশন, ডিসকাউন্ট এবং অফারগুলো সেট করুন।' : 'Configure diagnostic center locations, package discounts, and special offers.'}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 pt-8 mt-auto flex items-center justify-between">
            <Link href="/admin/diagnostic/centers" className="w-full">
              <Button className="w-full h-14 text-lg font-bold bg-gray-900 hover:bg-primary text-white shadow-xl shadow-gray-200/50 rounded-2xl group transition-all">
                {language === 'bn' ? 'ম্যানেজ সেন্টার' : 'Manage Centers'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="group relative overflow-hidden p-8 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 rounded-3xl flex flex-col justify-between">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-500">
             <ClipboardList className="h-64 w-64 text-orange-500" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="h-8 w-8 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-orange-500 transition-colors">
                {language === 'bn' ? 'বুকিং পরিচালনা করুন' : 'Manage Bookings'}
              </h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-[90%]">
                {language === 'bn' ? 'পেশেন্ট বুকিং দেখুন, স্ট্যাটাস আপডেট করুন এবং রেকর্ড পরিচালনা করুন।' : 'View patient bookings, update statuses, and manage diagnostic records.'}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 pt-8 mt-auto flex items-center justify-between">
            <Link href="/admin/diagnostic/bookings" className="w-full">
              <Button className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200/50 rounded-2xl group transition-all">
                {language === 'bn' ? 'বুকিং ম্যানেজ করুন' : 'Manage Bookings'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
