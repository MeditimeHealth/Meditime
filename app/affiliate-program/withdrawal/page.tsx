"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  DollarSign, 
  Loader2, 
  Upload,
  X,
  AlertCircle
} from "lucide-react";
import { showToast } from "@/lib/toast";

interface Affiliate {
  affiliateCode: string;
  walletBalance: number;
  name: string;
  email: string;
}

export default function WithdrawalRequestPage() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Form state
  const [amount, setAmount] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if affiliate is logged in
    const affiliateData = localStorage.getItem("affiliate");
    if (!affiliateData) {
      router.push("/affiliate-program");
      return;
    }

    try {
      const parsedData = JSON.parse(affiliateData);
      setAffiliate(parsedData);
    } catch (error) {
      console.error("Error parsing affiliate data:", error);
      localStorage.removeItem("affiliate");
      router.push("/affiliate-program");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          showToast.error(`Failed to upload ${file.name}`);
        }
      }

      setPhotos([...photos, ...uploadedUrls]);
      showToast.success("Photos uploaded successfully!");
    } catch (error) {
      console.error("Error uploading photos:", error);
      showToast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!affiliate) return;

    const requestedAmount = parseFloat(amount);

    // Validation
    if (!requestedAmount || requestedAmount <= 0) {
      showToast.error("Please enter a valid amount");
      return;
    }

    if (requestedAmount > (affiliate.walletBalance || 0)) {
      showToast.error(`Insufficient balance. Your current balance is ৳${affiliate.walletBalance}`);
      return;
    }

    if (photos.length === 0) {
      showToast.error("Please upload at least one proof photo");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/affiliate/withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          affiliateCode: affiliate.affiliateCode,
          amount: requestedAmount,
          patientName,
          patientPhone,
          hospitalName,
          proofPhotos: photos,
          paymentMethod,
          paymentDetails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success("Withdrawal request submitted successfully!");
        router.push("/affiliate-program/dashboard");
      } else {
        showToast.error(data.error || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Error submitting withdrawal:", error);
      showToast.error("Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-gray-900"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              উইথড্র রিকোয়েস্ট
            </h1>
            <p className="text-gray-600 mt-1">
              Available Balance: ৳{(affiliate.walletBalance || 0).toLocaleString()}
            </p>
          </div>

          <Card className="p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Withdrawal Amount */}
              <div>
                <Label htmlFor="amount">
                  Withdrawal Amount (BDT) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1"
                  min="1"
                  max={affiliate.walletBalance}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ৳{(affiliate.walletBalance || 0).toLocaleString()}
                </p>
              </div>

              {/* Patient Information */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Service Details
                </h3>

                <div>
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patientPhone">Patient Phone Number *</Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hospitalName">Hospital Name *</Label>
                  <Input
                    id="hospitalName"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="Enter hospital name"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Payment Information
                </h3>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="paymentDetails">
                    Payment Details (Account Number/Bank Details) *
                  </Label>
                  <textarea
                    id="paymentDetails"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="Enter your account number, bank name, or other payment details..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Proof Photos * (Service proof, prescription, etc.)</Label>
                <div className="mt-2 space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {uploading ? "Uploading..." : "Click to upload photos"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Any image format accepted
                      </span>
                    </label>
                  </div>

                  {/* Photo Preview */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Proof ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Alert */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your withdrawal request will be reviewed by our admin team</li>
                    <li>Please provide accurate service details and proof photos</li>
                    <li>Processing may take 2-5 business days</li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/affiliate-program/dashboard")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || uploading || photos.length === 0}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Submit Withdrawal Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
