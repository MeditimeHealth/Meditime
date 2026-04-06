"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  Search, 
  Microscope, 
  BadgeCheck,
  ChevronRight,
  FlaskConical,
  Timer,
  Heart,
  Eye,
  AlertCircle,
  Calendar,
  MapPin,
  Star,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function DiagnosticPage() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].diagnosticPage;
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookedTests, setBookedTests] = useState<string[]>([]);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/diagnostic/tests");
      const data = await res.json();
      if (res.ok) setTests(data.tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const filteredTests = tests.filter(test => {
    const name = getLocalizedValue(test.name, test.nameBn, language)?.toLowerCase() || "";
    const description = getLocalizedValue(test.description, test.descriptionBn, language)?.toLowerCase() || "";
    const category = getLocalizedValue(test.category, test.categoryBn, language)?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || description.includes(query) || category.includes(query);
  });

  const handleBooking = (testId: string) => {
    setBookedTests([...bookedTests, testId]);
  };

  const categories = [
    { id: 'blood', icon: Activity, title: t.categories.blood, count: 45, color: "bg-[#0088FF]" },
    { id: 'cardio', icon: Heart, title: t.categories.cardio, count: 12, color: "bg-[#00D084]" },
    { id: 'imaging', icon: Eye, title: t.categories.imaging, count: 18, color: "bg-[#FF6B00]" },
    { id: 'pathology', icon: Microscope, title: t.categories.pathology, count: 32, color: "bg-slate-200" },
  ];

  const diagnosticCenters = [
    {
      name: "Popular Diagnostic Centre",
      location: "Dhanmondi, Dhaka",
      rating: 4.8,
      reviews: 245,
      distance: "2.5 km",
      featured: true,
    },
    {
      name: "Ibn Sina Diagnostic Center",
      location: "Uttara, Dhaka",
      rating: 4.7,
      reviews: 189,
      distance: "5.1 km",
      featured: false,
    },
    {
      name: "Square Diagnostic Center",
      location: "Panthapath, Dhaka",
      rating: 4.9,
      reviews: 312,
      distance: "3.2 km",
      featured: true,
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="pt-24 md:pt-32 pb-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{t.heroTitle}</h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>

          <div className="relative max-w-3xl mx-auto mb-16">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-16 pl-14 pr-4 bg-white border border-slate-200 rounded-2xl focus:border-[#00B7B5] focus:ring-4 focus:ring-[#00B7B5]/10 focus:outline-none transition-all shadow-sm text-lg"
            />
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
             {categories.map((cat, idx) => {
               const Icon = cat.icon;
               return (
                 <Card key={idx} className="p-6 rounded-[2rem] border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer flex flex-col items-center group">
                   <div className={`w-14 h-14 ${cat.id === 'pathology' ? 'bg-slate-100 text-slate-400' : `${cat.color} text-white`} rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform shadow-sm`}>
                     <Icon className="w-6 h-6" />
                   </div>
                   <h3 className="font-bold text-slate-900 mb-1 text-sm md:text-base">{cat.title}</h3>
                   <p className="text-[10px] md:text-xs text-slate-500 font-medium">{cat.count} {t.testsPlus}</p>
                 </Card>
               );
             })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column (Tests List) */}
            <div className="flex-1 lg:w-3/4">
               <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                 <h2 className="text-xl font-bold text-slate-900">{language === 'en' ? 'Popular Tests' : 'জনপ্রিয় টেস্টসমূহ'}</h2>
                 <span className="text-sm font-medium text-[#00B7B5]">{filteredTests.length} {language === 'en' ? 'tests found' : 'টি টেস্ট পাওয়া গেছে'}</span>
               </div>

               <div className="space-y-4">
                 {filteredTests.length > 0 ? (
                   filteredTests.map((test, i) => (
                     <Card key={i} className="p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                       <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2 flex-wrap">
                             <h4 className="text-lg font-bold text-slate-900">{getLocalizedValue(test.name, test.nameBn, language)}</h4>
                             <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                               {getLocalizedValue(test.category, test.categoryBn, language) || t.categories.blood}
                             </span>
                           </div>
                           <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                             {getLocalizedValue(test.description, test.descriptionBn, language) || `${getLocalizedValue(test.name, test.nameBn, language)} analysis and measurement`}
                           </p>
                           <div className="flex gap-4 text-xs font-semibold text-slate-500 items-center">
                             <div className="flex items-center gap-1">
                               <CheckCircle2 className="w-3.5 h-3.5 text-[#0088FF]" /> {t.categories.blood}
                             </div>
                             {(test.fastingRequired || i % 2 === 0) && (
                               <div className="flex items-center gap-1">
                                 <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> {t.fastingRequired}
                               </div>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex flex-col md:items-end justify-center gap-3 min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Starting price</span>
                              <div className="flex items-start md:justify-end gap-1 text-slate-900 font-black text-3xl">
                                <span className="text-lg text-green-500 mt-1">৳</span>{test.price}
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleBooking(test._id)}
                              disabled={bookedTests.includes(test._id)}
                              className={`w-full ${bookedTests.includes(test._id) ? 'bg-green-500 hover:bg-green-600' : 'bg-[#0088FF] hover:bg-[#0088FF]/90'} text-white font-bold rounded-xl gap-2 h-11 transition-all`}
                            >
                              <Calendar className="w-4 h-4" />
                              {bookedTests.includes(test._id) ? (language === 'en' ? "Booked" : "বুক করা হয়েছে") : (language === 'en' ? "Book Test" : "টেস্ট বুক করুন")}
                            </Button>
                         </div>
                       </div>
                     </Card>
                   ))
                 ) : (
                   <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                     <p className="text-slate-500 font-medium text-lg">
                       {t.noTests}
                     </p>
                   </div>
                 )}
               </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:w-1/4 space-y-6">
              
              {/* Diagnostic Centers */}
              <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-5">{language === 'en' ? "Diagnostic Centers Near You" : "আপনার নিকটস্থ ডায়াগনস্টিক সেন্টার"}</h3>
                <div className="space-y-4">
                  {diagnosticCenters.map((center, idx) => (
                    <Card key={idx} className="p-4 rounded-xl border-slate-200 shadow-sm relative overflow-hidden bg-white">
                      {center.featured && (
                         <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                           Featured
                         </div>
                      )}
                      <h4 className="font-bold text-slate-900 text-sm mb-2 pr-14 leading-tight">{center.name}</h4>
                      
                      <div className="flex flex-col gap-1.5 text-xs text-slate-500 mb-3 font-medium">
                         <div className="flex items-center gap-1.5 text-slate-400">
                           <MapPin className="w-3.5 h-3.5" /> {center.location}
                         </div>
                         <div className="flex items-center gap-2">
                           <div className="flex items-center gap-1 text-slate-700 font-bold">
                             <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {center.rating}
                           </div>
                           <span className="text-slate-300">•</span>
                           <span>({center.reviews})</span>
                           <span className="text-slate-300">•</span>
                           <span>{center.distance}</span>
                         </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                         <span className="text-[10px] font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded">
                           Home Collection
                         </span>
                         <span className="text-[11px] font-bold text-[#0088FF] cursor-pointer hover:underline">
                           View Center
                         </span>
                      </div>
                    </Card>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 h-11 rounded-xl text-xs font-bold bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200">
                  {language === 'en' ? "View All Centers" : "সকল সেন্টার দেখুন"}
                </Button>
              </div>

              {/* Why Choose Us */}
              <div className="px-2 pt-4">
                <h3 className="text-sm font-bold text-slate-900 text-center mb-5">{language === 'en' ? "Why Choose Our Lab Services?" : "কেন আমাদের ল্যাব সার্ভিস বেছে নেবেন?"}</h3>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#0088FF] shrink-0" />
                    <p className="text-xs text-slate-600 font-semibold">NABL certified laboratories</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Timer className="w-4 h-4 text-[#0088FF] shrink-0" />
                    <p className="text-xs text-slate-600 font-semibold">Fast and accurate results</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#0088FF] shrink-0" />
                    <p className="text-xs text-slate-600 font-semibold">Home sample collection</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#0088FF] shrink-0" />
                    <p className="text-xs text-slate-600 font-semibold">Digital health reports</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
