"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";

interface Hospital {
  _id: string;
  name: string;
  location?: string;
  photo?: string;
  thana?: { name: string };
}

export default function HospitalPartnersSection() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/locations/hospitals");
        const data = await response.json();
        if (response.ok) {
          setHospitals(data.hospitals.slice(0, 12));
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — plain black, centered */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-2 sm:mb-3">
            Partner Hospitals
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
            Our partnership with leading hospitals across Savar and surrounding areas
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640:  { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={hospitals.length > 3}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
          >
            {hospitals.map((hospital) => (
              <SwiperSlide key={hospital._id}>
                {/* Photo card — tall aspect ratio */}
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[3/4] w-full group cursor-pointer">
                  {/* Hospital photo or placeholder */}
                  {hospital.photo ? (
                    <Image
                      src={hospital.photo}
                      alt={hospital.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-500">
                      <Image
                        src="/slide.jpg"
                        alt={hospital.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Subtle dark gradient at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Frosted glass name pill at bottom */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-3">
                      <p className="text-white font-bold text-base leading-tight truncate">
                        {hospital.name}
                      </p>
                      <p className="text-white/80 text-xs mt-0.5 truncate">
                        {hospital.location || hospital.thana?.name || "Savar, Dhaka"}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav arrows — outside left/right */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hidden sm:flex"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hidden sm:flex"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* "See All" button */}
        <div className="mt-8 flex justify-center">
          <Link href="/hospitals">
            <div className="group/btn relative h-11 flex items-center">
              <span className="inline-flex items-center h-11 px-8 rounded-full text-[14px] font-medium bg-primary text-white transition-all duration-200 group-hover/btn:opacity-0 group-hover/btn:scale-90 whitespace-nowrap">
                See All
              </span>
              <span className="absolute left-0 top-0 inline-flex items-center gap-2 h-11 px-8 rounded-full text-[14px] font-semibold bg-primary-dark text-white whitespace-nowrap pointer-events-none opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100 transition-all duration-200">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}