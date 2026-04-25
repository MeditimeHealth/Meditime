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
  ClipboardList,
  Timer
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";



export default function DiagnosticPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/diagnostic/stats");
        const data = await res.json();
        if (res.ok) setStats(data.stats || {});
      } catch (error) {
        console.error("Error fetching diagnostic stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  const categories = [
    { id: 'blood', backendId: 'Blood', icon: Activity, title: language === 'bn' ? 'ব্লাড টেস্ট' : 'Blood Tests', count: stats['Blood'] || 0, color: "text-[#0088FF]", bg: "bg-[#0088FF]/10", border: "hover:border-[#0088FF]/30" },
    { id: 'cardio', backendId: 'Cardiology', icon: HeartPulse, title: language === 'bn' ? 'কার্ডিওলজি' : 'Cardiology', count: stats['Cardiology'] || 0, color: "text-[#00D084]", bg: "bg-[#00D084]/10", border: "hover:border-[#00D084]/30" },
    { id: 'imaging', backendId: 'Imaging', icon: RadioTower, title: language === 'bn' ? 'ইমেজিং' : 'Imaging', count: stats['Imaging'] || 0, color: "text-[#FF6B00]", bg: "bg-[#FF6B00]/10", border: "hover:border-[#FF6B00]/30" },
    { id: 'pathology', backendId: 'Pathology', icon: Microscope, title: language === 'bn' ? 'প্যাথলজি' : 'Pathology', count: stats['Pathology'] || 0, color: "text-slate-600", bg: "bg-slate-100", border: "hover:border-slate-300" }
  ];

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

      {/* Category Breakdown */}
      <div className="space-y-6">
       
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Card key={cat.id} className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] border-2 border-gray-50 ${cat.border} hover:shadow-xl transition-all duration-300 group overflow-hidden relative cursor-pointer bg-white`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${cat.bg} rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`} />
              
              <div className={`${cat.bg} p-4 md:p-5 rounded-2xl mb-4 group-hover:-translate-y-1 transition-transform shadow-sm relative z-10`}>
                <cat.icon className={`h-6 w-6 md:h-8 md:w-8 ${cat.color}`} />
              </div>
              
              <div className="text-center relative z-10">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1">{cat.title}</h3>
                <div className="flex items-center justify-center gap-1.5 md:gap-2">
                  <span className={`text-xl md:text-3xl font-black ${cat.color}`}>{cat.count}</span>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest">{language === 'bn' ? 'টেস্ট' : 'Tests'}</span>
                </div>
              </div>
            </Card>
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
        <Card className="group relative overflow-hidden p-8 border-2 border-red-100 hover:border-red-300 hover:shadow-2xl hover:shadow-red-100 transition-all duration-500 rounded-3xl flex flex-col justify-between">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-all duration-500">
             <Activity className="h-64 w-64 text-red-500" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Timer className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 group-hover:text-red-500 transition-colors">
                {language === 'bn' ? 'পরিত্যক্ত কার্ট' : 'Abandoned Carts'}
              </h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-[90%]">
                {language === 'bn' ? 'যেসব পেশেন্ট টেস্ট নির্বাচন করে বুকিং সম্পন্ন করেননি তাদের ফলোআপ করুন।' : 'Follow up with patients who selected tests but didn\'t complete their booking.'}
              </p>
            </div>
          </div>
          
          <div className="relative z-10 pt-8 mt-auto flex items-center justify-between">
            <Link href="/admin/diagnostic/abandoned-carts" className="w-full">
              <Button className="w-full h-14 text-lg font-bold bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200/50 rounded-2xl group transition-all">
                {language === 'bn' ? 'পরিত্যক্ত কার্ট দেখুন' : 'View Abandoned Carts'}
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
