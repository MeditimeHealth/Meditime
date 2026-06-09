"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Calendar, Clock, Filter, Loader2, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import { formatBlogDate, toBengaliNumber } from "@/lib/time-utils";
import Footer from "@/components/footer";

interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
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

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const WORDPRESS_API = "https://wordpress.meditime.com.bd/wp-json/wp/v2";

export default function HealthTipsPage() {
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [featuredPost, setFeaturedPost] = useState<WordPressPost | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { language } = useLanguage();
  const t = homepageTranslations[language];

  useEffect(() => {
    fetchCategories();
  }, [language]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, language]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${WORDPRESS_API}/categories?per_page=100&lang=${language}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data.filter((cat: Category) => cat.count > 0));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `${WORDPRESS_API}/posts?per_page=100&_embed=true&lang=${language}`;
      if (selectedCategory) {
        url += `&categories=${selectedCategory}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
        // Set the first post as featured only when no category is selected
        if (data.length > 0 && !selectedCategory) {
          setFeaturedPost(data[0]);
        } else {
          setFeaturedPost(null);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const regularPosts = useMemo(() => {
    // Exclude the featured post from regular posts
    if (!featuredPost) return posts;
    return posts.filter((post) => post.id !== featuredPost.id);
  }, [posts, featuredPost]);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
  };

  const formatDate = (dateString: string) => {
    return formatBlogDate(dateString, language);
  };

  const getFeaturedImage = (post: WordPressPost) => {
    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    return imageUrl || "/slide.jpg";
  };

  const getAuthorName = (post: WordPressPost) => {
    return post._embedded?.author?.[0]?.name || t.blogPage.authorAdmin;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - 70% of homepage height */}
      <div className="relative px-0">
        <div className=" mx-auto">
          <div className="h-[650px] rounded-none overflow-hidden">
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(/slide.jpg)`,
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full items-center justify-center">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="mx-auto max-w-3xl text-center text-white">
                    <h1 className="mb-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      {t.blogPage.heroTitle}
                    </h1>
                    <p className="mb-8 text-base leading-relaxed sm:text-lg lg:text-xl">
                      {t.blogPage.heroDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="h-5 w-5" />
              <span className="font-semibold">{t.blogPage.filterCategory}</span>
            </div>
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              className="rounded-full"
            >
              {t.blogPage.allPosts}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === String(category.id) ? "default" : "outline"}
                onClick={() => setSelectedCategory(String(category.id))}
                className="rounded-full"
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Featured Post - New York Style Large Hero */}
            {featuredPost && !selectedCategory && posts.length > 0 && (
              <div className="mb-16">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer group border-0 shadow-lg">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-96 md:h-auto min-h-[400px] bg-gray-100">
                        <Image
                          src={getFeaturedImage(featuredPost)}
                          alt={stripHtml(featuredPost.title.rendered)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white">
                        <div className="mb-4">
                          <span className="text-xs font-bold text-primary uppercase tracking-[0.15em] letter-spacing-wide">
                            {t.blogPage.featuredArticle}
                          </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-[1.1] transition-colors tracking-tight">
                          {stripHtml(featuredPost.title.rendered)}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(featuredPost.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {getAuthorName(featuredPost)}
                          </div>
                        </div>
                        <p className="text-lg text-gray-700 leading-relaxed mb-8 line-clamp-4 font-light">
                          {stripHtml(featuredPost.excerpt.rendered)}
                        </p>
                        <div className="flex items-center text-primary font-bold text-sm uppercase tracking-wide group-hover:gap-2 transition-all">
                          {t.blogPage.readFullStory}
                          <ChevronRight className="h-5 w-5 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            )}

            {/* Posts Grid - New York Style Editorial Layout */}
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => {
                  // Create varied layouts for visual interest
                  const isLarge = index % 7 === 0 && !selectedCategory;
                  
                  if (isLarge) {
                    return (
                      <div key={post.id} className="md:col-span-2 lg:col-span-2">
                        <Link href={`/blog/${post.slug}`}>
                          <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer group border-0 shadow-lg">
                            <div className="grid md:grid-cols-2 gap-0 h-full">
                              <div className="relative h-64 md:h-full min-h-[300px] bg-gray-100">
                                <Image
                                  src={getFeaturedImage(post)}
                                  alt={stripHtml(post.title.rendered)}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/slide.jpg";
                                  }}
                                />
                              </div>
                              <div className="p-6 md:p-8 flex flex-col justify-center">
                                <h3 className="text-2xl md:text-3xl font-bold text-primary mb-3 leading-tight transition-colors tracking-tight">
                                  {stripHtml(post.title.rendered)}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 font-medium">
                                  <span>{formatDate(post.date)}</span>
                                  <span>•</span>
                                  <span>{getAuthorName(post)}</span>
                                </div>
                                <p className="text-gray-600 leading-relaxed line-clamp-3 font-light">
                                  {stripHtml(post.excerpt.rendered)}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </div>
                    );
                  }

                  return (
                    <div key={post.id}>
                      <Link href={`/blog/${post.slug}`}>
                        <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 cursor-pointer group flex flex-col border-0 shadow-md">
                          <div className="relative h-64 w-full bg-gray-100">
                            <Image
                              src={getFeaturedImage(post)}
                              alt={stripHtml(post.title.rendered)}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/slide.jpg";
                              }}
                            />
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-primary mb-3 leading-tight transition-colors line-clamp-2 tracking-tight">
                              {stripHtml(post.title.rendered)}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 font-medium">
                              <span>{formatDate(post.date)}</span>
                              <span>•</span>
                              <span>{getAuthorName(post)}</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1 font-light">
                              {stripHtml(post.excerpt.rendered)}
                            </p>
                            <div className="mt-4 flex items-center text-primary font-semibold text-xs uppercase tracking-wide group-hover:gap-2 transition-all">
                              {t.blogPage.readMore}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500 text-lg">{t.blogPage.noPosts}</p>
              </Card>
            )}
          </>
        )}

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>{t.blogPage.showing} {language === 'bn' ? toBengaliNumber(posts.length) : posts.length} {posts.length === 1 ? t.blogPage.post : t.blogPage.posts}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
