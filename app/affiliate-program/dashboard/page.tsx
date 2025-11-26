"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  LogOut,
  Copy,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Wallet,
  Eye,
  Download,
  Menu,
  UserCircle,
  Settings,
  FileText,
} from "lucide-react";
import { FiActivity } from "react-icons/fi";
import { HiOutlineChartBar } from "react-icons/hi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { showToast } from "@/lib/toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface Affiliate {
  affiliateCode: string;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingCommissions: number;
  name: string;
  email: string;
  referrals: number;
  earnings: number;
}

interface Commission {
  _id: string;
  commissionAmount: number;
  status: string;
  createdAt: string;
  totalBill: number;
  commissionType: string;
  appointmentId?: {
    patientName: string;
    appointmentDate: string;
  };
}

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  createdAt: string;
  processedAt?: string;
}

export default function EnhancedAffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals' | 'overview'>('overview');
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
      fetchWalletData(parsedData.affiliateCode);
    } catch (error) {
      console.error("Error parsing affiliate data:", error);
      localStorage.removeItem("affiliate");
      router.push("/affiliate-program");
    }
  }, [router]);

  const fetchWalletData = async (code: string) => {
    try {
      const response = await fetch(`/api/affiliate/wallet?affiliateCode=${code}`);
      const data = await response.json();
      
      if (response.ok) {
        setCommissions(data.commissions || []);
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate");
    showToast.success("Successfully logged out!");
    router.push("/affiliate-program");
  };

  const copyAffiliateCode = () => {
    if (affiliate?.affiliateCode) {
      navigator.clipboard.writeText(affiliate.affiliateCode);
      showToast.success("Affiliate code copied!");
    }
  };

  const copyReferralLink = () => {
    if (affiliate?.affiliateCode) {
      const referralLink = `${window.location.origin}?ref=${affiliate.affiliateCode}`;
      navigator.clipboard.writeText(referralLink);
      showToast.success("Referral link copied!");
    }
  };

  if (loading || !affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const monthlyData = commissions
    .filter(c => c.status === 'approved' || c.status === 'paid')
    .reduce((acc: any[], commission) => {
      const month = format(new Date(commission.createdAt), 'MMM');
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += commission.commissionAmount;
      } else {
        acc.push({ month, amount: commission.commissionAmount });
      }
      return acc;
    }, []);

  const statusData = [
    { name: 'Approved', value: commissions.filter(c => c.status === 'approved').length, color: '#10b981' },
    { name: 'Pending', value: commissions.filter(c => c.status === 'pending').length, color: '#f59e0b' },
    { name: 'Paid', value: commissions.filter(c => c.status === 'paid').length, color: '#3b82f6' },
  ];

  const stats = [
    {
      icon: Wallet,
      title: "Available Balance",
      titleBn: "উপলব্ধ ব্যালেন্স",
      value: `৳${(affiliate.walletBalance || 0).toLocaleString()}`,
      change: "+12%",
      trend: "up",
      bgGradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: TrendingUp,
      title: "Total Earned",
      titleBn: "মোট আয়",
      value: `৳${(affiliate.totalEarned || 0).toLocaleString()}`,
      change: "+8%",
      trend: "up",
      bgGradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Users,
      title: "Total Referrals",
      titleBn: "মোট রেফারেল",
      value: affiliate.referrals.toString(),
      change: "+5",
      trend: "up",
      bgGradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Pending",
      titleBn: "পেন্ডিং",
      value: `৳${(affiliate.pendingCommissions || 0).toLocaleString()}`,
      change: "3 items",
      trend: "neutral",
      bgGradient: "from-orange-500 to-red-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      <div className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl">
                    {affiliate.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Welcome back, {affiliate.name}!
                    </h1>
                    <p className="text-gray-600">{affiliate.email}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              const TrendIcon = stat.trend === "up" ? ArrowUpRight : stat.trend === "down" ? ArrowDownRight : Clock;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 border-none bg-white relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1 font-medium">
                          {stat.titleBn}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendIcon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
                          <span className={`${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'} font-medium`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`h-14 w-14 rounded-2xl ${stat.iconBg} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`h-7 w-7 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Earnings Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <HiOutlineChartBar className="h-6 w-6 text-primary" />
                      Earnings Overview
                    </h3>
                    <p className="text-sm text-gray-600">Monthly commission trends</p>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: any) => `৳${value.toLocaleString()}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Status Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 h-full">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiActivity className="h-5 w-5 text-primary" />
                    Commission Status
                  </h3>
                  <p className="text-sm text-gray-600">Breakdown by status</p>
                </div>
                
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Affiliate Code & Withdrawal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Affiliate Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 h-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Your Affiliate Code
                </h3>
                
                <div className="bg-white rounded-xl p-4 mb-4 border-2 border-primary/30">
                  <div className="flex items-center justify-between">
                    <code className="text-3xl font-bold text-primary tracking-wider">
                      {affiliate.affiliateCode}
                    </code>
                    <button
                      onClick={copyAffiliateCode}
                      className="p-3 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Copy className="h-5 w-5 text-primary" />
                    </button>
                  </div>
                </div>
                
                <Button
                  onClick={copyReferralLink}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Referral Link
                </Button>
              </Card>
            </motion.div>

            {/* Withdrawal CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 h-full">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Request Withdrawal
                </h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                  <p className="text-4xl font-bold text-green-600">
                    ৳{(affiliate.walletBalance || 0).toLocaleString()}
                  </p>
                </div>
                
                <Button
                  onClick={() => router.push('/affiliate-program/withdrawal')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  disabled={(affiliate.walletBalance || 0) === 0}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Withdrawal
                </Button>
                
                {(affiliate.walletBalance || 0) === 0 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    No balance available for withdrawal
                  </p>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'overview' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('overview')}
                    size="sm"
                  >
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === 'commissions' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('commissions')}
                    size="sm"
                  >
                    Commissions
                  </Button>
                  <Button
                    variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('withdrawals')}
                    size="sm"
                  >
                    Withdrawals
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'commissions' && (
                  <motion.div
                    key="commissions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Bill</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Commission</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-gray-500">
                                No commission records yet
                              </td>
                            </tr>
                          ) : (
                            commissions.slice(0, 10).map((commission) => (
                              <tr key={commission._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {format(new Date(commission.createdAt), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {commission.appointmentId?.patientName || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-gray-900">
                                  ৳{commission.totalBill.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                                  ৳{commission.commissionAmount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                    commission.status === 'approved' || commission.status === 'paid'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {commission.status === 'approved' || commission.status === 'paid' ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                    {commission.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'withdrawals' && (
                  <motion.div
                    key="withdrawals"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Processed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-gray-500">
                                No withdrawal requests yet
                              </td>
                            </tr>
                          ) : (
                            withdrawals.slice(0, 10).map((withdrawal) => (
                              <tr key={withdrawal._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                                  ৳{withdrawal.amount.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                    withdrawal.status === 'approved'
                                      ? 'bg-green-100 text-green-700'
                                      : withdrawal.status === 'rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {withdrawal.status === 'approved' ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : withdrawal.status === 'rejected' ? (
                                      <XCircle className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                    {withdrawal.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {withdrawal.processedAt 
                                    ? format(new Date(withdrawal.processedAt), 'MMM dd, yyyy')
                                    : '-'
                                  }
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    <div className="text-center p-6 bg-green-50 rounded-xl">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {commissions.filter(c => c.status === 'approved' || c.status === 'paid').length}
                      </p>
                      <p className="text-sm text-gray-600">Approved Commissions</p>
                    </div>

                    <div className="text-center p-6 bg-orange-50 rounded-xl">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {commissions.filter(c => c.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600">Pending Commissions</p>
                    </div>

                    <div className="text-center p-6 bg-blue-50 rounded-xl">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {withdrawals.filter(w => w.status === 'approved').length}
                      </p>
                      <p className="text-sm text-gray-600">Completed Withdrawals</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
