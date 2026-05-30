"use client";
import { useEffect, useState } from 'react';
import styles from './scroll-to-top.module.css';

/**
 * ScrollToTopButton – a floating button that appears after the user scrolls
 * down a bit and scrolls the page back to the top when clicked.
 *
 * The button uses the stylish CSS defined in `scroll-to-top.module.css`.
 */
export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px vertically
      setShow(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case the page loads already scrolled
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      className={`fixed bottom-10 print:hidden right-8 z-50 w-12 h-12 bg-[var(--background-dark)] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 print:hidden`}
      onClick={scrollToTop}
    >
      {/* Simple upward arrow – you can replace with an SVG icon if desired */}
      ↑
    </button>
  );
}
