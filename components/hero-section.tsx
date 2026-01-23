"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Book a Doctor Appointment in Minutes",
    subtitle: "20+ Departments, 1000+ Physicians",
    description:
      "Handpicked list of most experienced doctors from top hospitals near Savar and surroundings. Schedule your appointment with a doctor in just a few simple steps.",
    image: "/slide.jpg",
    ctaText: "Book Appointment",
    ctaLink: "/doctor",
  },
  {
    title: "Get Your Meditime Membership Card",
    subtitle: "Save Up to 15% on Medical Bills",
    description:
      "Enjoy on spot discounts in your medical bills using Meditime Health Discount Cards. Get delivered within 7 working days and enjoy amazing discounts.",
    image: "/slide2.jpg",
    ctaText: "View Plans",
    ctaLink: "/membership",
  },
  {
    title: "Download the Medicare Mobile App",
    subtitle: "Take Control of Your Health",
    description:
      "Doctor's Appointment Booking, Diagnostic Test Price Comparison, Online Doctor Consultation, Ambulance Contact — all in your pocket.",
    image: "/slide3.jpg",
    ctaText: "Download Now",
    ctaLink: "https://play.google.com/store",
  },
  {
    title: "Find all the information about 100+ Diagnostic Test in one Place",
    subtitle: "Compare Prices & Save Up to 15%",
    description:
      "Compare pricing of diagnostic tests and get up to 15% discount using our health discounts cards.",
    image: "/slide.jpg",
    ctaText: "View Tests",
    ctaLink: "/diagnostic",
  },
];

export default function HeroSection() {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Refined Abstract Background Shapes */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-gradient-to-br from-teal-100/40 via-teal-50/30 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/30 via-sky-50/20 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary-50/20 to-transparent rounded-full blur-3xl -z-10" />

      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-3 h-3 bg-teal-300/50 rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-2 h-2 bg-blue-300/50 rounded-full animate-pulse delay-500" />
      <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-teal-200/40 rounded-full animate-pulse delay-1000" />

      <div className="container mx-auto">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet-custom",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          onSlideChangeTransitionStart={() => {
            setIsAnimating(true);
          }}
          onSlideChangeTransitionEnd={() => {
            setIsAnimating(false);
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="h-auto min-h-[520px] lg:h-[620px] rounded-3xl"
        >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full items-center">
              {/* Text Content */}
              <div className={`space-y-7 text-center lg:text-left px-4 lg:px-12 transition-all duration-700 ${
                !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {slide.subtitle && (
                  <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-teal-50 to-teal-100/80 text-teal-700 font-semibold text-sm tracking-wide border border-teal-200/50 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    {slide.subtitle}
                  </span>
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-800 tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                  <Link href={slide.ctaLink} target={slide.ctaLink.startsWith('http') ? '_blank' : '_self'}>
                    <Button className="btn-primary text-lg h-14 px-10 w-full sm:w-auto overflow-hidden group relative shadow-lg hover:shadow-xl transition-shadow">
                      <span className="relative z-10 flex items-center gap-2 font-semibold">
                        {slide.ctaText}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Image Content */}
              <div className="relative h-[280px] sm:h-[400px] lg:h-full w-full flex items-center justify-center p-4">
                <div className="relative w-full max-w-[520px] aspect-[4/3] lg:aspect-square">
                   {/* Decorative background layers */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-200/50 to-blue-200/40 rounded-[3rem] rotate-3 opacity-40 transform scale-95" />
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-100/30 to-transparent rounded-[3rem] -rotate-2 opacity-30 transform scale-90" />
                  
                  <div className={`relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-1000 ring-1 ring-white/50 ${
                     !isAnimating ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-95 rotate-1"
                  }`}>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    {/* Refined Glass Overlay on Image Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
    </div>
  );
}
