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
    const checkUser = async () => {
      try {
        const verifyRes = await fetch("/api/admin/auth/verify");
        if (verifyRes.ok) {
          const resData = await verifyRes.json();
          setUser(resData.user);
        } else {
          console.warn("Admin session invalid or expired on backend");
          try {
            await fetch("/api/admin/auth/logout", { method: "POST" });
          } catch (err) {
            console.error("Logout error:", err);
          }
          window.dispatchEvent(new Event("adminLogout"));
          router.push("/admin-login");
        }
      } catch (error) {
        console.error("Error verifying admin session:", error);
        window.dispatchEvent(new Event("adminLogout"));
        router.push("/admin-login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    window.addEventListener("adminLogin", checkUser);
    window.addEventListener("adminLogout", checkUser);

    return () => {
      window.removeEventListener("adminLogin", checkUser);
      window.removeEventListener("adminLogout", checkUser);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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

