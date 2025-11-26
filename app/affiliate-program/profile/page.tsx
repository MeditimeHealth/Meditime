"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page redirects to the dashboard with the profile tab active
export default function AffiliateProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if affiliate is logged in
    const affiliateData = localStorage.getItem("affiliate");
    if (!affiliateData) {
      router.push("/affiliate-program");
      return;
    }
    
    // Redirect to dashboard with profile tab
    router.push("/affiliate-program/dashboard?tab=profile");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-cyan-300 text-lg font-medium">Redirecting to profile...</p>
      </div>
    </div>
  );
}
