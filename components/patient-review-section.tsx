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
    name: "রহিমা খাতুন",
    location: "ঢাকা",
    rating: 5,
    review:
      "মেডিটাইমের মাধ্যমে ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট নেওয়া খুবই সহজ হয়েছে। ডাক্তার খুবই ভালো পরামর্শ দিয়েছেন এবং সময়মতো দেখা করেছেন। সত্যিই অসাধারণ সেবা!",
    date: "২ সপ্তাহ আগে",
  },
  {
    id: 2,
    name: "আবুল কাশেম",
    location: "চট্টগ্রাম",
    rating: 5,
    review:
      "অনলাইনে ঔষধ অর্ডার করার সুবিধা পেয়ে খুবই খুশি। দ্রুত ডেলিভারি এবং মূল্যেও সাশ্রয়ী। সবসময় এই সেবা ব্যবহার করব।",
    date: "১ মাস আগে",
  },
  {
    id: 3,
    name: "ফাতেমা বেগম",
    location: "সিলেট",
    rating: 5,
    review:
      "ভিডিও কনসালটেশনের মাধ্যমে বাড়ি থেকে ডাক্তারের পরামর্শ নেওয়া খুবই সুবিধাজনক। বিশেষ করে বর্ষাকালে যখন বাইরে যাওয়া কঠিন। ধন্যবাদ মেডিটাইম!",
    date: "৩ সপ্তাহ আগে",
  },
  {
    id: 4,
    name: "করিম উদ্দিন",
    location: "রাজশাহী",
    rating: 5,
    review:
      "ল্যাব টেস্টের জন্য বাড়িতে স্যাম্পল কালেকশন সার্ভিস খুবই ভালো। সময় বাঁচিয়েছে এবং ঝামেলা কমিয়েছে। পেশাদার সেবা পেয়েছি।",
    date: "২ মাস আগে",
  },
  {
    id: 5,
    name: "আয়েশা সুলতানা",
    location: "খুলনা",
    rating: 5,
    review:
      "২৪/৭ সাপোর্ট পাওয়া যায়, যা খুবই গুরুত্বপূর্ণ। যেকোনো সমস্যায় দ্রুত সমাধান পেয়েছি। সত্যিই বিশ্বস্ত প্ল্যাটফর্ম।",
    date: "১ সপ্তাহ আগে",
  },
  {
    id: 6,
    name: "মোঃ সেলিম",
    location: "বরিশাল",
    rating: 5,
    review:
      "স্বাস্থ্যসেবা প্যাকেজের মাধ্যমে অনেক টাকা সাশ্রয় হয়েছে। সব পরিষেবা এক জায়গায় পাওয়া যায়। খুবই সন্তুষ্ট।",
    date: "১ মাস আগে",
  },
  {
    id: 7,
    name: "নাসরিন আক্তার",
    location: "কুমিল্লা",
    rating: 5,
    review:
      "ডাক্তারদের প্রোফাইল দেখে পছন্দমতো ডাক্তার বেছে নেওয়া যায়। রিভিউ পড়ে সিদ্ধান্ত নেওয়া সহজ হয়েছে। অসাধারণ অভিজ্ঞতা!",
    date: "২ সপ্তাহ আগে",
  },
  {
    id: 8,
    name: "মোঃ হাসান",
    location: "ময়মনসিংহ",
    rating: 5,
    review:
      "অ্যাপ ব্যবহার করা খুবই সহজ। সবকিছু সুন্দরভাবে সাজানো আছে। দ্রুত অ্যাপয়েন্টমেন্ট বুক করতে পারি। খুবই ভালো লাগছে।",
    date: "৩ সপ্তাহ আগে",
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
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            রোগীদের পর্যালোচনা
          </h2>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            আমাদের রোগীরা কী বলছেন দেখুন
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            ref={nextRef}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-[#009A98] text-[#009A98] transition-all hover:bg-[#009A98] hover:text-white shadow-lg hover:shadow-xl"
            aria-label="Next review"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

