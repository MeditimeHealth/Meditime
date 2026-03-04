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
    description:
      "Handpicked list of most experienced doctors from top hospitals near Savar and surroundings. Schedule your appointment with a doctor in just a few simple steps.",
    image: "/slide.jpg",
    ctaText: "Book Appointment",
    ctaLink: "/doctor",
  },
  {
    title: "Get Your Meditime Membership Card",
    subtitle: "Save Up to 50% on Medical Bills",
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
      "Compare pricing of diagnostic tests and get up to 50% discount using our health discounts cards.",
    image: "/slide.jpg",
    ctaText: "View Tests",
    ctaLink: "/diagnostic",
  },
];

export default function HeroSection() {
  return (
    <div className="relative">
      {/* Mobile Hero */}
      <div className="lg:hidden relative min-h-screen">
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
          className="h-full min-h-screen"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative min-h-screen w-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                {/* Subtle overlay - image shows through */}
                <div className="absolute inset-0 bg-black/40" />

                {/* LEFT-aligned content */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div className="max-w-sm">
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-base text-white/85 mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.ctaLink}
                      target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                    >
                      <Button className="bg-white hover:bg-white/90 text-gray-900 font-semibold text-sm h-11 px-7 rounded-full shadow-md transition-all inline-flex items-center gap-2">
                        {slide.ctaText}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Hero */}
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

                {/* Subtle dark overlay — image stays visible */}
                <div className="absolute inset-0 bg-black/35" />

                {/* LEFT-aligned content — occupies left ~45% */}
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8 lg:px-16">
                    <div className="max-w-lg space-y-5">
                      <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
                        {slide.title}
                      </h1>
                      <p className="text-base lg:text-lg text-white/85 leading-relaxed">
                        {slide.description}
                      </p>
                      <div className="pt-2">
                        <Link
                          href={slide.ctaLink}
                          target={slide.ctaLink.startsWith("http") ? "_blank" : "_self"}
                        >
                          <Button className="bg-white hover:bg-white/90 text-gray-900 font-semibold text-base h-12 px-8 rounded-full shadow-md transition-all inline-flex items-center gap-2">
                            {slide.ctaText}
                            <ArrowRight className="h-4 w-4" />
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
