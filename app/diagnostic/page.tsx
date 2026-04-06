"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  Search, 
  Home, 
  ShieldCheck, 
  Microscope, 
  FileText,
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Syringe,
  Timer
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";

const diagnosticServices = [
  {
    icon: <Syringe className="w-8 h-8" />,
    title: { en: "Home Collection", bn: "বাসায় স্যাম্পল সংগ্রহ" },
    desc: { en: "Professional phlebotomists will collect your samples safely from your home.", bn: "পেশাদার চিকিৎসাকর্মীরা আপনার বাসা থেকেই নিরাপদে স্যাম্পল সংগ্রহ করবেন।" }
  },
  {
    icon: <Microscope className="w-8 h-8" />,
    title: { en: "Advanced Lab Tests", bn: "উন্নত ল্যাব টেস্ট" },
    desc: { en: "State-of-the-art laboratory equipment for accurate and timely results.", bn: "সঠিক এবং সময়োপযোগী ফলাফলের জন্য অত্যাধুনিক ল্যাবরেটরি সরঞ্জাম।" }
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: { en: "Digital Reports", bn: "ডিজিটাল রিপোর্ট" },
    desc: { en: "Get your diagnostic reports directly on your mobile within hours.", bn: "কয়েক ঘন্টার মধ্যেই আপনার মোবাইলে ডায়াগনস্টিক রিপোর্ট পান।" }
  },
  {
    icon: <ClipboardList className="w-8 h-8" />,
    title: { en: "Health Packages", bn: "হেলথ প্যাকেজ" },
    desc: { en: "Comprehensive health check-up packages tailored for your family.", bn: "আপনার পরিবারের জন্য উপযোগী সমন্বিত স্বাস্থ্য পরীক্ষা প্যাকেজ।" }
  }
];

