"use client";


import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ value, duration = 2 }: { value: string; duration?: number }) {
  const bnToEn = (str: string) => str.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());
  const enToBn = (str: string) => str.replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  const isBengali = /[০-৯]/.test(value);
  const normalizedValue = isBengali ? bnToEn(value) : value;

  const numericValue = parseFloat(normalizedValue.replace(/[^0-9.]/g, "")) || 0;
  const suffix = normalizedValue.replace(/[0-9.]/g, "");
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    let numStr = "";
    if (numericValue % 1 === 0) {
      numStr = Math.floor(latest).toString();
    } else {
      numStr = latest.toFixed(1);
    }
    
    const result = numStr + suffix;
    return isBengali ? enToBn(result) : result;
  });
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(count, numericValue, { duration });
    }
  }, [isInView, numericValue, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function PatientReviewSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].reviews;

  return (
    <div className="relative w-full mx-auto min-h-[600px] sm:min-h-[750px] overflow-hidden flex items-center">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url('/slide.jpg')", filter: "grayscale(30%) brightness(0.4)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-primary/10 to-black/80" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 gap-12 sm:gap-20">

          {/* HEADER SECTION (CENTERED) */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Pill label */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 text-white/90 text-xs font-bold tracking-[0.2em] mb-6 uppercase backdrop-blur-md"
            >
              <span className="w-2 h-2 bg-primary animate-pulse shrink-0 rounded-full shadow-[0_0_12px_var(--primary)]" />
              {t.title}
            </motion.div>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-[64px] font-bold text-white leading-[1.1] mb-10 tracking-tight"
            >
              {language === 'bn' ? "আমাদের রোগীদের কথা" : "What Our Patients Say"}
            </motion.h2>

            {/* Stats row */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-12"
            >
              <div className="flex flex-col items-center">
                <p className="text-white text-4xl sm:text-6xl font-black mb-1">
                  <Counter value={t.stats.rating} />
                </p>
                <div className="flex gap-1 mb-2">
                   {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-widest">{t.stats.ratingLabel}</p>
              </div>
              
              <div className="w-px h-16 bg-white/20 hidden sm:block" />

              <div className="flex flex-col items-center">
                <p className="text-white text-4xl sm:text-6xl font-black mb-1">
                  <Counter value={t.stats.clients} />
                </p>
                <p className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-widest mt-2">{t.stats.clientsLabel}</p>
              </div>
            </motion.div>
          </div>

          {/* CAROUSEL SECTION (FULL WIDTH CONTROL) */}
          <div className="relative group px-4 sm:px-12">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              slidesPerView={1}
              spaceBetween={20}
              centeredSlides={true}
              loop={true}
              breakpoints={{
                768: { slidesPerView: 1.5, spaceBetween: 30 },
                1280: { slidesPerView: 2.5, spaceBetween: 40 }
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              navigation={{
                prevEl: ".prev-review",
                nextEl: ".next-review",
              }}
              pagination={{
                clickable: true,
                el: ".review-pagination-custom",
                bulletClass: "review-bullet-custom",
                bulletActiveClass: "review-bullet-active-custom",
              }}
              className="!overflow-visible"
            >
              {[...t.items, ...t.items].map((review, idx) => (
                <SwiperSlide key={idx} className="transition-all duration-500 py-10">
                  {({ isActive }) => (
                    <div className={`
                      relative p-8 sm:p-12 rounded-[40px] transition-all duration-700 h-full
                      ${isActive ? 'bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] scale-105' : 'bg-white/10 backdrop-blur-xl border border-white/10 scale-90 opacity-40'}
                    `}>
                      <div className="flex flex-col h-full">
                        {/* Quote mark */}
                        <div className={`text-6xl font-serif leading-none mb-4 ${isActive ? 'text-primary/20' : 'text-white/20'}`}>"</div>
                        
                        {/* Review text */}
                        <p className={`text-lg sm:text-xl font-medium leading-relaxed mb-10 ${isActive ? 'text-slate-800' : 'text-white'}`}>
                          {review.text}
                        </p>

                        <div className="mt-auto pt-8 border-t border-slate-100/10 flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isActive ? 'border-primary' : 'border-white/30'}`}>
                            {review.avatar ? (
                              <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                                {review.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-lg ${isActive ? 'text-slate-900' : 'text-white'}`}>{review.name}</p>
                             <p className={`text-sm ${isActive ? 'text-slate-500' : 'text-white/60'}`}>
                                <span className="font-semibold text-primary">{review.time}</span>
                             </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>

            {/* CUSTOM CONTROLS */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-4 z-20">
              <button className="prev-review w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all shadow-xl group/btn">
                <ArrowLeft className="w-6 h-6 transition-transform group-hover/btn:-translate-x-1" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-4 z-20">
              <button className="next-review w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all shadow-xl group/btn">
                <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>

            {/* Custom Pagination */}
            <div className="review-pagination-custom flex justify-center gap-3 mt-12" />
          </div>

        </div>
      </div>

      {/* Swiper bullet styles */}
      <style jsx global>{`
        .review-bullet-custom {
          display: inline-block;
          width: 40px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .review-bullet-active-custom {
          background: var(--primary);
          width: 80px;
          box-shadow: 0 0 20px rgba(1, 154, 152, 0.5);
        }
      `}</style>
    </div>
  );
}
