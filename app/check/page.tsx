"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Shield
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CardResult {
  valid: boolean;
  card?: {
    serialNumber: string;
    name: string;
    photo?: string;
    cardType: string;
    expiryDate: string;
    isActive: boolean;
    isExpired: boolean;
    status: string;
  };
  error?: string;
}

export default function CheckCardPage() {
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CardResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch("/api/membership-cards/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serialNumber: serialNumber.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ valid: false, error: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getCardTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      silver: {
        bg: "bg-gradient-to-br from-gray-300 to-gray-500",
        text: "text-gray-800",
        border: "border-gray-400"
      },
      gold: {
        bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
        text: "text-yellow-900",
        border: "border-yellow-500"
      },
      platinum: {
        bg: "bg-gradient-to-br from-purple-400 to-purple-700",
        text: "text-white",
        border: "border-purple-500"
      },
      corporate: {
        bg: "bg-gradient-to-br from-blue-500 to-blue-800",
        text: "text-white",
        border: "border-blue-600"
      },
    };
    return styles[type] || styles.silver;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "Expired":
        return <Clock className="w-6 h-6 text-orange-500" />;
      case "Deactivated":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-50";
      case "Expired":
        return "text-orange-600 bg-orange-50";
      case "Deactivated":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative mt-16 px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        style={{
          backgroundImage: "linear-gradient(135deg, #009A98 0%, #00B5B2 50%, #007977 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              মেম্বারশিপ কার্ড যাচাই
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              আপনার মেম্বারশিপ কার্ডের সত্যতা যাচাই করতে নিচে সিরিয়াল নম্বর দিন
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex-1 -mt-8 relative z-20 pb-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="serialNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"

                  >
                    কার্ড সিরিয়াল নম্বর
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="serialNumber"
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      placeholder="MT24XXXXXX"
                      className="flex-1 font-mono text-lg"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !serialNumber.trim()}
                      className="bg-primary hover:bg-primary-dark text-white px-6"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Results */}
              {searched && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  {result?.valid && result.card ? (
                    <div className="space-y-6">
                      {/* Card Visual */}
                      <div
                        className={`relative ${getCardTypeStyle(result.card.cardType).bg} rounded-2xl p-6 text-white shadow-xl overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <p className="text-white/70 text-sm">MEDI TIME</p>
                              <p className="text-2xl font-bold capitalize">{result.card.cardType}</p>
                            </div>
                            <CreditCard className="w-10 h-10 text-white/80" />
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            {result.card.photo ? (
                              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/50">
                                <Image
                                  src={result.card.photo}
                                  alt={result.card.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                                <User className="w-8 h-8 text-white/80" />
                              </div>
                            )}
                            <div>
                              <p className="text-xl font-semibold">{result.card.name}</p>
                              <p className="text-white/70 font-mono">{result.card.serialNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-white/80">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              মেয়াদ: {new Date(result.card.expiryDate).toLocaleDateString("bn-BD")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex items-center justify-center gap-3 py-4 px-6 rounded-xl ${getStatusColor(result.card.status)}`}
                      >
                        {getStatusIcon(result.card.status)}
                        <span
                          className="text-lg font-semibold"

                        >
                          {result.card.status === "Active" && "কার্ডটি সক্রিয় আছে"}
                          {result.card.status === "Expired" && "কার্ডের মেয়াদ শেষ"}
                          {result.card.status === "Deactivated" && "কার্ডটি নিষ্ক্রিয় করা হয়েছে"}
                        </span>
                      </div>

                      {/* Card Details */}
                      <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                        <h3
                          className="font-semibold text-gray-900 mb-4"

                        >
                          কার্ডের বিবরণ
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">কার্ডধারীর নাম</p>
                            <p className="font-medium text-gray-900">{result.card.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">কার্ডের ধরণ</p>
                            <p className="font-medium text-gray-900 capitalize">{result.card.cardType}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">সিরিয়াল নম্বর</p>
                            <p className="font-medium text-gray-900 font-mono">{result.card.serialNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">মেয়াদ শেষ</p>
                            <p className="font-medium text-gray-900">
                              {new Date(result.card.expiryDate).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <h3
                        className="text-xl font-semibold text-gray-900 mb-2"
                        
                      >
                        কার্ড পাওয়া যায়নি
                      </h3>
                      <p
                        className="text-gray-600"
                        
                      >
                        এই সিরিয়াল নম্বরে কোনো কার্ড নিবন্ধিত নেই। সঠিক নম্বর দিয়ে আবার চেষ্টা করুন।
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
