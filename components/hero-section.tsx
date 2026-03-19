"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Top Doctors in Savar and Surroundings",
    description:
      "Meditime has a broad range of medical information services from doctors' appointment booking to ambulance contact numbers.",
    image: "/slide.jpg",
    ctaText: "View All Services",
    ctaLink: "/service",
  },
  {
    title: "Get Your Meditime Membership Card",
    description:
      "Enjoy on spot discounts in your medical bills using Meditime Health Discount Cards. Get delivered within 7 working days.",
    image: "/slide2.jpg",
    ctaText: "View Plans",
    ctaLink: "/membership",
  },
  {
    title: "Download the Medicare Mobile App",
    description:
      "Doctor's Appointment Booking, Diagnostic Test Price Comparison, Online Doctor Consultation, Ambulance Contact — all in your pocket.",
    image: "/slide3.jpg",
    ctaText: "Download Now",
    ctaLink: "https://play.google.com/store",
  },
  {
    title: "Find 100+ Diagnostic Tests in One Place",
    description:
      "Compare pricing of diagnostic tests and get up to 50% discount using our health discount cards.",
    image: "/slide.jpg",
    ctaText: "View Tests",
    ctaLink: "/diagnostic",
  },
];

export default function HeroSection() {
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
      <div className="lg:hidden w-full h-[55vh] min-h-[300px] relative mt-[80px]">
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
                  className="object-cover object-center"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40" />

                {/* ── Text: vertically & horizontally centered ── */}
                <div className="absolute inset-0 flex flex-col items-start justify-center px-6 pb-10">
                  <h1 className="text-xl font-bold leading-snug text-white mb-3 max-w-[280px]">
                    {slide.title}
                  </h1>
                  <p className="text-[13px] text-white/80 leading-relaxed mb-4 max-w-[260px]">
                    {slide.description}
                  </p>
                  <Link
                    href={slide.ctaLink}
                    target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                  >
                    <button className="bg-white text-slate-900 font-medium text-sm px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
                      {slide.ctaText}
                    </button>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:block align-center justify-center mx-auto w-[1920px] h-[855px] relative mt-[64px]">
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
                  className="object-cover object-center"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 flex flex-col justify-center pl-[80px] pr-8">
                  <div className="max-w-[480px]">
                    <h1 className="text-[42px] font-bold leading-[1.15] text-white mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-[14px] leading-relaxed text-white/85 mb-6 max-w-[420px]">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.ctaLink}
                      target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                    >
                      <button className="bg-white text-slate-900 font-medium text-[15px] px-7 py-3 rounded-full hover:opacity-90 transition-opacity">
                        {slide.ctaText}
                      </button>
                    </Link>
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