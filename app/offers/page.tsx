"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Tag, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  Gift, 
  Flame, 
  Percent,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const offers = [
  {
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop",
    category: { en: "Health Checkup", bn: "স্বাস্থ্য পরীক্ষা" },
    title: { en: "Full Body Master Checkup Package", bn: "সম্পূর্ণ বডি মাস্টার চেকআপ প্যাকেজ" },
    desc: { en: "Comprehensive 60+ parameters tested with expert physical consultation. Limited time offer.", bn: "৬০টিরও বেশি প্যারামিটার এবং বিশেষজ্ঞ পরামর্শসহ কমপ্রিহেনসিভ চেকআপ। সীমিত সময়ের অফার।" },
    discount: "30% OFF",
    expiry: { en: "Ends in 5 days", bn: "৫ দিন বাকি" },
    trending: true
  },
  {
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop",
    category: { en: "Diagnostic", bn: "ডায়াগনস্টিক" },
    title: { en: "Flat 20% Discount on All Lab Tests", bn: "সকল ল্যাব টেস্টে ফ্ল্যাট ২০% ছাড়" },
    desc: { en: "Enjoy significant savings on blood tests, scans, and all diagnostic services.", bn: "রক্ত পরীক্ষা, স্ক্যান এবং সকল ডায়াগনস্টিক সেবায় বিশাল ছাড় উপভোগ করুন।" },
    discount: "20% OFF",
    expiry: { en: "Valid till 30 April", bn: "৩০ এপ্রিল পর্যন্ত" },
    trending: false
  },
  {
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=2070&auto=format&fit=crop",
    category: { en: "Dental", bn: "ডেন্টাল" },
    title: { en: "Free Dental Consultation & Cleaning", bn: "ফ্রি ডেন্টাল কনসালটেশন ও ক্লিনিং" },
    desc: { en: "Get a bright smile with our expert dentists. Free cleaning with any filling procedure.", bn: "আমাদের বিশেষজ্ঞ ডেন্টিস্টদের সাথে সুন্দর হাসি পান। যেকোনো ফিলিংয়ের সাথে ফ্রি ক্লিনিং।" },
    discount: "FREE CLEANING",
    expiry: { en: "Limited Slots", bn: "সীমিত স্লট" },
    trending: true
  },
  {
    image: "https://images.unsplash.com/photo-1582719202047-76d3432ee323?q=80&w=2070&auto=format&fit=crop",
    category: { en: "Maternity", bn: "মাতৃত্ব" },
    title: { en: "Premium Maternity Delivery Package", bn: "প্রিমিয়াম মেটারনিটি ডেলিভারি প্যাকেজ" },
    desc: { en: "Special discounts on maternity packages including post-delivery care and neonatal support.", bn: "পোস্ট-ডেলিভারি কেয়ার এবং নিওনেটাল সাপোর্টসহ মেটারনিটি প্যাকেজে বিশেষ ছাড়।" },
    discount: "৳5,000 OFF",
    expiry: { en: "Yearly Offer", bn: "বার্ষিক অফার" },
    trending: false
  },
  {
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
    category: { en: "Vaccination", bn: "টিকা" },
    title: { en: "Flu Vaccination Drive 2024", bn: "ফ্লু ভ্যাকসিন কর্মসূচি ২০২৪" },
    desc: { en: "Protect your family from seasonal flu. Special group rates for 3 or more members.", bn: "আপনার পরিবারকে মৌসুমি ফ্লু থেকে রক্ষা করুন। ৩ জন বা তার বেশি সদস্যের জন্য বিশেষ রেট।" },
    discount: "15% OFF",
    expiry: { en: "Valid this Month", bn: "এই মাস পর্যন্ত" },
    trending: false
  }
];

export default function OffersPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#00B7B5] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-500 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B7B5]/20 text-[#00B7B5] font-black text-xs uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-4 h-4" />
              Exclusive Healthcare Deals
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-tight">
              {language === 'en' ? (
                <>Great Savings on <span className="text-[#00B7B5]">Your Health</span></>
              ) : (
                <>আপনার স্বাস্থ্যের জন্য <span className="text-[#00B7B5]">সেরা সঞ্চয়</span></>
              )}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              {language === 'en' 
                ? "Discover the best medical offers, discounts, and packages from top-rated hospitals and diagnostic centers."
                : "সেরা হাসপাতাল এবং ডায়াগনস্টিক সেন্টার থেকে সেরা মেডিকেল অফার, ছাড় এবং প্যাকেজগুলো খুঁজে নিন।"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs (Static placeholders for UX) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-4 flex flex-wrap justify-center gap-2 border border-slate-100">
          {["All Offers", "Checkups", "Diagnostics", "Surgery", "Dental", "Pharmacy"].map(cat => (
            <Button key={cat} variant="ghost" className="rounded-2xl font-bold px-6 h-12 hover:bg-[#00B7B5]/5 hover:text-[#00B7B5]">
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {offers.map((offer, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative flex flex-col h-full rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image 
                    src={offer.image} 
                    alt={offer.title.en} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900">
                    {offer.category[language as keyof typeof offer.category]}
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute bottom-6 right-6 bg-[#00B7B5] text-white rounded-2xl px-5 py-2 font-black text-sm shadow-xl shadow-[#00B7B5]/30 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {offer.discount}
                  </div>

                  {offer.trending && (
                    <div className="absolute top-6 right-6 bg-orange-500 text-white rounded-xl p-2 shadow-lg">
                      <Flame className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-[#00B7B5] transition-colors">
                    {offer.title[language as keyof typeof offer.title]}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm mb-8 flex-1">
                    {offer.desc[language as keyof typeof offer.desc]}
                  </p>
                  
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {offer.expiry[language as keyof typeof offer.expiry]}
                    </div>
                    <Button variant="ghost" className="p-0 text-[#00B7B5] hover:bg-transparent font-black text-sm gap-2 uppercase tracking-widest">
                      {language === 'en' ? "Get Deal" : "অফার নিন"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-10 text-[#00B7B5]">
            <Gift className="w-10 h-10" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
            {language === 'en' ? "Don't Miss Any Offer!" : "কোনো অফার মিস করবেন না!"}
          </h2>
          <p className="text-slate-500 text-lg mb-10">
            {language === 'en' 
              ? "Subscribe to our priority list and get the latest healthcare deals directly in your email."
              : "আমাদের প্রায়োরিটি লিস্টে যুক্ত হোন এবং আপনার ইমেইলে সরাসরি সর্বশেষ অফারগুলো পান।"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder={language === 'en' ? "Enter your email" : "আপনার ইমেইল দিন"}
              className="h-16 px-8 rounded-2xl border-2 border-slate-200 focus:border-[#00B7B5] focus:outline-none flex-1 font-bold"
            />
            <Button className="h-16 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg">
              {language === 'en' ? "Subscribe" : "সাবস্ক্রাইব করুন"}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
