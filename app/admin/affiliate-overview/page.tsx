"use client";

import { useEffect, useState } from "react";
import { Users, Wallet, DollarSign, TrendingUp, RefreshCw, Image as ImageIcon, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";
import Link from "next/link";

interface Affiliate {
  _id: string;
  fullName?: string;
  name?: string;
  email: string;
  phoneNumber: string;
  affiliateCode: string;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingCommissions: number;
  referrals: number;
  isActive: boolean;
}

interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalBalance: number;
  totalEarned: number;
  totalPending: number;
}

export default function AffiliateOverviewPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [addingFunds, setAddingFunds] = useState(false);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch("/api/admin/affiliates/overview");
      const data = await response.json();
      if (response.ok) {
        setAffiliates(data.affiliates || []);
        setStats(data.stats || null);
      } else {
        showToast.error(data.error || "Failed to fetch affiliates");
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      showToast.error("Failed to fetch affiliates");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFundsClick = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setAmount("");
    setNotes("");
    setAddFundsDialogOpen(true);
  };

  const handleAddFunds = async () => {
    if (!selectedAffiliate || !amount) {
      showToast.error("Please enter an amount");
      return;
    }

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      showToast.error("Please enter a valid amount");
      return;
    }

    setAddingFunds(true);
    try {
      const response = await fetch("/api/admin/affiliates/add-funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateId: selectedAffiliate._id,
          amount: addAmount,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(`Successfully added ৳${addAmount.toLocaleString()} to ${selectedAffiliate.fullName || selectedAffiliate.name}'s wallet`);
        setAddFundsDialogOpen(false);
        setSelectedAffiliate(null);
        setAmount("");
        setNotes("");
        fetchAffiliates(); // Refresh the list
      } else {
        showToast.error(data.error || "Failed to add funds");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      showToast.error("An error occurred");
    } finally {
      setAddingFunds(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Overview</h1>
          <p className="text-sm text-gray-500 mt-1">View all affiliates and their balances</p>
        </div>
        <Button onClick={fetchAffiliates} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Affiliates</p>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalAffiliates}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Affiliates</p>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeAffiliates}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Balance</p>
              <Wallet className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">৳{stats.totalBalance.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Earned</p>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">৳{stats.totalEarned.toLocaleString()}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Pending</p>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">৳{stats.totalPending.toLocaleString()}</p>
          </Card>
        </div>
      )}

      {/* Affiliates Table */}
      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Affiliates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Affiliate</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Code</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Contact</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Balance</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Total Earned</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Withdrawn</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Pending</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Referrals</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No affiliates found</p>
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => (
                  <tr key={affiliate._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium text-gray-900">
                        {affiliate.fullName || affiliate.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{affiliate.email}</div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <code className="text-cyan-600 font-mono font-semibold">
                        {affiliate.affiliateCode}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {affiliate.phoneNumber}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-emerald-600">
                      ৳{(affiliate.walletBalance || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-900">
                      ৳{(affiliate.totalEarned || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-600">
                      ৳{(affiliate.totalWithdrawn || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-orange-600">
                      ৳{(affiliate.pendingCommissions || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-900">
                      {affiliate.referrals || 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          affiliate.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {affiliate.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Button
                        onClick={() => handleAddFundsClick(affiliate)}
                        size="sm"
                        variant="outline"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Funds
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Affiliate Wallet</DialogTitle>
          </DialogHeader>
          {selectedAffiliate && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Affiliate</p>
                <p className="font-medium text-gray-900">
                  {selectedAffiliate.fullName || selectedAffiliate.name}
                </p>
                <p className="text-sm text-gray-500">{selectedAffiliate.affiliateCode}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Current Balance: <span className="font-semibold text-emerald-600">৳{(selectedAffiliate.walletBalance || 0).toLocaleString()}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount (৳) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to add"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note about this transaction"
                  className="mt-1"
                />
              </div>

              {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    New Balance: <span className="font-semibold text-emerald-600">
                      ৳{((selectedAffiliate.walletBalance || 0) + parseFloat(amount)).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setAddFundsDialogOpen(false);
                    setSelectedAffiliate(null);
                    setAmount("");
                    setNotes("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFunds}
                  disabled={addingFunds || !amount || parseFloat(amount) <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {addingFunds ? "Adding..." : "Add Funds"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/affiliate-photo-requests">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Photo Requests</h3>
                <p className="text-sm text-gray-500">Review pending requests</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/affiliate-management">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Requests</h3>
                <p className="text-sm text-gray-500">All affiliate requests</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/affiliate-commissions">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Commissions</h3>
                <p className="text-sm text-gray-500">View commission history</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
