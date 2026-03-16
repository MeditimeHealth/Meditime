"use client";

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
    description: "Handpicked list of most experienced doctors from top hospitals near Savar and surroundings. Schedule your appointment with a doctor in just a few simple steps.",
    image: "/slide.jpg",
    ctaText: "Book Appointment",
    ctaLink: "/doctor",
  },
  {
    title: "Get Your Meditime Membership Card",
    subtitle: "Save Up to 50% on Medical Bills",
    description: "Enjoy on spot discounts in your medical bills using Meditime Health Discount Cards. Get delivered within 7 working days and enjoy amazing discounts.",
    image: "/slide2.jpg",
    ctaText: "View Plans",
    ctaLink: "/membership",
  },
  {
    title: "Download the Medicare Mobile App",
    subtitle: "Take Control of Your Health",
    description: "Doctor's Appointment Booking, Diagnostic Test Price Comparison, Online Doctor Consultation, Ambulance Contact — all in your pocket.",
    image: "/slide3.jpg",
    ctaText: "Download Now",
    ctaLink: "https://play.google.com/store",
  },
  {
    title: "Find all the information about 100+ Diagnostic Test in one Place",
    subtitle: "Compare Prices & Save Up to 15%",
    description: "Compare pricing of diagnostic tests and get up to 50% discount using our health discounts cards.",
    image: "/slide.jpg",
    ctaText: "View Tests",
    ctaLink: "/diagnostic",
  },
];

export default function HeroSection() {
  return (
    <div className="relative">
      {/* ── MOBILE HERO — half viewport height ── */}
      <div className="lg:hidden relative h-[50vh] min-h-[280px]">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet-custom",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 flex flex-col justify-center px-6">
                  <div className="max-w-xs">
                    <h1 className="text-xl sm:text-2xl font-bold leading-snug text-white mb-3">
                      {slide.title}
                    </h1>
                    <Link
                      href={slide.ctaLink}
                      target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                    >
                      <Button className="bg-white hover:bg-white/90 text-gray-900 font-semibold text-xs h-9 px-5 rounded-full shadow-md transition-all inline-flex items-center gap-1.5">
                        {slide.ctaText}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── DESKTOP HERO — full viewport height ── */}
      <div className="hidden lg:block relative h-screen min-h-[700px]">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet-custom",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8 lg:px-16">
                    <div className="flex flex-col gap-5 max-w-[732px] min-h-[280px] justify-center">
                      <h1 className="text-[52px] lg:text-[64px] font-bold leading-[1.1] text-white">
                        {slide.title}
                      </h1>
                      <p className="text-[20px] font-medium text-white/90 leading-[1.5] tracking-[0.16px] max-w-[578px]">
                        {slide.description}
                      </p>
                      <div>
                        <Link
                          href={slide.ctaLink}
                          target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                        >
                          <Button className="bg-white hover:bg-white/90 text-[#212121] font-medium text-[16px] h-auto pl-5 pr-7 py-[15px] rounded-[40px] shadow-none transition-all">
                            {slide.ctaText}
                          </Button>
                        </Link>
                      </div>
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