"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { PiUsersThreeDuotone, PiHospitalDuotone, PiFlaskDuotone, PiDropDuotone, PiStethoscopeDuotone, PiPlusCircleDuotone } from "react-icons/pi";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

/**
 * Counter Component (Matches Homepage)
 */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  });
  
  const displayValue = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

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

function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors pr-8">
          {question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary border-primary text-white rotate-180' : 'text-slate-400'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-slate-600 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ServicePage() {
  const { language } = useLanguage() as { language: 'en' | 'bn' };
  const t = homepageTranslations[language].servicesPage;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const services = [
    {
      title: t.doctorTitle,
      cta: t.doctorBtn,
      href: "/doctor",
      description: t.doctorDesc,
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
    },
    {
      title: t.hospitalTitle,
      cta: t.hospitalBtn,
      href: "/hospital",
      description: t.hospitalDesc,
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d",
    },
    {
      title: t.videoTitle,
      cta: t.videoBtn,
      href: "/live-consultation",
      description: t.videoDesc,
      image: "https://plus.unsplash.com/premium_photo-1661775601929-8c775187bea6?auto=format&fit=crop&q=80",
    },
    {
      title: t.diagnosticTitle,
      cta: t.diagnosticBtn,
      href: "/diagnostic",
      description: t.diagnosticDesc,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
    },
    {
      title: t.bloodTitle,
      cta: t.bloodBtn,
      href: "/blood-donor",
      description: t.bloodDesc,
      image: "https://images.unsplash.com/photo-1615461066159-fea0960485d5?auto=format&fit=crop&q=80",
    },
    {
      title: t.ambulanceTitle,
      cta: t.ambulanceBtn,
      href: "/ambulance",
      description: t.ambulanceDesc,
      image: "https://images.unsplash.com/photo-1554734867-bf3c00a49371?auto=format&fit=crop&q=80",
    },
  ];

  const socialProof = [
    { label: t.socialProof.doctor, value: 2000, suffix: "+", icon: PiStethoscopeDuotone },
    { label: t.socialProof.hospital, value: 40, suffix: "+", icon: PiHospitalDuotone },
    { label: t.socialProof.test, value: 100, suffix: "+", icon: PiFlaskDuotone },
    { label: t.socialProof.bloodDonor, value: 1000, suffix: "+", icon: PiDropDuotone },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] overflow-x-hidden">
      <Navbar />
      
      {/* ── Cover Hero Section ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[450px] md:h-[550px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#002B2B]/90 via-[#002B2B]/70 to-[#002B2B]/90 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80')",
          }}
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-teal-50 max-w-3xl mx-auto leading-relaxed">
              {t.heroDesc}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Social Proof Section (Matches Homepage StatsSection) ── */}
      <div className="relative z-30 -mt-16 md:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialProof.map(({ value, suffix, label, icon: Icon }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="btn-slide group flex flex-col items-center text-center p-12 sm:p-16 rounded-3xl transition-all duration-500 bg-[#002B2B] border border-slate-800 shadow-2xl min-h-[280px] h-full justify-center">
                {/* Icon */}
                <div className="mb-6 text-[#20E7E7] transition-all duration-300 group-hover:scale-110 group-hover:brightness-125">
                  <Icon size={72} height="duotone" />
                </div>

                {/* Stat number with Counter */}
                <div className="text-[48px] sm:text-[60px] font-bold text-white mb-2 leading-none transition-colors duration-300">
                  <Counter value={value} suffix={suffix} />
                </div>

                {/* Label */}
                <div className="text-[16px] sm:text-[18px] text-teal-100/70 font-bold uppercase tracking-widest transition-colors duration-300">
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* ── Services Section (Alternating) ── */}
        <div className="space-y-10 sm:space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Meditime Service Section
            </h2>
            <div className="h-1.5 w-24 bg-[#20E7E7] mx-auto rounded-full" />
          </motion.div>

          {services.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
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
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-6">
                      {service.title}
                    </h3>
                    <p className="text-slate-500 text-sm sm:text-lg leading-relaxed mb-8 lg:mb-12 max-w-xl">
                      {service.description}
                    </p>
                    <div>
                      <Link href={service.href}>
                        <button className="btn-slide group/btn bg-white rounded-none border border-primary text-primary font-bold text-sm sm:text-base py-4 px-8 sm:px-10 shadow-lg transition-all inline-flex items-center gap-3 active:scale-95 overflow-hidden">
                          <span className="relative z-10 flex items-center gap-3">
                            {service.cta}
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
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

        {/* ── FAQ Section ── */}
        <div className="mt-24 md:mt-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              {t.faq.title}
            </h2>
            <div className="h-1.5 w-24 bg-[#20E7E7] mx-auto rounded-full mb-8" />
          </motion.div>

          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100">
            {t.faq.questions.map((item: any, index: number) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFaqIndex === index}
                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
