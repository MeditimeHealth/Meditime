"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Calendar, Clock, ArrowLeft, Loader2 } from "lucide-react";

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

const WORDPRESS_API = "https://wordpress.meditime.com.bd/wp-json/wp/v2";



export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${WORDPRESS_API}/posts?slug=${slug}&_embed=true`
      );
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setPost(data[0]);
      } else {
        setError("Post not found");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };



  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  // Keep recentPosts for fallback (but we'll remove the fetch)
  const [recentPosts, setRecentPosts] = useState<WordPressPost[]>([]);
  
  useEffect(() => {
    fetchRecentPosts();
  }, [slug]);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch(
        `/api/blog/posts?per_page=4`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        const filtered = data.filter((p: WordPressPost) => p.slug !== slug).slice(0, 3);
        setRecentPosts(filtered);
      }
    } catch (error) {
      console.error("Error fetching recent posts:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">{error || "Post not found"}</p>
            <Button onClick={() => router.push("/blog")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                onClick={() => router.push("/blog")}
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </div>

            {/* Featured Image */}
            <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
              <Image
                src={getFeaturedImage(post)}
                alt={stripHtml(post.title.rendered)}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            {/* Article Header */}
            <div className="mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight tracking-tight"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.date)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {getAuthorName(post)}
                </div>
              </div>
            </div>

            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
            </article>

            {/* Back to Blog Button */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <Button
                onClick={() => router.push("/blog")}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Posts
              </Button>
            </div>
          </div>

          {/* Sticky Right Sidebar with Admin Photos */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Display Relevant Blogs */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Related Articles</h3>
              {recentPosts.length > 0 ? (
                recentPosts.map((recentPost) => (
                  <Card key={recentPost.id} className="overflow-hidden border-0 shadow-lg">
                    <Link href={`/blog/${recentPost.slug}`}>
                      <div className="relative h-48 w-full bg-gray-200 group cursor-pointer">
                        <Image
                          src={getFeaturedImage(recentPost)}
                          alt={stripHtml(recentPost.title.rendered)}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/slide.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                          <p className="text-white font-bold text-sm line-clamp-2">
                            {stripHtml(recentPost.title.rendered)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))
              ) : (
                <div className="text-gray-500 p-4">No related articles found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

