"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import "swiper/css";
import "swiper/css/navigation";

const hospitals = [
  {
    id: 1,
    name: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    location: "ঢাকা",
    logo: null,
  },
  {
    id: 2,
    name: "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়",
    location: "ঢাকা",
    logo: null,
  },
  {
    id: 3,
    name: "চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল",
    location: "চট্টগ্রাম",
    logo: null,
  },
  {
    id: 4,
    name: "সিলেট এম.এ.জি. ওসমানী মেডিকেল কলেজ হাসপাতাল",
    location: "সিলেট",
    logo: null,
  },
  {
    id: 5,
    name: "রাজশাহী মেডিকেল কলেজ হাসপাতাল",
    location: "রাজশাহী",
    logo: null,
  },
  {
    id: 6,
    name: "খুলনা মেডিকেল কলেজ হাসপাতাল",
    location: "খুলনা",
    logo: null,
  },
  {
    id: 7,
    name: "ময়মনসিংহ মেডিকেল কলেজ হাসপাতাল",
    location: "ময়মনসিংহ",
    logo: null,
  },
  {
    id: 8,
    name: "কুমিল্লা মেডিকেল কলেজ হাসপাতাল",
    location: "কুমিল্লা",
    logo: null,
  },
];

export default function HospitalPartnersSection() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "#009A98",
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            আমাদের হাসপাতাল পার্টনার
          </h2>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            বাংলাদেশের শীর্ষস্থানীয় হাসপাতালগুলোর সাথে আমাদের অংশীদারিত্ব
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
            loop={true}
            className="pb-12"
          >
            {hospitals.map((hospital) => (
              <SwiperSlide key={hospital.id}>
                <Card className="p-6 bg-white border-2 border-gray-200 hover:border-[#009A98] transition-all shadow-md hover:shadow-lg h-full flex flex-col items-center justify-center text-center min-h-[200px]">
                  {/* Hospital Logo/Icon */}
                  <div className="mb-4">
                    {hospital.logo ? (
                      <img
                        src={hospital.logo}
                        alt={hospital.name}
                        className="w-20 h-20 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#009A98] to-[#00B5B2] flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Hospital Name */}
                  <h3
                    className="text-lg font-bold text-gray-900 mb-2"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {hospital.name}
                  </h3>

                  {/* Location */}
                  <p
                    className="text-sm text-gray-500"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {hospital.location}
                  </p>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Previous hospital"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            ref={nextRef}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Next hospital"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

