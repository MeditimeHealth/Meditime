"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Clock, 
  Calendar,
  User,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";

interface Doctor {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
}

interface DoctorSidebarProps {
  user: Doctor | null;
  onLogout: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    titleBn: "ড্যাশবোর্ড",
    icon: LayoutDashboard,
    href: "/doctor/dashboard",
  },
  {
    title: "All Patients",
    titleBn: "সকল রোগী",
    icon: Users,
    href: "/doctor/patients",
  },
  {
    title: "Time Slots",
    titleBn: "সময়সূচী",
    icon: Clock,
    href: "/doctor/time-slots",
  },
  {
    title: "Reports",
    titleBn: "রিপোর্ট",
    icon: BarChart3,
    href: "/doctor/reports",
  },
  {
    title: "Profile",
    titleBn: "প্রোফাইল",
    icon: User,
    href: "/doctor/profile",
  },
];

export default function DoctorSidebar({ user, onLogout }: DoctorSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">MEDI TIME</h1>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span style={{ fontFamily: language === 'bn' ? "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" : undefined }}>
                    {getLocalizedValue(item.title, item.titleBn, language)}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="border-t border-gray-200 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Not logged in</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

