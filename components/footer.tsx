"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const services = [
    { href: "/doctor",      label: "Doctor Appointment" },
    { href: "/service",     label: "Video Consultation" },
    { href: "/hospital",    label: "Hospital List" },
    { href: "/diagnostic",  label: "Diagnostic Test" },
    { href: "/ambulance",   label: "Ambulance Directory" },
  ];

  const resources = [
    { href: "/membership",        label: "Discount Cards" },
    { href: "/blog",              label: "Health Tips" },
    { href: "/offer",             label: "Offer" },
    { href: "/affiliate-program", label: "Affiliate Programme" },
    { href: "/blood-donors",      label: "Blood Donors" },
  ];

  const socialLinks = [
    { icon: MessageCircle, href: "https://wa.me/8801610385555", label: "WhatsApp",  teal: false },
    { icon: Facebook,      href: "https://www.facebook.com/meditime.health", label: "Facebook", teal: true },
    { icon: Instagram,     href: "#", label: "Instagram", teal: false },
    { icon: Linkedin,      href: "#", label: "LinkedIn",  teal: false },
    { icon: Youtube,       href: "#", label: "YouTube",   teal: false },
  ];

  return (
    <footer className="bg-slate-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── TOP ROW: logo | CTA | email ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-b border-slate-700 py-10">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-2">
            <Image src="/logo.png" alt="Meditime Logo" width={150} height={40} className="h-9 w-auto brightness-200" />
            <p className="text-sm text-gray-400">Meditime- Right Care On Time</p>
          </div>

          {/* CTA text */}
          <div>
            <h3 className="text-2xl font-bold text-white leading-snug">
              Get Started &amp; Book Your Appointment
            </h3>
          </div>

          {/* Email input + button */}
          <div className="flex items-center bg-slate-800 rounded-full overflow-hidden pr-1.5 border border-slate-700 focus-within:border-primary transition-all">
            <input
              type="email"
              placeholder="Enter E- Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-5 py-3 text-sm text-gray-200 placeholder:text-gray-500 outline-none"
            />
            <button className="shrink-0 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all whitespace-nowrap">
              Send Email
            </button>
          </div>
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">

          {/* Get In Touch + socials */}
          <div className="flex flex-col gap-4">
            <h4 className="text-base font-bold text-white">Get In Touch</h4>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:scale-110 ${
                      social.teal
                        ? "bg-primary border-primary text-white"
                        : "border-gray-600 text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2.5">
              {services.map((s, i) => (
                <li key={i}>
                  <Link href={s.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resources.map((r, i) => (
                <li key={i}>
                  <Link href={r.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="text-white font-semibold">Medi Time</li>
              <li>Health Care IT Services</li>
              <li>Address: Domna, Savar, Dhaka 1349</li>
              <li>
                <a href="mailto:support@meditime.com.bd" className="hover:text-primary transition-colors">
                  support@meditime.com.bd
                </a>
              </li>
              <li>
                <a href="tel:+8801610384444" className="hover:text-primary transition-colors">
                  +880- 1610 38 4444
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── COPYRIGHT BAR ── */}
        <div className="border-t border-slate-700 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © 2026 All Rights Reserved By Meditime.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/about"   className="hover:text-primary transition-colors">About Us</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-primary transition-colors">Terms and Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}