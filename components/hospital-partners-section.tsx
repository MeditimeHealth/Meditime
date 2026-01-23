"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import "swiper/css";
import "swiper/css/navigation";

interface Hospital {
  _id: string;
  name: string;
  location?: string;
  thana?: {
    name: string;
  };
}

export default function HospitalPartnersSection() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/locations/hospitals');
        const data = await response.json();
        if (response.ok) {
          // Limit to first 12 hospitals
          setHospitals(data.hospitals.slice(0, 12));
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#009A98] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700">Loading hospitals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "#009A98",
            }}
          >
            Partner Hospitals
          </h2>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Our partnership with leading hospitals across Savar and surrounding areas
          </p>
        </div>

        {/* Hospital Partners Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.init();
                swiper.navigation.update();
              }
            }}
            onInit={(swiper) => {
              if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.init();
                swiper.navigation.update();
              }
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={hospitals.length > 4}
            className="pb-12"
          >
            {hospitals.map((hospital) => (
              <SwiperSlide key={hospital._id}>
                <Card className="p-6 bg-white border-2 border-gray-200 hover:border-[#009A98] transition-all shadow-md hover:shadow-lg h-[280px] flex flex-col items-center justify-center text-center">
                  {/* Hospital Logo/Icon */}
                  <div className="mb-4 flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#009A98] to-[#00B5B2] flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Hospital Name */}
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2 line-clamp-2"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {hospital.name}
                  </h3>

                  {/* Location */}
                  <p
                    className="text-sm text-gray-500 line-clamp-2"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {hospital.location || hospital.thana?.name || 'Savar, Dhaka'}
                  </p>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons - Outside */}
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute -left-16 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Previous hospital"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            ref={nextRef}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute -right-16 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Next hospital"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

