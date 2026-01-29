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
      {/* Mobile Hero - Full Bleed Image with Overlaid Text */}
      <div className="lg:hidden relative min-h-[85vh] pt-20">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet-custom",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="h-full min-h-[85vh]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative min-h-[85vh] w-full">
                {/* Full Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                
                {/* Gradient Overlay - Doctor Page Style */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/80 via-[#2C5282]/70 to-primary/50" />
                
                {/* Content Overlay - Centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                  <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-xl text-white/90 mb-6 max-w-xl leading-relaxed drop-shadow-md font-light">
                    {slide.description}
                  </p>
                  <Link href={slide.ctaLink} target={slide.ctaLink.startsWith('http') ? '_blank' : '_self'} className="mt-10">
                    <Button className="bg-primary hover:bg-primary-dark text-white text-base h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                      {slide.ctaText}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Hero - Full Width Slider */}
      <div className="hidden lg:block relative h-[85vh] min-h-[600px]">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet-custom",
            bulletActiveClass: "swiper-pagination-bullet-active-custom",
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full">
                {/* Full Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a365d]/70 via-[#1a365d]/60 to-[#1a365d]/80" />
                
                {/* Content Overlay - Centered for Desktop */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 container mx-auto text-white text-center">
                  <div className="max-w-4xl space-y-6">
                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/90 leading-relaxed drop-shadow-md font-light max-w-2xl mx-auto">
                      {slide.description}
                    </p>
                    <div className="pt-4 flex justify-center">
                      <Link href={slide.ctaLink} target={slide.ctaLink.startsWith('http') ? '_blank' : '_self'}>
                        <Button className="bg-primary hover:bg-primary-dark text-white text-lg h-14 px-10 rounded-full shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2">
                          {slide.ctaText}
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
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
