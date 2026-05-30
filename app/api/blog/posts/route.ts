import { NextResponse } from "next/server";

const WORDPRESS_API = "https://wordpress.meditime.com.bd/wp-json/wp/v2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const per_page = searchParams.get("per_page") || "8";
    const lang = searchParams.get("lang");
    
    let url = `${WORDPRESS_API}/posts?per_page=${per_page}&_embed=true&orderby=date&order=desc`;
    if (lang) {
      url += `&lang=${lang}`;
    }
    
    // Server-side request bypasses browser CORS restrictions
    const response = await fetch(
      url, 
      {
        headers: {
          "Accept": "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        // Can adjust caching behavior if needed
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) {
        throw new Error(`WordPress API returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("WordPress Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
