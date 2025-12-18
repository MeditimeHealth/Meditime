"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
];

export default function HeroSection() {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-teal-50/50 to-white">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-teal-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-3xl -z-10" />

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
          className="h-auto min-h-[500px] lg:h-[600px] rounded-3xl"
        >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
              {/* Text Content */}
              <div className={`space-y-6 text-center lg:text-left px-4 lg:px-12 transition-all duration-700 ${
                !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
                {slide.subtitle && (
                  <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 font-semibold text-sm tracking-wide border border-teal-100">
                    {slide.subtitle}
                  </span>
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-800">
                  {slide.title}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {slide.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link href={slide.ctaLink} target={slide.ctaLink.startsWith('http') ? '_blank' : '_self'}>
                    <Button className="btn-primary text-lg h-14 px-8 w-full sm:w-auto overflow-hidden group relative">
                      <span className="relative z-10 flex items-center gap-2">
                        {slide.ctaText}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Image Content */}
              <div className="relative h-[400px] lg:h-full w-full flex items-center justify-center p-4">
                <div className="relative w-full max-w-[500px] aspect-[4/3] lg:aspect-square">
                   {/* Decorative background blob for image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-200 to-blue-200 rounded-[3rem] rotate-3 opacity-30 transform scale-95" />
                  
                  <div className={`relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-1000 ${
                     !isAnimating ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-95 rotate-1"
                  }`}>
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    {/* Glass Overlay on Image Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
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
