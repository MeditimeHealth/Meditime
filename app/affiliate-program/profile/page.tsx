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
  User,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Wallet,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

interface Affiliate {
  affiliateCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingCommissions: number;
  paymentMethod?: string;
  paymentDetails?: string;
}

interface Commission {
  _id: string;
  commissionAmount: number;
  totalBill: number;
  commissionType: string;
  commissionValue: number;
  status: string;
  createdAt: string;
  approvedAt?: string;
  appointmentId?: {
    patientName: string;
    appointmentDate: string;
  };
}

export default function AffiliateProfilePage() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [paidCommissions, setPaidCommissions] = useState<Commission[]>([]);
  const [unpaidCommissions, setUnpaidCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const affiliateData = localStorage.getItem("affiliate");
    if (!affiliateData) {
      router.push("/affiliate-program");
      return;
    }

    try {
      const parsedData = JSON.parse(affiliateData);
      setAffiliate(parsedData);
      fetchCommissions(parsedData.affiliateCode);
    } catch (error) {
      console.error("Error parsing affiliate data:", error);
      router.push("/affiliate-program");
    }
  }, [router]);

  const fetchCommissions = async (code: string) => {
    try {
      const response = await fetch(`/api/affiliate/wallet?affiliateCode=${code}`);
      const data = await response.json();

      if (response.ok) {
        const paid = data.commissions?.filter(
          (c: Commission) => c.status === "approved" || c.status === "paid"
        ) || [];
        const unpaid = data.commissions?.filter(
          (c: Commission) => c.status === "pending"
        ) || [];

        setPaidCommissions(paid);
        setUnpaidCommissions(unpaid);
      }
    } catch (error) {
      console.error("Error fetching commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: Commission[], filename: string) => {
    const headers = ["Date", "Patient", "Bill Amount", "Commission", "Type", "Status"];
    const rows = data.map((c) => [
      format(new Date(c.createdAt), "yyyy-MM-dd"),
      c.appointmentId?.patientName || "N/A",
      c.totalBill,
      c.commissionAmount,
      c.commissionType === "percentage" ? `${c.commissionValue}%` : `৳${c.commissionValue}`,
      c.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalUnpaid = unpaidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account and view reports</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="text-xl font-bold text-gray-900">
                    ৳{affiliate.walletBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-xl font-bold text-gray-900">৳{totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-gray-900">৳{totalUnpaid.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-xl font-bold text-gray-900">
                    ৳{affiliate.totalEarned.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Account Information */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                <Edit className="h-4 w-4 mr-2" />
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="flex items-center gap-2 text-gray-700 mb-2">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                {editing ? (
                  <Input value={affiliate.name} disabled className="bg-gray-50" />
                ) : (
                  <p className="text-gray-900 font-medium">{affiliate.name}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {editing ? (
                  <Input value={affiliate.email} disabled className="bg-gray-50" />
                ) : (
                  <p className="text-gray-900 font-medium">{affiliate.email}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {editing ? (
                  <Input value={affiliate.phoneNumber} disabled className="bg-gray-50" />
                ) : (
                  <p className="text-gray-900 font-medium">{affiliate.phoneNumber}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4" />
                  Affiliate Code
                </Label>
                <p className="text-gray-900 font-bold text-lg">{affiliate.affiliateCode}</p>
              </div>

              {affiliate.paymentMethod && (
                <>
                  <div>
                    <Label className="text-gray-700 mb-2">Payment Method</Label>
                    <p className="text-gray-900 font-medium">{affiliate.paymentMethod}</p>
                  </div>

                  <div>
                    <Label className="text-gray-700 mb-2">Payment Details</Label>
                    <p className="text-gray-900 font-medium">{affiliate.paymentDetails}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Paid Commissions */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Paid Commissions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Total: ৳{totalPaid.toLocaleString()} ({paidCommissions.length} transactions)
                </p>
              </div>
              {paidCommissions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(paidCommissions, `paid-commissions-${new Date().toISOString().split('T')[0]}.csv`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bill</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Commission</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {paidCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No paid commissions yet
                      </td>
                    </tr>
                  ) : (
                    paidCommissions.map((commission) => (
                      <tr key={commission._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(commission.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {commission.appointmentId?.patientName || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">
                          ৳{commission.totalBill.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                          ৳{commission.commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs text-gray-600">
                            {commission.commissionType === "percentage"
                              ? `${commission.commissionValue}%`
                              : `৳${commission.commissionValue}`}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Unpaid/Pending Commissions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Commissions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Expected: ৳{totalUnpaid.toLocaleString()} ({unpaidCommissions.length} pending)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bill</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Expected</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
                        No pending commissions
                      </td>
                    </tr>
                  ) : (
                    unpaidCommissions.map((commission) => (
                      <tr key={commission._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {format(new Date(commission.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {commission.appointmentId?.patientName || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-900">
                          ৳{commission.totalBill.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium text-orange-600">
                          ৳{commission.commissionAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            <Clock className="h-3 w-3" />
                            Pending Approval
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
