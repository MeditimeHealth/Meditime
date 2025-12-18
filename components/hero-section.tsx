"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Button } from "./ui/button";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Book a Doctor Appointment in Minutes",
    subtitle: "20+ Departments, 1000+ Physicians from 30+ Renowned Hospitals",
    description:
      "Handpicked list of most experienced doctors from top hospitals near Savar and surroundings. Schedule your appointment with a doctor in just a few simple steps. Choose based on your health issues and area of residence.",
    image: "/slide.jpg",
    ctaText: "Book Doctor Appointment",
    ctaLink: "/doctor",
  },
  {
    title: "Get Your Meditime Membership Card",
    subtitle: "Save Up to 15% on Medical Bills",
    description:
      "Enjoy on spot discounts in your medical bills using Meditime Health Discount Cards, fill the form to apply, get delivered within 7 working days, and enjoy amazing discounts on various medical services for next 12 months at a network of clinics, diagnostic centres, and general hospitals near you.",
    image: "/slide2.jpg",
    ctaText: "See Membership Pricings",
    ctaLink: "/membership",
  },
  {
    title: "Download the Medicare Mobile App",
    subtitle: "Take Control of Your Medical Services",
    description:
      "Doctor's Appointment Booking, Diagnostic Test Price Comparison, Online Doctor Consultation, Ambulance Contact, Trusted Blood Donors all in your pocket within a single app. It is an easy to use Healthcare app, effective, and makes you incredibly confident in any situation.",
    image: "/slide3.jpg",
    ctaText: "Download the App",
    ctaLink: "https://play.google.com/store",
  },
];

export default function HeroSection() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="relative mt-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          navigation={true}
          onInit={(swiper) => {
            if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          onSlideChangeTransitionStart={() => {
            setIsAnimating(true);
          }}
          onSlideChangeTransitionEnd={() => {
            setIsAnimating(false);
          }}
          // pagination={{
          //   clickable: true,
          //   bulletClass: "swiper-pagination-bullet-custom",
          //   bulletActiveClass: "swiper-pagination-bullet-active-custom",
          // }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          effect="fade"
          className="h-[500px] sm:h-[550px] lg:h-[600px] rounded-2xl overflow-hidden"
        >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full items-center justify-center">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className={`mx-auto max-w-3xl text-center text-white transition-all duration-1000 ${
                    !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}>
                    <h1 className="mb-2 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="mb-4 text-lg font-semibold text-white/90 sm:text-xl lg:text-2xl">
                        {slide.subtitle}
                      </p>
                    )}
                    <p className="mb-8 text-base leading-relaxed sm:text-lg lg:text-xl">
                      {slide.description}
                    </p>
                    <div className="flex justify-center items-center">
                      <Link href={slide.ctaLink} target={slide.ctaLink.startsWith('http') ? '_blank' : '_self'}>
                        <Button className="bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-base px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
                          {slide.ctaText}
                          <svg
                            className="ml-2 h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
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
        
        {/* Custom Navigation Buttons */}
        {/* <button
          ref={prevRef}
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-8 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button> */}
        {/* <button
          ref={nextRef}
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-8 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button> */}
      </div>
    </div>
  );
}
