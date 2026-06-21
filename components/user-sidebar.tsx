"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";

interface UserSidebarProps {
  user: any | null;
  onLogout: () => void;
}

const menuItems = [
  {
    group: "Main Menu",
    groupBn: "প্রধান মেনু",
    items: [
      {
        title: "Profile",
        titleBn: "প্রোফাইল",
        icon: User,
        href: "/user/profile",
      },
      {
        title: "Appointments",
        titleBn: "অ্যাপয়েন্টমেন্ট",
        icon: Calendar,
        href: "/user/dashboard",
      },
    ]
  },
 
];

export default function UserSidebar({ user, onLogout }: UserSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-100 hover:bg-gray-50 transition-all active:scale-95 print:hidden"
      >
        {isMobileOpen ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Left Side */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#0a192f] text-white z-50 transition-transform duration-300 ease-in-out shadow-2xl overflow-hidden",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col h-full relative z-10">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/SVG/asset-3.png" 
                alt="Meditime Logo" 
                width={120} 
                height={40} 
                className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
            {menuItems.map((group) => (
              <div key={group.group} className="space-y-3">
                <h3 className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                  {language === 'bn' ? group.groupBn : group.group}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-white shadow-lg shadow-primary/25"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                          <span>
                            {getLocalizedValue(item.title, item.titleBn, language)}
                          </span>
                        </div>
                        {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Profile & Logout Section */}
          <div className="p-4 bg-black/20 border-t border-white/10">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="text-white font-bold text-base">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium truncate uppercase tracking-tighter">
                      {language === 'bn' ? 'ব্যক্তিগত অ্যাকাউন্ট' : 'Personal Account'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-red-500 hover:text-white transition-all group"
                >
                  <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">
                <p className="text-xs text-gray-500">
                  {language === 'bn' ? 'সেশন শেষ হয়েছে' : 'Session expired'}
                </p>
              </div>
            )}
          </div>
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </aside>
    </>
  );
}
