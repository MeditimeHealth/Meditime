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
import { homepageTranslations } from "@/lib/homepage-translations";

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
  const t = homepageTranslations[language];


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
      <div className="relative px-0">
        <div className=" mx-auto">
          <div className="h-[650px] rounded-none overflow-hidden">
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(/OfferBanner.png)`,
                  backgroundColor: "#000000"
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full items-center justify-center">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="mx-auto max-w-7xl text-center lg:text-left text-white">
                    <h1 className="mb-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      {t.blogPage.heroTitle}
                    </h1>
                    <p className="mb-8 text-base leading-relaxed sm:text-lg lg:text-xl">
                      {t.blogPage.heroDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
