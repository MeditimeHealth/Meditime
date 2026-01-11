"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/doctor", label: "ডাক্তার" },
    { href: "/hospital", label: "হাসপাতাল" },
    { href: "/service", label: "সেবা সমূহ" },
    { href: "/diagnostic", label: "ডায়াগনস্টিক টেস্ট" },
    { href: "/blog", label: "স্বাস্থ্য টিপস" },
    { href: "/affiliate", label: "পার্টনার হোন" },
    { href: "/contact", label: "যোগাযোগ" },
  ];

  const services = [
    { href: "/ambulance", label: "Ambulance" },
    { href: "/service", label: "ভিডিও কনসালটেশন" },
    { href: "/service", label: "ঔষধ অর্ডার" },
    { href: "/service", label: "ল্যাব টেস্ট" },
    { href: "/service", label: "হোম হেলথ কেয়ার" },
    { href: "/service", label: "স্বাস্থ্যসেবা প্যাকেজ" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#009A98] to-[#00B5B2] flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h3
                className="text-2xl font-bold text-white"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                মেডিটাইম
              </h3>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              আপনার স্বাস্থ্য, আমাদের অগ্রাধিকার। বাংলাদেশের শীর্ষস্থানীয় ডিজিটাল স্বাস্থ্যসেবা প্ল্যাটফর্ম।
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#009A98] flex items-center justify-center transition-all hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-lg font-bold text-white mb-4"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              দ্রুত লিংক
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[#009A98] transition-colors flex items-center gap-2"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009A98]"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-lg font-bold text-white mb-4"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              আমাদের সেবা
            </h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href={service.href}
                    className="text-sm hover:text-[#009A98] transition-colors flex items-center gap-2"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009A98]"></span>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              className="text-lg font-bold text-white mb-4"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              যোগাযোগ
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#009A98]/20 flex items-center justify-center mt-0.5">
                  <Phone className="w-5 h-5 text-[#009A98]" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-white mb-1"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ফোন
                  </p>
                  <a
                    href="tel:+8801610384444"
                    className="text-sm hover:text-[#009A98] transition-colors"
                  >
                    +880 1610384444
                  </a>
                  <br />
                  <a
                    href="tel:+8801610384444"
                    className="text-sm hover:text-[#009A98] transition-colors"
                  >
                    +880 1610384444
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#009A98]/20 flex items-center justify-center mt-0.5">
                  <Mail className="w-5 h-5 text-[#009A98]" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-white mb-1"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ইমেইল
                  </p>
                  <a
                    href="mailto:info@meditime.com.bd"
                    className="text-sm hover:text-[#009A98] transition-colors break-all"
                  >
                    info@meditime.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#009A98]/20 flex items-center justify-center mt-0.5">
                  <MapPin className="w-5 h-5 text-[#009A98]" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-white mb-1"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ঠিকানা
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    ঢাকা, বাংলাদেশ
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4
                className="text-lg font-bold text-white mb-2"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                আমাদের মোবাইল অ্যাপ ডাউনলোড করুন
              </h4>
              <p
                className="text-sm text-gray-400"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                বিনামূল্যে অ্যাপ ডাউনলোড করুন এবং বিশেষ সুবিধা পান
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all"
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Download on the</span>
                  <span className="text-sm font-semibold">Google Play</span>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-all"
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Download on the</span>
                  <span className="text-sm font-semibold">App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              className="text-sm text-gray-400 text-center md:text-left"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              © {currentYear} মেডিটাইম। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="hover:text-[#009A98] transition-colors"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                গোপনীয়তা নীতি
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#009A98] transition-colors"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                শর্তাবলী
              </Link>
              <Link
                href="/about"
                className="hover:text-[#009A98] transition-colors"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                আমাদের সম্পর্কে
              </Link>
              <Link
                href="/affiliate-program"
                className="hover:text-[#009A98] transition-colors"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                অ্যাফিলিয়েট প্রোগ্রাম
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

