"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Star, Building2, Check, Phone, User, Users, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useRouter } from "next/navigation";

const membershipPlans = {
  silver: {
    id: "silver",
    title: "Meditime Health Card - Silver Membership",
    shortTitle: "Silver",
    icon: Star,
    color: "#9CA3AF",
    gradient: "from-gray-300 to-gray-500",
    price: 1000,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 1000,
    period: "/year",
    membersCovered: 2,
    whatsIncluded: [
      "Applicable for Total 2 Persons - You and Another 1 Member of your Family",
      "15% discount on Medical Bills",
      "Network of 30+ Hospitals",
      "12 Months Validity for Unlimited Time Visits",
    ],
  },
  gold: {
    id: "gold",
    title: "Meditime Health Card - Gold Membership",
    shortTitle: "Gold",
    icon: Sparkles,
    color: "#F59E0B",
    gradient: "from-yellow-300 to-yellow-600",
    price: 2500,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 2500,
    period: "/year",
    membersCovered: 3,
    popular: true,
    whatsIncluded: [
      "Applicable for Total 3 Persons - You and Another 2 Members of your Family",
      "15% discount on Medical Bills",
      "Network of 30+ Hospitals",
      "12 Months Validity for Unlimited Time Visits",
    ],
  },
  platinum: {
    id: "platinum",
    title: "Meditime Health Card - Platinum Membership",
    shortTitle: "Platinum",
    icon: Crown,
    color: "#9333EA",
    gradient: "from-purple-300 to-purple-600",
    price: 5000,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 5000,
    period: "/year",
    membersCovered: 5,
    whatsIncluded: [
      "Applicable for Total 5 Persons - You and Another 4 Members of your Family",
      "15% discount on Medical Bills",
      "Network of 30+ Hospitals",
      "12 Months Validity for Unlimited Time Visits",
    ],
  },
  corporate: {
    id: "corporate",
    title: "Meditime Health Card - Corporate Membership",
    shortTitle: "Corporate",
    icon: Building2,
    color: "#3B82F6",
    gradient: "from-blue-400 to-blue-700",
    price: 0,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 0,
    period: "",
    membersCovered: 0,
    whatsIncluded: [
      "Applicable for You Only",
      "15% discount on Medical Bills",
      "Network of 30+ Hospitals",
      "12 Months Validity for Unlimited Time Visits",
    ],
  },
};

export default function MembershipDetailPage({ params }: { params: Promise<{ plan: string }> }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.plan as keyof typeof membershipPlans;
  const plan = membershipPlans[planId];
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    cardPackage: planId,
    membersCovered: plan?.membersCovered || 0,
    deliveryAddress: "",
    company: "",
    companyIdNumber: "",
  });

  if (!plan) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center ">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h1>
          <button
            onClick={() => router.push("/membership")}
            className="text-primary hover:underline"
          >
            ← Back to memberships
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = plan.icon;
  const totalAmount = plan.price + plan.cardFee + plan.deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (plan.id === "corporate") {
          alert("Thank you! Our team will contact you shortly for corporate membership.");
          router.push("/");
        } else {
          const paymentResponse = await fetch("/api/memberships/payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ membershipId: data.membershipId }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok && paymentData.gatewayUrl) {
            window.location.href = paymentData.gatewayUrl;
          } else {
            alert("Failed to initiate payment. Please try again.");
          }
        }
      } else {
        alert(data.error || "Failed to submit membership application");
      }
    } catch (error) {
      console.error("Error submitting membership:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Same as membership main page */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative  h-[350px] md:h-[400px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/50 to-primary-dark/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80')",
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
                Meditime Health Card
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-6 drop-shadow-lg font-semibold">
                Your Pass to Affordable Medical Services
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showForm ? (
          <>
            {/* Card Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <IconComponent className="w-10 h-10" style={{ color: plan.color }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: plan.color }}>
                      {plan.title}
                    </h2>
                    {'popular' in plan && plan.popular && (
                      <span className="inline-block bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.id === "corporate" ? "Custom" : `৳${plan.yearlyPrice.toLocaleString()}`}
                    </span>
                    {plan.period && <span className="text-gray-600 text-lg">{plan.period}</span>}
                  </div>
                  {plan.id !== "corporate" && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Membership Fee:</span>
                        <span className="font-semibold">৳{plan.yearlyPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card Fee:</span>
                        <span className="font-semibold">৳{plan.cardFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span className="font-semibold">৳{plan.deliveryCharge}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-primary">৳{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                >
                  {plan.id === "corporate" ? "Request Quote" : "Order Now"}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>

            {/* What's Included Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#009A98] mb-6">What&apos;s Included</h2>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
                <div className="space-y-4">
                  {plan.whatsIncluded.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed pt-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          /* Registration Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 text-primary hover:underline flex items-center gap-2"
            >
              ← Back to details
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: plan.color }}>
                  Complete Your Purchase
                </h2>
                <p className="text-gray-600 mb-4">
                  Fill in your details to proceed with payment
                </p>
                {plan.id !== "corporate" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-700">Total Amount:</span>
                        <span className="font-bold text-primary text-xl">৳{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Name (As per NID/Birth Certificate) *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>

                  {plan.id === "corporate" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Building2 className="w-4 h-4 inline mr-2" />
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Enter company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Building2 className="w-4 h-4 inline mr-2" />
                          Company ID Number *
                        </label>
                        <input
                          type="text"
                          name="companyIdNumber"
                          value={formData.companyIdNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Company registration number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Number of Employees
                        </label>
                        <input
                          type="number"
                          name="membersCovered"
                          value={formData.membersCovered}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Number of employees to cover"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Delivery Address *
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter complete delivery address with area, city, and postal code"
                  />
                </div>

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: plan.id === "corporate" ? `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)` : undefined,
                    }}
                  >
                    {isSubmitting 
                      ? "Processing..." 
                      : plan.id === "corporate"
                        ? "Submit Request"
                        : `Proceed to Payment (৳${totalAmount.toLocaleString()})`
                    }
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    {plan.id === "corporate" 
                      ? "Our team will contact you for custom pricing"
                      : "Secure payment powered by SSLCommerz"
                    }
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
