"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { showToast } from "@/lib/toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function ContactPage() {
  const { language } = useLanguage() as { language: 'en' | 'bn' };
  const t = homepageTranslations[language].contactPage;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        showToast.error(result.error || (language === 'en' ? "Failed to send message. Please try again." : "মেসেজ পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"));
      }
    } catch (error) {
      showToast.error(language === 'en' ? "An error occurred. Please try again." : "একটি সমস্যা দেখা দিয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">{t.title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1 space-y-6">
            {/* Emergency Hotline */}
            <Card className="p-6 border-2 border-[#ff5e29]">
              <h2 className="text-2xl font-bold text-primary mb-4">{t.emergencyTitle}</h2>
              <a 
                href="tel:+8801610384444" 
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-white font-bold airport-light transition-all hover:scale-105 shadow-lg text-lg"
              >
                <Phone className="h-6 w-6" />
                <span>+880 1610-384444</span>
              </a>
              <p className="text-sm text-gray-600 mt-3 text-center">
                {t.emergencyStatus}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">{t.touchTitle}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.email}</h3>
                    <p className="text-gray-600">info@meditime.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.phone}</h3>
                    <p className="text-gray-600">+880 1610-384444</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.address}</h3>
                    <p className="text-gray-600">
                      {language === 'en' ? 'Savar, Dhaka' : 'সাভার, ঢাকা'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">{t.messageTitle}</h2>
              
              {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-green-800">{t.successMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">{t.nameLabel}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t.namePlaceholder}
                      {...register("name")}
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">{t.emailLabel}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.emailPlaceholder}
                      {...register("email")}
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">{t.phoneLabel}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    {...register("phone")}
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject">{t.subjectLabel}</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder={t.subjectPlaceholder}
                    {...register("subject")}
                    className="mt-1"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">{t.messageLabel}</Label>
                  <Textarea
                    id="message"
                    placeholder={t.messagePlaceholder}
                    rows={6}
                    {...register("message")}
                    className="mt-1"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    t.sendingBtn
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t.sendBtn}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
