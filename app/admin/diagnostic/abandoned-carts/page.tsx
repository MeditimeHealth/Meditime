"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Timer, 
  User, 
  Phone, 
  Mail, 
  Activity, 
  ChevronLeft,
  Search,
  ExternalLink,
  MessageCircle,
  Loader2,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { showToast } from "@/lib/toast";

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useLanguage();

  const fetchCarts = async () => {
    try {
      const res = await fetch("/api/diagnostic/abandoned-cart");
      const data = await res.json();
      if (res.ok) {
        setCarts(data.carts || []);
      }
    } catch (error) {
      console.error("Error fetching abandoned carts:", error);
      showToast.error("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const filteredCarts = carts.filter(cart => 
    cart.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cart.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/diagnostic"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-full" })}
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="bg-red-50 p-2 rounded-xl">
                <Timer className="h-8 w-8 text-red-500" />
              </div>
              {language === 'bn' ? 'পরিত্যক্ত কার্ট ফলোআপ' : 'Abandoned Cart follow-up'}
            </h1>
            <p className="text-gray-500 font-medium">
              {language === 'bn' ? 'পেশেন্টদের সাথে যোগাযোগ করুন যারা বুকিং সম্পন্ন করেননি' : 'Reach out to patients who didn\'t complete their diagnostic booking'}
            </p>
          </div>
        </div>

        {carts.length > 0 && (
          <Button 
            onClick={async () => {
              if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি সব হিস্ট্রি মুছতে চান?' : 'Are you sure you want to clear all history?')) {
                try {
                  const res = await fetch("/api/diagnostic/abandoned-cart", { method: "DELETE" });
                  if (res.ok) {
                    showToast.success(language === 'bn' ? 'সব হিস্ট্রি মুছে ফেলা হয়েছে' : 'History cleared successfully');
                    fetchCarts();
                  }
                } catch (err) {
                  showToast.error("Failed to clear history");
                }
              }
            }}
            variant="outline" 
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {language === 'bn' ? 'সব মুছুন' : 'Clear History'}
          </Button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={language === 'bn' ? 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...' : 'Search by name or phone...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
          <p className="text-gray-500 font-medium">{language === 'bn' ? 'কার্ট লোড হচ্ছে...' : 'Loading carts...'}</p>
        </div>
      ) : filteredCarts.length === 0 ? (
        <Card className="p-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Timer className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {language === 'bn' ? 'কোন পরিত্যক্ত কার্ট পাওয়া যায়নি' : 'No abandoned carts found'}
          </h3>
          <p className="text-gray-500">
            {language === 'bn' ? 'সব পেশেন্ট তাদের বুকিং সম্পন্ন করেছেন অথবা ডাটা এখনো সিঙ্ক হয়নি।' : 'All patients have completed their bookings or no one has started yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCarts.map((cart) => (
            <Card key={cart._id} className="p-6 md:p-8 rounded-3xl border-2 border-gray-50 hover:border-red-100 transition-all shadow-sm hover:shadow-xl hover:shadow-red-500/5 group">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* User Info */}
                <div className="lg:w-1/4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
                      <User className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 leading-tight">{cart.fullName}</h3>
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">
                        {formatDistanceToNow(new Date(cart.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-bold">{cart.phoneNumber}</span>
                    </div>
                    {cart.email && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-4 w-4 text-red-400" />
                        <span className="text-sm font-medium truncate">{cart.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart Details */}
                <div className="flex-1 space-y-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      {language === 'bn' ? 'নির্বাচিত টেস্টসমূহ' : 'Selected Tests'}
                    </h4>
                    <span className="text-2xl font-black text-gray-900">৳{cart.totalPrice}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm">
                    {cart.tests.map((test: any, idx: number) => (
                      <span key={idx} className="px-4 py-2 bg-slate-50 border border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-slate-100 transition-colors">
                        {language === 'bn' ? (test.nameBn || test.name) : test.name}
                      </span>
                    ))}
                  </div>

                  {cart.venueId && (
                    <div className="mt-4 p-4 bg-red-50/50 rounded-2xl border border-red-100 flex items-start gap-3">
                      <div className="mt-0.5 p-1 bg-red-100 rounded-md">
                        <Activity className="h-3.5 w-3.5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-red-400 uppercase leading-none mb-1">{language === 'bn' ? 'পছন্দিত হাসপাতাল' : 'Preferred Venue'}</p>
                        <p className="text-sm font-bold text-gray-800">{cart.venueId.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:w-1/5 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                  <a 
                    href={`tel:${cart.phoneNumber}`} 
                    className={buttonVariants({ 
                      variant: "outline",
                      className: "w-full border-gray-200 text-gray-700 font-bold rounded-xl h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 group/call flex items-center justify-center gap-2" 
                    })}
                  >
                    <Phone className="h-5 w-5 group-hover/call:animate-bounce" />
                    {language === 'bn' ? 'সরাসরি কল' : 'Direct Call'}
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
