"use client";


import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Star } from "lucide-react";
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
  return (
    <div className="relative w-full mx-auto min-h-[520px] overflow-hidden">
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
          <div className="relative flex lg:justify-end lg:pr-10">
            {/* Outer frame (light border) */}
            <div className="rounded-[32px] border border-white/30 p-5 sm:p-8 bg-white/10 backdrop-blur-md shadow-2xl w-full max-w-[480px]">
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
              >
                {reviews.map((review) => (
                  <SwiperSlide key={review.id}>
                    {/* Teal card */}
                    <div className="bg-[#129B90] rounded-[24px] p-8 flex flex-col min-h-[340px]">
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFCC53] text-[#FFCC53]" strokeWidth={0} />
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-white text-[15px] leading-[1.8] flex-grow mb-8">
                        "{review.review}"
                      </p>

                      {/* Divider */}
                      <div className="border-t border-dashed border-white/30 pt-6">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden">
                            {review.avatar ? (
                              <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{review.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium text-[15px]">{review.name}</p>
                            <p className="text-white/80 text-[13px] mt-0.5">{review.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Pagination dots */}
              <div className="review-pagination flex justify-start gap-2 mt-6 pl-4 pb-2" />
            </div>

          </div>

          {/* RIGHT — Title + stats */}
          <div className="flex flex-col lg:pl-16">
            {/* Pill label */}
            <div className="inline-flex w-fit items-center gap-3 px-5 py-2 rounded-full border border-white/40 text-white/90 text-xs font-semibold tracking-[0.15em] mb-2 uppercase backdrop-blur-sm">
              <span className="w-2 h-2 bg-white shrink-0 shadow-[0_0_8px_white]" />
              // CLIENT'S FEEDBACK //
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-[46px] font-bold text-white leading-tight mb-16 tracking-tight">
              Patient Reviews
            </h2>

            {/* Stats box */}
            <div 
              className="rounded-[24px] border border-white lg:w-[531px] lg:h-[253px] lg:max-w-[545px] p-[16px] lg:p-[40px] flex items-center justify-center w-full shadow-2xl"
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "inset 0px 0px 22px 0px rgba(242, 242, 242, 0.5), inset 0px 0px 0px 1px #999999, inset -2px -2px 1px -2px #B3B3B3, inset 2px 2px 1px -2px #B3B3B3, inset 3px 3px 0.5px -3.5px rgba(255, 255, 255, 0.5)"
              }}
            >
              <div className="bg-[#129B90] rounded-[16px] w-full h-full px-6 py-6 lg:px-10 lg:py-8 flex items-center">
                {/* Rating */}
                <div className="flex flex-col text-left flex-1 items-start">
                  <p className="text-white text-[42px] font-bold leading-none mb-3">4.9</p>
                  <p className="text-white/90 text-[13px] font-medium tracking-wide">Over All Rating</p>
                </div>

                {/* Divider */}
                <div className="w-px h-[48px] bg-white/40 mx-4 shrink-0" />

                {/* Clients */}
                <div className="flex flex-col text-left flex-1 items-start pl-6">
                  <p className="text-white text-[42px] font-bold leading-none mb-3">1.5k+</p>
                  <p className="text-white/90 text-[13px] font-medium tracking-wide">Clients Served</p>
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
          width: 32px;
          height: 6px;
          border-radius: 4px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.3s;
        }
        .review-bullet-active {
          background: white;
          box-shadow: 0 0 10px rgba(255,255,255,0.8);
        }
      `}</style>
    </div>
  );
}