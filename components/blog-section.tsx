"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";

interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
    }>;
  };
}

const WORDPRESS_API = "https://wordpress.meditime.com.bd/wp-json/wp/v2";

export default function BlogSection() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${WORDPRESS_API}/posts?per_page=10&_embed=true&orderby=date&order=desc`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getFeaturedImage = (post: WordPressPost) => {
    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    return imageUrl || "/slide.jpg";
  };

  const getAuthorName = (post: WordPressPost) => {
    return post._embedded?.author?.[0]?.name || "Admin";
  };

  if (loading) {
    return (
      <div className="w-full py-16 bg-gradient-to-b from-[#009A98]/5 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: "#009A98",
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              স্বাস্থ্য টিপস ও ব্লগ
            </h2>
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#009A98]" />
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-16 bg-gradient-to-b from-[#009A98]/5 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              color: "#009A98",
            }}
          >
            Health & Wellness Blog
          </h2>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Latest health tips and medical information
          </p>
        </div>

        {/* Blog Posts Carousel */}
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
            {posts.map((post) => (
              <SwiperSlide key={post.id}>
                <Link href={`/blog/${post.slug}`}>
                  <Card className="p-0 bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all h-[480px] flex flex-col overflow-hidden group cursor-pointer">
                    {/* Featured Image */}
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={getFeaturedImage(post)}
                        alt={stripHtml(post.title.rendered)}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Title */}
                      <h3
                        className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#009A98] transition-colors"
                        style={{
                          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />

                      {/* Excerpt */}
                      <p
                        className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1"
                        style={{
                          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                        }}
                      >
                        {stripHtml(post.excerpt.rendered)}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span
                            style={{
                              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            {formatDate(post.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#009A98] font-semibold group-hover:gap-3 transition-all">
                          <span
                            style={{
                              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                            }}
                          >
                            আরও পড়ুন
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 z-10 text-[#009A98] hover:text-[#007c7a] transition-colors p-2"
            aria-label="Previous blog post"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            ref={nextRef}
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 z-10 text-[#009A98] hover:text-[#007c7a] transition-colors p-2"
            aria-label="Next blog post"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#009A98] to-[#00B5B2] text-white font-semibold rounded-lg hover:from-[#00B5B2] hover:to-[#009A98] transition-all shadow-lg hover:shadow-xl"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            সব ব্লগ দেখুন
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

