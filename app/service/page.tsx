"use client";

import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Droplet, Car, ArrowRight, Building2, Stethoscope, Video, FlaskConical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Footer from "@/components/footer";

import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function ServicePage() {
  const { language } = useLanguage() as { language: 'en' | 'bn' };
  const t = homepageTranslations[language].servicesPage;

  const services = [
    {
      id: 1,
      title: t.doctorTitle,
      description: t.doctorDesc,
      icon: Stethoscope,
      iconBg: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      href: "/doctor",
      buttonText: t.doctorBtn,
    },
    {
      id: 2,
      title: t.hospitalTitle,
      description: t.hospitalDesc,
      icon: Building2,
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      href: "/hospital",
      buttonText: t.hospitalBtn,
    },
    {
      id: 3,
      title: t.videoTitle,
      description: t.videoDesc,
      icon: Video,
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      href: "/",
      buttonText: t.videoBtn,
    },
    {
      id: 4,
      title: t.diagnosticTitle,
      description: t.diagnosticDesc,
      icon: FlaskConical,
      iconBg: "bg-orange-100 group-hover:bg-orange-200",
      iconColor: "text-orange-600",
      href: "/diagnostic",
      buttonText: t.diagnosticBtn,
    },
    {
      id: 5,
      title: t.bloodTitle,
      description: t.bloodDesc,
      icon: Droplet,
      iconBg: "bg-red-100 group-hover:bg-red-200",
      iconColor: "text-red-600",
      href: "/service/blood-donors",
      buttonText: t.bloodBtn,
    },
    {
      id: 6,
      title: t.ambulanceTitle,
      description: t.ambulanceDesc,
      icon: Car,
      iconBg: "bg-primary/10 group-hover:bg-primary/20",
      iconColor: "text-primary",
      href: "/service/ambulance-services",
      buttonText: t.ambulanceBtn,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Cover Photo / Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[300px] md:h-[400px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/70 to-primary-dark/80 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-2xl"
              >
                {t.heroTitle}
              </h1>
              <p
                className="text-lg md:text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
              >
                {t.heroDesc}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-30">
          
          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={service.href}>
                    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary flex flex-col">
                      <div className="space-y-4 flex-1">
                        {/* Icon and Title */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`h-14 w-14 rounded-full ${service.iconBg} flex items-center justify-center transition-colors`}>
                            <IconComponent className={`h-7 w-7 ${service.iconColor}`} />
                          </div>
                          <h2 className="text-xl font-bold text-[#009A98] group-hover:text-[#009A98] transition-colors">
                            {service.title}
                          </h2>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-base leading-relaxed flex-1">
                          {service.description}
                        </p>
                        
                        {/* Button */}
                        <div className="pt-4">
                          <span 
                            className={cn(buttonVariants({ variant: "default", size: "default" }), "inline-flex items-center")}
                          >
                            {service.buttonText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
              <Footer/>

      </div>
  );
}
