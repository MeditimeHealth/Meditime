"use client";

import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { Droplet, Car, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 mt-24 md:mt-28">
        {/* Service Sections - Two Big Clickable Cards */}
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Services</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blood Donors Section */}
            <Link href="/service/blood-donors">
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Droplet className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              Blood Donors
            </h2>
          </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Find blood donors in your area quickly and easily. Our platform connects you with verified blood donors 
                    across different blood groups and locations. Search by blood type, location, and availability status to 
                    find the right donor when you need it most. Every donor is verified and ready to help save lives.
                  </p>
                  <div className="flex items-center text-primary font-semibold text-lg group-hover:gap-3 transition-all pt-4">
                    <span>View All Blood Donors</span>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
            </Link>

            {/* Ambulance Services Section */}
            <Link href="/service/ambulance-services">
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Car className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">
              Ambulance Services
            </h2>
          </div>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Access emergency ambulance services when every second counts. Browse through our network of verified 
                    ambulance services with different vehicle types including Basic Life Support, Advanced Life Support, 
                    Critical Care, and Air Ambulance. Filter by location and availability to find the nearest available 
                    ambulance service for your emergency needs.
                  </p>
                  <div className="flex items-center text-primary font-semibold text-lg group-hover:gap-3 transition-all pt-4">
                    <span>View All Ambulances</span>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>
            </Link>
                      </div>
                    </div>
      </div>
    </div>
  );
}