export default function DiagnosticPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    const query = searchQuery.toLowerCase();
    return name.includes(query) || description.includes(query);
  });

  const popularTests = tests.slice(0, 6); // Just as an example
  const [bookedTests, setBookedTests] = useState<string[]>([]);
  
  const handleBooking = (testId: string) => {
    setBookedTests([...bookedTests, testId]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#00B7B5]/5 skew-x-12 translate-x-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#00B7B5]/10 text-[#00B7B5] font-bold text-xs mb-6 uppercase tracking-widest border border-[#00B7B5]/20">
                <FlaskConical className="w-4 h-4" />
                Trusted Diagnostic Services
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                {language === 'en' ? (
                  <>Accurate Results for a <span className="text-[#00B7B5]">Healthier</span> Life</>
                ) : (
                  <>সুস্থ জীবনের জন্য <span className="text-[#00B7B5]">সঠিক</span> ডায়াগনস্টিক রিপোর্ট</>
                )}
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                {language === 'en' 
                  ? "Book lab tests online and get home sample collection. We partner with the best diagnostic centers to ensure quality."
                  : "অনলাইনে ল্যাব টেস্ট বুক করুন এবং বাসা থেকে স্যাম্পল সংগ্রহের সুবিধা নিন। গুণগত মান নিশ্চিতে আমরা সেরা ডায়াগনস্টিক সেন্টারের সাথে কাজ করি।"}
              </p>
              
              <div className="relative max-w-lg mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? "Search for tests (e.g. CBC, Diabetes)" : "টেস্টের নাম দিয়ে খুঁজুন (যেমন: CBC, ডায়াবেটিস)"}
                  className="w-full h-14 pl-12 pr-32 bg-white border-2 border-slate-200 rounded-2xl focus:border-[#00B7B5] focus:outline-none transition-all shadow-sm"
                />
                <Button 
                  className="absolute right-2 top-2 h-10 bg-[#00B7B5] hover:bg-[#00B7B5]/90 text-white rounded-xl font-bold px-6"
                >
                  {language === 'en' ? "Search" : "খুঁজুন"}
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-[#00B7B5]" />
                  NABL Certified
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-[#00B7B5]" />
                  Reports in 24h
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#00B7B5]" />
                  Home Collection
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                   <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">5k+</p>
                    <p className="text-xs font-bold text-slate-400 tracking-wider">Reports Ready</p>
                  </div>
                  <div className="bg-[#00B7B5] p-6 rounded-[2rem] shadow-xl shadow-[#00B7B5]/20 text-white flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 text-white">
                      <Microscope className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-black">100+</p>
                    <p className="text-xs font-bold opacity-80 tracking-wider text-white">Advanced Tests</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">100%</p>
                    <p className="text-xs font-bold text-slate-400 tracking-wider">Accurate Results</p>
                  </div>
                  <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-2xl">
                    <Image 
                      src="/images/diagnostic_lab_hero.png" 
                      alt="Diagnostic Lab" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">{language === 'en' ? "Our Services" : "আমাদের সেবাসমূহ"}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{language === 'en' ? "Get professional diagnostic care with the convenience of your home." : "আপনার বাড়ির আরামদায়ক পরিবেশে পেশাদার ডায়াগনস্টিক কেয়ার পান।"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {diagnosticServices.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#00B7B5]/5 transition-all text-center group"
              >
                <div className="w-20 h-20 rounded-3xl bg-[#00B7B5]/5 text-[#00B7B5] flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title[language as keyof typeof service.title]}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{service.desc[language as keyof typeof service.desc]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{language === 'en' ? "Popular Lab Tests" : "জনপ্রিয় ল্যাব টেস্টসমূহ"}</h2>
              <p className="text-slate-500 font-medium">{language === 'en' ? "Book our frequently requested tests at special rates." : "বিশেষ ছাড়ে আমাদের সবচেয়ে জনপ্রিয় টেস্টগুলো বুক করুন।"}</p>
            </div>
            <Button variant="outline" className="h-12 px-6 border-slate-200 rounded-xl font-bold text-[#00B7B5] hover:bg-[#00B7B5]/5">
              {language === 'en' ? "View All Tests" : "সব টেস্ট দেখুন"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.length > 0 ? (
              filteredTests.map((test, i) => (
                <Card key={i} className="p-6 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#00B7B5] transition-colors">
                        {getLocalizedValue(test.name, test.nameBn, language)}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">NABL Accredited</p>
                    </div>
                    <div className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                      -{test.discount || '15'}% OFF
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs line-through">৳{Math.round(test.price * 1.2)}</span>
                      <span className="text-2xl font-black text-slate-900">৳{test.price}</span>
                    </div>
                    <Button 
                      onClick={() => handleBooking(test._id)}
                      disabled={bookedTests.includes(test._id)}
                      className={`${bookedTests.includes(test._id) ? 'bg-green-500 hover:bg-green-600' : 'bg-[#00B7B5] hover:bg-[#00B7B5]/90'} text-white font-bold rounded-xl px-4 py-2 transition-all`}
                    >
                      {bookedTests.includes(test._id) 
                        ? (language === 'en' ? "Booked" : "বুক করা হয়েছে")
                        : (language === 'en' ? "Book Now" : "বুক করুন")}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">
                  {language === 'en' ? "No tests found matching your search." : "আপনার অনুসন্ধানের সাথে মিলছে এমন কোনো টেস্ট পাওয়া যায়নি।"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B7B5]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                {language === 'en' ? "Need Home Sample Collection?" : "বাসায় স্যাম্পল সংগ্রহ প্রয়োজন?"}
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                {language === 'en' 
                  ? "Schedule a phlebotomist visit at your preferred time. Quick, safe and painless sample collection."
                  : "আপনার সুবিধাজনক সময়ে স্যাম্পল সংগ্রহের জন্য যোগাযোগ করুন। দ্রুত, নিরাপদ এবং যন্ত্রণামুক্ত স্যাম্পল সংগ্রহ।"
                }
              </p>
              <Button className="h-16 px-12 bg-[#00B7B5] hover:bg-[#00B7B5]/90 text-white rounded-2xl font-black text-xl shadow-2xl shadow-[#00B7B5]/20">
                {language === 'en' ? "Call for Home Visit" : "হোম ভিজিটের জন্য কল করুন"}
              </Button>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
