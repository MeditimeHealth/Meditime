"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle, Settings, LogOut as LogOutIcon, Wallet, DollarSign } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [affiliate, setAffiliate] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
        
        // Also check for affiliate
        const affiliateData = localStorage.getItem("affiliate");
        if (affiliateData) {
          try {
            setAffiliate(JSON.parse(affiliateData));
          } catch (error) {
            console.error("Error parsing affiliate data:", error);
            localStorage.removeItem("affiliate");
          }
        } else {
          setAffiliate(null);
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
    { href: "/doctor", label: "Doctors" },
    { href: "/hospital", label: "Hospitals" },
    { href: "/service", label: "Services" },
    { href: "/diagnostic", label: "Diagnostic Tests" },

    { href: "/membership", label: "Discount Cards" },
    { href: "/contact", label: "Contact" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white shadow-md py-4 sm:py-5"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="transition-all duration-300"
            >
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={120} 
                  height={120} 
                  className="h-8 sm:h-8 md:h-8 w-auto cursor-pointer" 
                  priority
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-8">
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
                        className={`text-base xl:text-lg font-semibold transition-all duration-300 ${
                          isActive
                            ? "text-primary font-bold"
                            : "text-slate-600 group-hover:text-primary font-medium"
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

            {/* Desktop Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3 md:gap-4">
              {user || affiliate ? (
                <>
                  {/* Profile Menu Button - Drawer Icon */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 hover:text-primary transition-all hover:scale-105 border border-gray-200">
                        <Menu className="h-5 w-5" />
                      </button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <div className="flex items-center gap-3 pb-4 border-b">
                          {(user as any)?.photo ? (
                            <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-gray-200">
                              <Image
                                src={(user as any).photo}
                                alt={user?.fullName || affiliate?.name || "User"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-bold text-lg">
                              {(user?.fullName || affiliate?.name)?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div>
                            <SheetTitle className="text-left">{user?.fullName || affiliate?.name}</SheetTitle>
                            <p className="text-sm text-gray-600">{user?.email || affiliate?.email}</p>
                          </div>
                        </div>
                      </SheetHeader>
                      <div className="mt-6 space-y-2">
                        {/* For Affiliates */}
                        {affiliate && (
                          <>
                            <button
                              onClick={() => {
                                router.push('/affiliate-program/dashboard');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Wallet className="h-5 w-5 text-gray-600" />
                              <span className="font-medium">Dashboard</span>
                            </button>
                            <button
                              onClick={() => {
                                router.push('/affiliate-program/profile');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <UserCircle className="h-5 w-5 text-gray-600" />
                              <span className="font-medium">My Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                router.push('/affiliate-program/withdrawal');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <DollarSign className="h-5 w-5 text-gray-600" />
                              <span className="font-medium">Request Withdrawal</span>
                            </button>
                          </>
                        )}
                        
                        {/* For Regular Users */}
                        {user && !affiliate && (
                          <>
                            <button
                              onClick={() => {
                                router.push('/user/profile');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <UserCircle className="h-5 w-5 text-gray-600" />
                              <span className="font-medium">My Profile</span>
                            </button>
                            <button
                              onClick={() => {
                                router.push('/appointments');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Wallet className="h-5 w-5 text-gray-600" />
                              <span className="font-medium">My Appointments</span>
                            </button>
                          </>
                        )}
                        
                        {/* Admin Dashboard (for admins) */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => {
                              router.push('/admin');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/10 rounded-lg transition-colors text-primary"
                          >
                            <Settings className="h-5 w-5" />
                            <span className="font-medium">Admin Dashboard</span>
                          </button>
                        )}
                        
                        <div className="border-t my-2"></div>
                        
                        {/* Logout */}
                        <button
                          onClick={() => {
                            if (affiliate) {
                              localStorage.removeItem("affiliate");
                              setAffiliate(null);
                              router.push("/affiliate-program");
                            } else {
                              handleLogout();
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <LogOutIcon className="h-5 w-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/login"
                      className="text-base font-semibold text-gray-700 hover:text-primary transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-primary/5"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/signup"
                      className="px-6 py-2.5 btn-primary text-white text-base shadow-lg hover:shadow-primary/30"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    Menu
                  </h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6 text-gray-700" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 text-primary border-2 border-primary/20"
                              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                          }`}
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile User Section */}
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                        {(user as any)?.photo ? (
                          <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30">
                            <Image
                              src={(user as any).photo}
                              alt={user.fullName || "User"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-bold text-lg">
                            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-base font-semibold text-gray-800 truncate"
                            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                          >
                            {user.fullName}
                          </p>
                          {user.phoneNumber && (
                            <p className="text-sm text-gray-600 truncate">{user.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full px-4 py-3 bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-base font-semibold rounded-lg transition-all duration-300 shadow-lg text-center"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-base font-semibold rounded-lg transition-all duration-300 border border-gray-200"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center text-base font-semibold text-gray-700 hover:text-primary transition-colors duration-300 rounded-lg hover:bg-primary/5 border-2 border-gray-200"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 bg-gradient-to-r from-primary-light via-primary to-primary-dark hover:from-primary hover:via-primary-dark hover:to-primary text-white text-base font-semibold rounded-lg transition-all duration-300 shadow-lg text-center"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
