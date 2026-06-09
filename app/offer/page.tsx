"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Calendar, Tag, ArrowRight, Loader2, Sparkles, Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface Offer {
  _id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  buttonTextBn: string;
  createdAt: string;
  isActive: boolean;
}

export default function OfferPage() {
  const { language } = useLanguage();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch("/api/offer");
      const data = await response.json();
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden bg-[#111827]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#3DB5A0] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#3DB5A0] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#3DB5A0]/20 border border-[#3DB5A0]/30 text-[#3DB5A0] text-sm font-bold tracking-widest uppercase mb-8"
            >
              <Sparkles className="w-4 h-4" />
              {language === 'bn' ? "এক্সক্লুসিভ অফার" : "Exclusive Offers"}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-[80px] font-bold text-white leading-[1.1] mb-8 tracking-tight"
            >
              {language === 'bn' ? "সুস্বাস্থ্যের জন্য বিশেষ অফার" : " Special Offers for Better Health"}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 leading-relaxed max-w-2xl"
            >
              {language === 'bn' 
                ? "সাভার ও আশেপাশের এলাকার সেরা হাসপাতাল এবং ডায়াগনস্টিক সেন্টারগুলোতে আকর্ষণীয় ডিসকাউন্ট উপভোগ করুন।" 
                : "Enjoy exclusive discounts at the top hospitals and diagnostic centers in Savar and surrounding areas."}
            </motion.p>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="h-12 w-12 animate-spin text-[#3DB5A0] mb-4" />
            <p className="text-slate-500 font-medium">Loading latest offers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {offers.length > 0 ? (
              offers.map((offer, index) => (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={offer.linkUrl}>
                    <Card className="group overflow-hidden rounded-[32px] border-none shadow-xl bg-white hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                      <div className="relative h-72 w-full overflow-hidden">
                        <Image
                          src={offer.imageUrl}
                          alt={language === 'bn' ? offer.titleBn : offer.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-6 left-6">
                          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#3DB5A0]" />
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                              {language === 'bn' ? "লিমিটেড অফার" : "Limited Offer"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-10 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium mb-6">
                          <Calendar className="w-4 h-4" />
                          {new Date(offer.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-[#3DB5A0] transition-colors line-clamp-2">
                          {language === 'bn' ? offer.titleBn : offer.title}
                        </h3>
                        
                        <p className="text-slate-500 text-lg leading-relaxed mb-8 line-clamp-3 flex-1">
                          {language === 'bn' ? offer.descriptionBn : offer.description}
                        </p>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-3 text-[#3DB5A0] font-bold text-base uppercase tracking-wider group-hover:gap-5 transition-all">
                            {language === 'bn' ? offer.buttonTextBn : offer.buttonText}
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-white rounded-[40px] shadow-sm border-2 border-dashed border-slate-200">
                <Gift className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-400">
                  {language === 'bn' ? "বর্তমানে কোন অফার নেই" : "No active offers right now"}
                </h3>
                <p className="text-slate-400 mt-2">Check back soon for exciting healthcare discounts!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
