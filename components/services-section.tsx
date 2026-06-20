"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

/**
 * ServiceImage Component
 * Handles dynamic image loading with a local fallback
 */
function ServiceImage({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => setImgSrc(fallback)}
    />
  );
}

export default function ServicesSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].services;

  const services = [
    {
      title: t.doctorAppointmentTitle,
      cta: t.bookAppointmentBtn,
      href: "/doctor",
      description: t.doctorAppointmentDesc,
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
    },
    {
      title: t.videoConsultTitle,
      cta: t.bookConsultationBtn,
      href: "/live-consultation",
      description: t.videoConsultDesc,
      image: "https://plus.unsplash.com/premium_photo-1661775601929-8c775187bea6?auto=format&fit=crop&q=80",
    },
    {
      title: t.hospitalsTitle,
      cta: t.hospitalListBtn,
      href: "/hospital",
      description: t.hospitalsDesc,
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d",
    },

    {
      title: t.diagnosticTitle,
      cta: t.comparePriceBtn,
      href: "/diagnostic",
      description: t.diagnosticDesc,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
    }
  ];

  return (
    <div className="bg-[#F5F6F8] py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-[28px] sm:text-[48px]  font-bold mb-4 text-[#193252] tracking-tight max-w-[804px] mx-auto leading-[1.1]">
            {t.title}
          </h2>
                    <div className="w-20 h-1.5 bg-primary mx-auto mb-6 " />

          <p className="text-[#193252]  text-sm sm:text-lg max-w-[650px] mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Service Items (Alternating) ── */}
        <div className="space-y-10 sm:space-y-16">
          {services.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-[24px] p-4 shadow-md overflow-hidden group border border-slate-100"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">

                  {/* IMAGE SIDE */}
                  <div className={`relative h-64 sm:h-80 lg:h-[480px] rounded-2xl overflow-hidden ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <ServiceImage
                      src={service.image}
                      alt={service.title}
                      fallback="/slide.jpg"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-300" />
                  </div>

                  {/* CONTENT SIDE */}
                  <div className={`p-8 sm:p-12 lg:p-20 flex flex-col justify-center ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#193252] leading-tight mb-6">
                      {service.title}
                    </h3>

                    <p className=" text-sm sm:text-lg leading-relaxed mb-8 lg:mb-12 max-w-xl">
                      {service.description}
                    </p>

                    <div>
                      <Link href={service.href}>
                        <button className="btn-slide btn-primary group/btn rounded-none border border-primary text-primary font-bold text-sm sm:text-base py-4 px-8 sm:px-10 shadow-lg transition-all inline-flex items-center gap-3 active:scale-95 overflow-hidden">
                          <span className="relative z-10 flex items-center gap-3">
                            {service.cta}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                      </Link>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}