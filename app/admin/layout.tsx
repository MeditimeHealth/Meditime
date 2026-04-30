"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";

interface User {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("admin_user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error("Error parsing admin data:", error);
          }
        }
      }
      setLoading(false);
    };

    checkUser();


    window.addEventListener("storage", checkUser);
    window.addEventListener("adminLogin", checkUser);
    window.addEventListener("adminLogout", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("adminLogin", checkUser);
      window.removeEventListener("adminLogout", checkUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_user");
      setUser(null);
      window.dispatchEvent(new Event("adminLogout"));
      router.push("/");
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 lg:ml-64 overflow-y-auto h-screen" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

