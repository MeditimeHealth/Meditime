"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function BookAppointmentSection() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mx-auto max-w-7xl my-12 px-4 sm:px-6 lg:px-8">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/slide.jpg')" }}
      />
      {/* Dark teal overlay — stronger on left, fades right */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/95 via-slate-800/70 to-slate-800/20" />

      {/* Content */}
      <div className="relative z-10 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* White card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">
              Book An Appointment
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <input
                type="text"
                placeholder="Full Name*"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-100 text-slate-700 placeholder:text-slate-400 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 transition-all border-0"
              />

              {/* Phone Number */}
              <input
                type="tel"
                placeholder="Phone Number*"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-100 text-slate-700 placeholder:text-slate-400 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 transition-all border-0"
              />

              {/* Message */}
              <textarea
                placeholder="Message*"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-slate-100 text-slate-700 placeholder:text-slate-400 text-sm px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-primary/40 transition-all border-0 resize-none"
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-3.5 rounded-full transition-all shadow-md hover:shadow-primary/30 disabled:opacity-60 mt-1"
              >
                {loading ? "Submitting..." : "Book Appointment"}
              </button>

              {success && (
                <p className="text-center text-sm text-green-600 font-medium">
                  ✓ Your appointment request has been sent!
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}