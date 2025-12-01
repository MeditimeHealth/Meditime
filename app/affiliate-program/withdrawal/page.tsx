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
  const [notes, setNotes] = useState("");

  // Fetch latest wallet balance from server to avoid stale localStorage data
  const fetchWalletData = async (code: string, baseAffiliate: Affiliate) => {
    try {
      const response = await fetch(`/api/affiliate/wallet?affiliateCode=${code}`);
      const data = await response.json();

      if (response.ok && data.wallet) {
        const updatedAffiliate: Affiliate = {
          ...baseAffiliate,
          walletBalance: data.wallet.balance || 0,
        };

        setAffiliate(updatedAffiliate);
        // Keep localStorage in sync so other pages see the correct balance
        localStorage.setItem("affiliate", JSON.stringify(updatedAffiliate));
      } else {
        // If wallet API fails, at least keep the basic affiliate info
        setAffiliate(baseAffiliate);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setAffiliate(baseAffiliate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if affiliate is logged in
    const affiliateData = localStorage.getItem("affiliate");
    if (!affiliateData) {
      router.push("/affiliate-program");
      return;
    }

    try {
      const parsedData = JSON.parse(affiliateData);
      // Always use latest wallet balance from backend if possible
      if (parsedData.affiliateCode) {
        fetchWalletData(parsedData.affiliateCode, parsedData);
      } else {
        setAffiliate(parsedData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing affiliate data:", error);
      localStorage.removeItem("affiliate");
      router.push("/affiliate-program");
    }
  }, [router]);

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
          notes,
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

              {/* Notes */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h3 className="font-semibold text-gray-900">
                  Additional Notes (Optional)
                </h3>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for the admin (optional)..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              {/* Info Alert */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your withdrawal request will be reviewed by our admin team</li>
                    <li>The requested amount will be deducted from your wallet immediately after submitting the request</li>
                    <li>You can only request up to your current wallet balance</li>
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
                  disabled={submitting}
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
