"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Navigation } from "swiper/modules";
import { Calendar, ArrowUpRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import { formatBlogDate } from "@/lib/time-utils";

interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  link: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
    author?: Array<{ name: string }>;
  };
}

// Use proxy to avoid CORS
// const WORDPRESS_API = "https://wordpress.meditime.com.bd/wp-json/wp/v2";

export default function BlogSection() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  const { language } = useLanguage();
  const t = homepageTranslations[language].blog;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/blog/posts?per_page=8&lang=${language}`
        );
        const data = await response.json();
        console.log("Blog API Response:", data);
        if (Array.isArray(data)) setPosts(data);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [language]);

  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();

  const formatDate = (dateString: string) => formatBlogDate(dateString, language);

  const getFeaturedImage = (post: WordPressPost) =>
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "/slide.jpg";

  if (loading) {
    return (
      <div className="w-full py-12 bg-white flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="w-full py-10 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header — two columns */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[42px] font-bold text-[#193252] leading-[1.2] lg:max-w-xl">
            {t.title}
          </h2>
          <div className="flex flex-col items-start gap-5 lg:max-w-md text-left">
            <p className="text-[#193252]  text-sm sm:text-lg max-w-[650px] mx-auto leading-relaxed">
            {t.subtitle}
          </p>
            <Link
              href="/blog"
              className="btn-slide btn-primary flex items-center gap-2 group"
            >
              <h4 className="text-white  "> {t.viewMore}</h4>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </Link>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1.2, spaceBetween: 16 },
              768: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 2, spaceBetween: 24 },
            }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            loop={posts.length > 2}
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  {/* Image */}
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4">
                    <Image
                      src={getFeaturedImage(post)}
                      alt={stripHtml(post.title.rendered)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-3 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                      {language === 'bn' ? 'স্বাস্থ্য' : 'Health'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.date)}
                    </span>
                  </div>
                  {/* Title */}
                  <h3
                    className="text-base font-bold text-slate-900 mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  {/* Excerpt */}
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {stripHtml(post.excerpt.rendered)}
                  </p>
                  {/* Read More */}
                  <div className="btn-slide btn-primary flex items-center gap-2 group w-fit text-sm">
                    {t.readMore}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav arrows */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute -left-2 top-[30%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute -right-2 top-[30%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}