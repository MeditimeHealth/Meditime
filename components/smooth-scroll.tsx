"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") || pathname?.startsWith("/doctor") || pathname?.startsWith("/user");
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  useEffect(() => {
    // Disable Lenis for admin/doctor/user dashboard routes and auth pages to allow native scrolling
    if (isAdminRoute || isAuthRoute) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Handle nested scrollable containers - allow native scrolling
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      // Check if we're inside a scrollable container
      const scrollableParent = target.closest('[data-lenis-prevent], .overflow-y-auto, .overflow-y-scroll, [style*="overflow-y"]');
      
      if (scrollableParent) {
        // Check if the scrollable container can scroll
        const element = scrollableParent as HTMLElement;
        const canScroll = element.scrollHeight > element.clientHeight;
        const isAtTop = element.scrollTop === 0;
        const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
        
        // If container can scroll and we're not at boundaries, use native scroll
        if (canScroll && (!isAtTop || e.deltaY > 0) && (!isAtBottom || e.deltaY < 0)) {
          lenis.stop();
          // Let native scroll handle it
          setTimeout(() => lenis.start(), 50);
          return;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      lenis.destroy();
    };
  }, [isAdminRoute, isAuthRoute]);

  return <>{children}</>;
}

