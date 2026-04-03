"use client";


import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Star } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function PatientReviewSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].reviews;

  return (
    <div className="relative w-full mx-auto min-h-[420px] sm:min-h-[520px] overflow-hidden">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/slide.jpg')", filter: "grayscale(100%)" }}
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">

          {/* LEFT — Review card slider */}
          <div className="relative flex lg:justify-end lg:pr-10">
            {/* Outer frame (light border) */}
            <div className="rounded-[20px] sm:rounded-[32px] border border-white/30 p-4 sm:p-8 bg-white/10 backdrop-blur-md shadow-2xl w-full max-w-[480px]">
              <Swiper
                modules={[Autoplay, Pagination]}
                slidesPerView={1}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                loop={true}
                pagination={{
                  clickable: true,
                  el: ".review-pagination",
                  bulletClass: "review-bullet",
                  bulletActiveClass: "review-bullet-active",
                }}
              >
                {t.items.map((review, idx) => (
                  <SwiperSlide key={idx}>
                    {/* Teal card */}
                    <div className="bg-[#129B90] rounded-[16px] sm:rounded-[24px] p-5 sm:p-8 flex flex-col min-h-[280px] sm:min-h-[340px]">
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFCC53] text-[#FFCC53]" strokeWidth={0} />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-white text-[13px] sm:text-[15px] leading-[1.8] flex-grow mb-6 sm:mb-8">
                        "{review.text}"
                      </p>

                      {/* Divider */}
                      <div className="border-t border-dashed border-white/30 pt-6">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
                            {review.avatar ? (
                              <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{review.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium text-[15px]">{review.name}</p>
                            <p className="text-white/80 text-[13px] mt-0.5">{review.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Pagination dots */}
              <div className="review-pagination flex justify-center lg:justify-start gap-2 mt-6 lg:pl-4 pb-2" />
            </div>

          </div>

          {/* RIGHT — Title + stats */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:pl-16 order-first lg:order-last">
            {/* Pill label */}
            <div className="inline-flex w-fit items-center gap-3 px-5 py-2 rounded-full border border-white/40 text-white/90 text-xs font-semibold tracking-[0.15em] mb-2 uppercase backdrop-blur-sm mx-auto lg:mx-0">
              <span className="w-2 h-2 bg-white shrink-0 shadow-[0_0_8px_white]" />
              {t.title}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-4xl md:text-[46px] font-bold text-white leading-tight mb-8 sm:mb-16 tracking-tight">
              {t.title}
            </h2>

            {/* Stats box */}
            <div 
              className="rounded-[16px] sm:rounded-[24px] border border-white lg:w-[531px] lg:h-[253px] lg:max-w-[545px] p-[12px] sm:p-[16px] lg:p-[40px] flex items-center justify-center w-full shadow-2xl"
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "inset 0px 0px 22px 0px rgba(242, 242, 242, 0.5), inset 0px 0px 0px 1px #999999, inset -2px -2px 1px -2px #B3B3B3, inset 2px 2px 1px -2px #B3B3B3, inset 3px 3px 0.5px -3.5px rgba(255, 255, 255, 0.5)"
              }}
            >
              <div className="bg-[#129B90] rounded-[12px] sm:rounded-[16px] w-full h-full px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 flex flex-col sm:flex-row items-center">
                {/* Rating */}
                <div className="flex flex-col text-center sm:text-left flex-1 items-center sm:items-start">
                  <p className="text-white text-[28px] sm:text-[42px] font-bold leading-none mb-2 sm:mb-3">{t.stats.rating}</p>
                  <p className="text-white/90 text-[11px] sm:text-[13px] font-medium tracking-wide">{t.stats.ratingLabel}</p>
                </div>

                {/* Divider — horizontal on mobile, vertical on sm+ */}
                <div className="hidden sm:block w-px h-[48px] bg-white/40 mx-4 shrink-0" />
                <div className="sm:hidden w-full h-px bg-white/40 my-3 shrink-0" />

                {/* Clients */}
                <div className="flex flex-col text-center sm:text-left flex-1 items-center sm:items-start sm:pl-6">
                  <p className="text-white text-[28px] sm:text-[42px] font-bold leading-none mb-2 sm:mb-3">{t.stats.clients}</p>
                  <p className="text-white/90 text-[11px] sm:text-[13px] font-medium tracking-wide">{t.stats.clientsLabel}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Swiper bullet styles */}
      <style jsx global>{`
        .review-bullet {
          display: inline-block;
          width: 32px;
          height: 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.3s;
        }
        .review-bullet-active {
          background: white;
          box-shadow: 0 0 10px rgba(255,255,255,0.8);
        }
      `}</style>
    </div>
  );
}