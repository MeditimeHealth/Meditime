"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import "swiper/css";
import "swiper/css/navigation";

const reviews = [
  {
    id: 1,
    name: "Motiur Rahman",
    location: "Ex Army Personnel, Home Owner in Gazipur",
    rating: 5,
    review:
      "Found the best Diabetic Specialist in Savar I have ever met in the last 7 years. Recommended",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Asma Jannat Noyon",
    location: "House Wife, Ashulia, Savar DOHS",
    rating: 5,
    review:
      "Easily Booked doctor appointment in Ibn Sina for My 80 Year Old Mother Suffering from Kidney complications.",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "SM Jahidul Islam",
    location: "Merchandise Manager at ABA Group, Tongi",
    rating: 5,
    review:
      "Tested My lipid panel found the platform useful, enjoyed a 15% discount using my corporate membership card.",
    date: "3 weeks ago",
  },
];

export default function PatientReviewSection() {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="w-full py-16 bg-gradient-to-b from-white to-[#009A98]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "#009A98",
            }}
          >
            Patient Reviews
          </h2>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            See what our patients are saying about their experience
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
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
              delay: 4000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="pb-12"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <Card className="p-6 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all h-full flex flex-col">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-[#FFD700] text-[#FFD700]"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p
                    className="text-gray-700 leading-relaxed mb-6 grow"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    "{review.review}"
                  </p>

                  {/* Reviewer Info */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#009A98] to-[#00B5B2] flex items-center justify-center text-white font-bold text-lg">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4
                          className="font-bold text-gray-900"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {review.name}
                        </h4>
                        <p
                          className="text-sm text-gray-500"
                          style={{
                            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                          }}
                        >
                          {review.location} • {review.date}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            ref={nextRef}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Next review"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

