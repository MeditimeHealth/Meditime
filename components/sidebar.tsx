"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Stethoscope, 
  Settings, 
  LogOut,
  Menu,
  X,
  MapPin,
  Microscope,
  Droplet,
  Car,
  Image,
  Briefcase,
  Building2,
  Clock,
  Wallet,
  Camera,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
}

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Create Doctor",
    icon: UserPlus,
    href: "/admin/doctors/create",
  },
  {
    title: "All Doctors",
    icon: Users,
    href: "/admin/doctors",
  },
  {
    title: "Add Hospital",
    icon: Building2,
    href: "/admin/hospitals",
  },
  {
    title: "Blood Donors",
    icon: Droplet,
    href: "/admin/blood-donors",
  },
  {
    title: "Ambulances",
    icon: Car,
    href: "/admin/ambulances",
  },
  {
    title: "Pending Services",
    icon: Clock,
    href: "/admin/pending-services",
  },
  {
    title: "Locations",
    icon: MapPin,
    href: "/admin/locations",
  },
  {
    title: "Departments",
    icon: Building2,
    href: "/admin/departments",
  },
  {
    title: "সকল রোগ",
    icon: Stethoscope,
    href: "/admin/diseases",
  },
  {
    title: "Diagnostic",
    icon: Microscope,
    href: "/admin/diagnostic",
  },
  {
    title: "Appointments",
    icon: Stethoscope,
    href: "/admin/appointments",
  },
  {
    title: "Blog Sidebar",
    icon: Image,
    href: "/admin/blog-sidebar",
  },
  {
    title: "Service Sections",
    icon: Briefcase,
    href: "/admin/service-sections",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "Affiliate Management",
    icon: Users,
    href: "/admin/affiliate-management",
  },
  {
    title: "Photo Requests",
    icon: Camera,
    href: "/admin/affiliate-photo-requests",
  },
  {
    title: "Affiliate Overview",
    icon: Wallet,
    href: "/admin/affiliate-overview",
  },
  {
    title: "Completed Reports",
    icon: FileText,
    href: "/admin/affiliate-reports/completed",
  },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="border-t border-gray-200 p-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Not logged in</p>
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
