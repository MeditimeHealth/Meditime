"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

const reviews = [
  {
    id: 1,
    name: "Motiur Rahman",
    location: "Ex Army Personnel, Home Owner in Gazipur",
    rating: 5,
    review:
      "Found the best Diabetic Specialist in Savar I have ever met in the last 7 years. Recommended",
    date: "2 weeks ago",
    avatar: null,
  },
  {
    id: 2,
    name: "Asma Jannat Noyon",
    location: "House Wife, Ashulia, Savar DOHS",
    rating: 5,
    review:
      "Easily Booked doctor appointment in Ibn Sina for My 80 Year Old Mother Suffering from Kidney complications.",
    date: "1 month ago",
    avatar: null,
  },
  {
    id: 3,
    name: "SM Jahidul Islam",
    location: "Merchandise Manager at ABA Group, Tongi",
    rating: 5,
    review:
      "Tested My lipid panel found the platform useful, enjoyed a 15% discount using my corporate membership card.",
    date: "3 weeks ago",
    avatar: null,
  },
  {
    id: 4,
    name: "Rabeya Sultana",
    location: "School Teacher, Dhaka",
    rating: 5,
    review:
      "Very helpful service! Got appointment with a renowned cardiologist at Square Hospital within 2 days. The process was smooth and hassle-free.",
    date: "1 week ago",
    avatar: null,
  },
  {
    id: 5,
    name: "Kamrul Hasan",
    location: "Business Owner, Savar",
    rating: 5,
    review:
      "Excellent platform for finding qualified doctors. I found a great orthopedic specialist for my sports injury. Highly recommended!",
    date: "2 weeks ago",
    avatar: null,
  },
  {
    id: 6,
    name: "Nusrat Jahan",
    location: "Software Engineer, Ashulia",
    rating: 5,
    review:
      "The best medical service platform in Savar area. Booked gynecologist appointment for my sister and got 15% discount with the membership card.",
    date: "3 weeks ago",
    avatar: null,
  },
  {
    id: 7,
    name: "Rafiqul Islam",
    location: "Retired Government Officer, Gazipur",
    rating: 5,
    review:
      "Amazing service! Found experienced medicine specialist for regular checkup. The mobile app is very user-friendly and convenient.",
    date: "4 weeks ago",
    avatar: null,
  },
];

export default function PatientReviewSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="relative w-full min-h-[520px] overflow-hidden">
      {/* Background image with dark overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/slide.jpg')", filter: "grayscale(100%)" }}
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — Review card slider */}
          <div className="relative">
            {/* Outer frame (light border) */}
            <div className="rounded-3xl border border-white/20 p-3 bg-white/5 backdrop-blur-sm">
              <Swiper
                modules={[Autoplay, Pagination]}
                slidesPerView={1}
                autoplay={{ delay: 4500, disableOnInteraction: false }}
                loop={true}
                pagination={{
                  clickable: true,
                  el: ".review-pagination",
                  bulletClass: "review-bullet",
                  bulletActiveClass: "review-bullet-active",
                }}
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
              >
                {reviews.map((review) => (
                  <SwiperSlide key={review.id}>
                    {/* Teal card */}
                    <div className="bg-primary rounded-2xl p-7 flex flex-col min-h-[280px]">
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" strokeWidth={0} />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-white text-base leading-relaxed flex-grow mb-6">
                        "{review.review}"
                      </p>

                      {/* Divider */}
                      <div className="border-t border-white/20 pt-5">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
                            {review.avatar ? (
                              <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{review.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{review.name}</p>
                            <p className="text-white/70 text-xs mt-0.5">{review.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Pagination dots */}
              <div className="review-pagination flex justify-center gap-1.5 mt-4 pb-1" />
            </div>

            {/* Prev / Next arrows */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-9 h-9 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* RIGHT — Title + stats */}
          <div className="flex flex-col gap-6">
            {/* Pill label */}
            <div className="inline-flex w-fit items-center px-4 py-1.5 rounded-full border border-white/40 text-white/80 text-xs font-semibold tracking-widest">
              - CLIENT'S FEEDBACK -
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Patient Reviews
            </h2>

            {/* Stats box */}
            <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-2">
              <div className="bg-primary rounded-xl px-8 py-6 flex items-center gap-0">
                {/* Rating */}
                <div className="flex-1 text-center">
                  <p className="text-white text-4xl font-bold leading-none mb-1">4.9</p>
                  <p className="text-white/80 text-sm">Over All Rating</p>
                </div>

                {/* Divider */}
                <div className="w-px h-12 bg-white/30 mx-4 shrink-0" />

                {/* Clients */}
                <div className="flex-1 text-center">
                  <p className="text-white text-4xl font-bold leading-none mb-1">1.5k+</p>
                  <p className="text-white/80 text-sm">Clients Served</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Swiper bullet styles */}
      <style jsx global>{`
        .review-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.3s;
        }
        .review-bullet-active {
          background: white;
          width: 20px;
        }
      `}</style>
    </div>
  );
}