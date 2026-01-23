"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";

export default function Footer() {
  const services = [
    { href: "/doctor", label: "Doctor Appointment" },
    { href: "/service", label: "Video Consultation" },
    { href: "/hospital", label: "Hospital List" },
    { href: "/diagnostic", label: "Diagnostic Test" },
    { href: "/ambulance", label: "Ambulance Directory" },
  ];

  const resources = [
    { href: "/membership", label: "Discount Cards" },
    { href: "/blog", label: "Health Tips" },
    { href: "/offer", label: "Offer" },
    { href: "/affiliate-program", label: "Affiliate Programme" },
    { href: "/blood-donors", label: "Blood Donors" },
  ];

  const socialLinks = [
    { icon: MessageCircle, href: "https://wa.me/8801610385555", label: "WhatsApp" },
    { icon: Facebook, href: "https://www.facebook.com/meditime.health", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Company Info */}
          <div className="space-y-4">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="Meditime Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-gray-400">
              Meditime- Right Care On Time
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

          {/* Column 2 - Services */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href={service.href}
                    className="text-sm hover:text-[#009A98] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009A98]"></span>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              {resources.map((resource, index) => (
                <li key={index}>
                  <Link
                    href={resource.href}
                    className="text-sm hover:text-[#009A98] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009A98]"></span>
                    {resource.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <p className="text-white font-semibold">Medi Time</p>
                <p className="text-gray-400">Health Care IT Services</p>
              </li>
              <li>
                <p className="text-gray-400">Address: Domna, Savar, Dhaka 1349</p>
              </li>
              <li>
                <a
                  href="mailto:support@meditime.com.bd"
                  className="text-gray-400 hover:text-[#009A98] transition-colors"
                >
                  support@meditime.com.bd
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801610385555"
                  className="text-gray-400 hover:text-[#009A98] transition-colors"
                >
                  +880- 1610 38 5555
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Links */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © 2026 All Rights Reserved By Meditime.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link
                href="/about"
                className="hover:text-[#009A98] transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/privacy"
                className="hover:text-[#009A98] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-[#009A98] transition-colors"
              >
                Terms and Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
