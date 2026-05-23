"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function HeroSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].hero;

  const slides = [
    {
      title: t.slide1.title,
      description: t.slide1.description,
      image: "/slide.jpg",
      ctaText: t.slide1.cta,
      ctaLink: "/doctor",
      ctaText2: "Live Consultation",
      ctaLink2: "/",
    },
    {
      title: t.slide2.title,
      description: t.slide2.description,
      image: "/slide2.jpg",
      ctaText: t.slide2.cta,
      ctaLink: "/membership",
    },
    {
      title: t.slide3.title,
      description: t.slide3.description,
      image: "/slide3.jpg",
      ctaText: t.slide3.cta,
      ctaLink: "https://play.google.com/store",
    },
    {
      title: t.slide4.title,
      description: t.slide4.description,
      image: "/slide.jpg",
      ctaText: t.slide4.cta,
      ctaLink: "/diagnostic",
    },
  ];

  return (
    <>
      <style>{`
        /* ── All dots are pill-shaped ────────────────────────────────────
           Inactive: narrow pill, 16px wide, semi-transparent white
           Active:   wider pill, 32px wide, solid white
           Both are the same height (8px) and fully rounded
        ─────────────────────────────────────────────────────────────── */
        .hero-swiper .swiper-pagination {
          bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 16px !important;
          height: 8px !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
          margin: 0 !important;
          transition: width 0.35s ease, background 0.35s ease;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          width: 32px !important;
          background: #ffffff !important;
        }
      `}</style>

      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full h-[65vh] min-h-[500px] relative">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="hero-swiper h-full! w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full!">
              <div className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/45" />

                {/* ── Text: vertically & horizontally centered ── */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white mb-6 max-w-[320px] tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-[15px] sm:text-base text-white/90 leading-relaxed mb-10 max-w-[300px]">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={slide.ctaLink}
                      target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                    >
                      <button className="btn-slide bg-white text-slate-900 font-bold text-[16px] px-10 py-4 rounded-full shadow-lg active:scale-95">
                        <span className="relative z-10">{slide.ctaText}</span>
                      </button>
                    </Link>
                    <Link
                      href={slide?.ctaLink2 ? slide.ctaLink2 : "#"}
                      target={slide?.ctaLink2?.startsWith("http") ? "_blank" : "_self"}
                    >
                      <button className="btn-slide bg-orange-500 text-white font-bold text-[16px] px-10 py-4 rounded-full shadow-lg active:scale-95 hover:bg-orange-600">
                        <span className="relative z-10">{slide.ctaText2}</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:block mx-auto max-w-[1920px] w-full h-[855px] relative ">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="hero-swiper h-full! w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full!">
              <div className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto">
                  <div>
                    <h1 className="text-[42px] font-bold leading-[1.15] text-white mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-[14px] leading-relaxed text-white/85 mb-6 max-w-[420px]">
                      {slide.description}
                    </p>
                    <div className="flex gap-4">
                      <Link
                        href={slide.ctaLink}
                        target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                      >
                        <button className="btn-slide bg-white text-slate-900 font-medium text-[15px] px-7 py-3 ">
                          <span className="relative z-10">{slide.ctaText}</span>
                        </button>
                      </Link>

                      {
                        slide.ctaLink2 && slide.ctaText2 && (
                          <Link
                            href={slide.ctaLink2}
                            target={slide.ctaLink2?.startsWith("http") ? "_blank" : "_self"}
                          >
                            <button className="btn-slide bg-orange-500 text-white font-medium text-[15px] px-7 py-3 hover:bg-orange-600">
                              <span className="relative z-10">{slide.ctaText2}</span>
                            </button>
                          </Link>
                        )
                      }
        
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}