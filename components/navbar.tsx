"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role?: string;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check for user in localStorage on mount and when storage changes
    const checkUser = () => {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("user");
          }
        } else {
          setUser(null);
        }
      }
    };

    checkUser();

    // Listen for storage changes (e.g., when user logs in from another tab)
    window.addEventListener("storage", checkUser);
    
    // Listen for custom login event (same window)
    window.addEventListener("userLogin", checkUser);
    
    // Listen for logout events
    window.addEventListener("userLogout", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userLogin", checkUser);
      window.removeEventListener("userLogout", checkUser);
    };
  }, []);

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
      // Dispatch event to update navbar
      window.dispatchEvent(new Event("userLogout"));
      router.push("/");
      router.refresh();
    }
  };

  const navLinks = [
    { href: "/doctor", label: "ডাক্তার" },
    { href: "/hospital", label: "হাসপাতাল" },
    { href: "/service", label: "সেবা সমূহ" },
    { href: "/diagnostic", label: "ডায়াগনস্টিক টেস্ট" },
    { href: "/blog", label: "স্বাস্থ্য টিপস" },
    { href: "/contact", label: "যোগাযোগ" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/98 backdrop-blur-xl shadow-lg border-b border-gray-100"
          : "bg-white/90 backdrop-blur-lg shadow-md"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="transition-all duration-300"
          >
            <Link href="/">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={100 } 
                height={100} 
                className="h-8 md:h-10 w-auto cursor-pointer" 
              />
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <motion.div
                key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="relative group"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    <span
                      className={`text-xl md:text-2xl font-semibold transition-all duration-300 ${
                        isActive
                          ? "text-primary"
                          : "text-gray-700 group-hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-light via-primary to-primary-dark rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/0 group-hover:bg-primary/50 rounded-full"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-3 md:gap-4"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-bold text-sm">
                      {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-base md:text-lg font-semibold text-gray-800 hidden sm:block">
                      {user.fullName}
                    </span>
                  </div>
                    {user.role === 'admin' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/admin"
                        className="px-4 py-2 bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-base font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        ড্যাশবোর্ড
                      </Link>
                    </motion.div>
                    )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-base font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
                >
                  লগআউট
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                    className="text-base md:text-lg font-semibold text-gray-700 hover:text-primary transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-primary/5"
                >
                    লগইন
                </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/signup"
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-light via-primary to-primary-dark hover:from-primary hover:via-primary-dark hover:to-primary text-white text-base md:text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                    নিবন্ধন
                </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
