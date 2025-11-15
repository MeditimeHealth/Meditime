"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DoctorSidebar from "@/components/doctor-sidebar";

interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role?: string;
}

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Routes that don't require authentication
  const publicRoutes = ['/doctor', '/doctor/login'];
  // Protected routes that require authentication
  const protectedRoutes = [
    '/doctor/dashboard',
    '/doctor/patients',
    '/doctor/reports',
    '/doctor/profile',
    '/doctor/time-slots'
  ];
  
  // Check if current route is public
  // Doctor profile pages (e.g., /doctor/[id]) are public landing pages
  const isPublicRoute = publicRoutes.includes(pathname || '') || 
    (pathname?.startsWith('/doctor/') && 
     !protectedRoutes.some(route => pathname.startsWith(route)) &&
     pathname !== '/doctor/login');

  useEffect(() => {
    // Skip authentication check for public routes
    if (isPublicRoute) {
      setLoading(false);
      return;
    }

    const checkUser = () => {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role === 'doctor') {
              setUser(parsedUser);
            } else {
              router.push("/doctor/login");
            }
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("user");
            router.push("/doctor/login");
          }
        } else {
          router.push("/doctor/login");
        }
      }
      setLoading(false);
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("userLogin", checkUser);
    window.addEventListener("userLogout", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userLogin", checkUser);
      window.removeEventListener("userLogout", checkUser);
    };
  }, [router, isPublicRoute]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      window.dispatchEvent(new Event("userLogout"));
      router.push("/");
      router.refresh();
    }
  };

  // For public routes, just render children without sidebar
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 lg:ml-64 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

