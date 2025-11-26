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
  EyeOff,
  Download,
  Menu,
  UserCircle,
  Settings,
  FileText,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  User,
  CreditCard,
  Shield,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import { FiActivity } from "react-icons/fi";
import { HiOutlineChartBar } from "react-icons/hi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
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
  id?: string;
  affiliateCode: string;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingCommissions: number;
  name?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  referrals: number;
  earnings: number;
  paymentMethod?: string;
  paymentDetails?: string;
  photo?: string;
  isActive?: boolean;
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

interface AffiliateRequest {
  _id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  hospitalName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function EnhancedAffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [requests, setRequests] = useState<AffiliateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'withdrawals' | 'profile' | 'requests'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    paymentMethod: '',
    paymentDetails: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Request form state
  const [requestForm, setRequestForm] = useState({
    patientName: '',
    patientPhone: '',
    doctorName: '',
    hospitalName: '',
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  useEffect(() => {
    const affiliateData = localStorage.getItem("affiliate");
    if (!affiliateData) {
      router.push("/affiliate-program");
      return;
    }

    try {
      const parsedData = JSON.parse(affiliateData);
      setAffiliate(parsedData);
      setProfileForm({
        fullName: parsedData.fullName || parsedData.name || '',
        email: parsedData.email || '',
        phoneNumber: parsedData.phoneNumber || '',
        paymentMethod: parsedData.paymentMethod || '',
        paymentDetails: parsedData.paymentDetails || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      fetchWalletData(parsedData.affiliateCode);
      if (parsedData.id) {
        fetchRequests(parsedData.id);
      }
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
        
        // Update affiliate wallet data
        if (data.wallet) {
          setAffiliate(prev => prev ? {
            ...prev,
            walletBalance: data.wallet.balance,
            totalEarned: data.wallet.totalEarned,
            totalWithdrawn: data.wallet.totalWithdrawn,
            pendingCommissions: data.wallet.pendingCommissions,
          } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (affiliateId: string) => {
    try {
      const response = await fetch(`/api/affiliate/request?affiliateId=${affiliateId}`);
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate?.id) return;

    setRequestSubmitting(true);
    try {
      const response = await fetch('/api/affiliate/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId: affiliate.id,
          ...requestForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success("Request submitted successfully!");
        setRequestForm({
          patientName: '',
          patientPhone: '',
          doctorName: '',
          hospitalName: '',
        });
        fetchRequests(affiliate.id);
        setActiveTab('requests');
      } else {
        showToast.error(data.error || "Failed to submit request");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setRequestSubmitting(false);
    }
  };

  const refreshData = async () => {
    if (affiliate?.affiliateCode) {
      setLoading(true);
      await fetchWalletData(affiliate.affiliateCode);
      showToast.success("Data refreshed!");
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

  const handleProfileUpdate = async () => {
    if (!affiliate) return;

    setProfileLoading(true);
    try {
      const updateData: any = {
        affiliateId: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        paymentMethod: profileForm.paymentMethod,
        paymentDetails: profileForm.paymentDetails,
      };

      // Include password change if provided
      if (changingPassword && profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          showToast.error("New passwords do not match");
          setProfileLoading(false);
          return;
        }
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await fetch('/api/affiliate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local storage and state
        const updatedAffiliate = { ...affiliate, ...result.affiliate };
        localStorage.setItem("affiliate", JSON.stringify(updatedAffiliate));
        setAffiliate(updatedAffiliate);
        setIsEditingProfile(false);
        setChangingPassword(false);
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        showToast.success("Profile updated successfully!");
      } else {
        showToast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || !affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-300 text-lg font-medium">Loading your dashboard...</p>
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
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      icon: TrendingUp,
      title: "Total Earned",
      titleBn: "মোট আয়",
      value: `৳${(affiliate.totalEarned || 0).toLocaleString()}`,
      change: "+8%",
      trend: "up",
      bgGradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Users,
      title: "Total Referrals",
      titleBn: "মোট রেফারেল",
      value: (affiliate.referrals || 0).toString(),
      change: "+5",
      trend: "up",
      bgGradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Clock,
      title: "Pending",
      titleBn: "পেন্ডিং",
      value: `৳${(affiliate.pendingCommissions || 0).toLocaleString()}`,
      change: `${commissions.filter(c => c.status === 'pending').length} items`,
      trend: "neutral",
      bgGradient: "from-orange-500 to-red-600",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-400",
    },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', labelBn: 'ওভারভিউ', icon: BarChart3 },
    { id: 'commissions', label: 'Commissions', labelBn: 'কমিশন', icon: DollarSign },
    { id: 'withdrawals', label: 'Withdrawals', labelBn: 'উত্তোলন', icon: Wallet },
    { id: 'requests', label: 'Requests', labelBn: 'রিকোয়েস্ট', icon: FileText },
    { id: 'profile', label: 'Profile', labelBn: 'প্রোফাইল', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-cyan-500/30">
                  {(affiliate.fullName || affiliate.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    স্বাগতম, {affiliate.fullName || affiliate.name}!
                  </h1>
                  <p className="text-cyan-300">{affiliate.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active Affiliate
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.labelBn}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
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
                        <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group">
                          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                          
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex-1">
                              <p className="text-sm text-gray-400 mb-1 font-medium">
                                {stat.titleBn}
                              </p>
                              <p className="text-3xl font-bold text-white mb-2">
                                {stat.value}
                              </p>
                              <div className="flex items-center gap-1 text-sm">
                                <TrendIcon className={`h-4 w-4 ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`} />
                                <span className={`${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'} font-medium`}>
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
                    <Card className="p-6 h-full bg-white/5 backdrop-blur-xl border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <HiOutlineChartBar className="h-6 w-6 text-cyan-400" />
                            Earnings Overview
                          </h3>
                          <p className="text-sm text-gray-400">Monthly commission trends</p>
                        </div>
                      </div>
                      
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                            formatter={(value: any) => `৳${value.toLocaleString()}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="#06b6d4" 
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
                    <Card className="p-6 h-full bg-white/5 backdrop-blur-xl border-white/10">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <FiActivity className="h-5 w-5 text-cyan-400" />
                          Commission Status
                        </h3>
                        <p className="text-sm text-gray-400">Breakdown by status</p>
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
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </motion.div>
                </div>

                {/* Affiliate Code & Withdrawal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Affiliate Code */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/20 h-full backdrop-blur-xl">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-cyan-400" />
                        Your Affiliate Code
                      </h3>
                      
                      <div className="bg-white/5 rounded-xl p-4 mb-4 border border-cyan-500/30">
                        <div className="flex items-center justify-between">
                          <code className="text-3xl font-bold text-cyan-400 tracking-wider">
                            {affiliate.affiliateCode}
                          </code>
                          <button
                            onClick={copyAffiliateCode}
                            className="p-3 hover:bg-cyan-500/10 rounded-lg transition-colors"
                          >
                            <Copy className="h-5 w-5 text-cyan-400" />
                          </button>
                        </div>
                      </div>
                      
                      <Button
                        onClick={copyReferralLink}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
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
                    <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-500/20 h-full backdrop-blur-xl">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-emerald-400" />
                        Request Withdrawal
                      </h3>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Available Balance</p>
                        <p className="text-4xl font-bold text-emerald-400">
                          ৳{(affiliate.walletBalance || 0).toLocaleString()}
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => router.push('/affiliate-program/withdrawal')}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
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
              </motion.div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
              <motion.div
                key="commissions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-cyan-400" />
                      Commission History
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Patient</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-300">Bill</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-300">Commission</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-500">
                              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No commission records yet</p>
                            </td>
                          </tr>
                        ) : (
                          commissions.map((commission) => (
                            <tr key={commission._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-4 px-4 text-sm text-gray-400">
                                {format(new Date(commission.createdAt), 'MMM dd, yyyy')}
                              </td>
                              <td className="py-4 px-4 text-sm text-white">
                                {commission.appointmentId?.patientName || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-right text-white">
                                ৳{commission.totalBill.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 text-sm text-right font-medium text-emerald-400">
                                ৳{commission.commissionAmount.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  commission.status === 'approved' || commission.status === 'paid'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
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
                </Card>
              </motion.div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
              <motion.div
                key="withdrawals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Wallet className="h-6 w-6 text-cyan-400" />
                      Withdrawal History
                    </h3>
                    <Button
                      onClick={() => router.push('/affiliate-program/withdrawal')}
                      className="bg-gradient-to-r from-emerald-500 to-green-600"
                      disabled={(affiliate.walletBalance || 0) === 0}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      New Withdrawal
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Date</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-300">Amount</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-300">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-300">Processed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-gray-500">
                              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>No withdrawal requests yet</p>
                            </td>
                          </tr>
                        ) : (
                          withdrawals.map((withdrawal) => (
                            <tr key={withdrawal._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-4 px-4 text-sm text-gray-400">
                                {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy')}
                              </td>
                              <td className="py-4 px-4 text-sm text-right font-medium text-white">
                                ৳{withdrawal.amount.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  withdrawal.status === 'approved'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : withdrawal.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
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
                              <td className="py-4 px-4 text-sm text-gray-400">
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
                </Card>
              </motion.div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Request Form */}
                  <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-1 h-fit">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <FileText className="h-6 w-6 text-cyan-400" />
                      Submit New Request
                    </h3>
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Patient Name</Label>
                        <Input
                          required
                          value={requestForm.patientName}
                          onChange={(e) => setRequestForm({...requestForm, patientName: e.target.value})}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Enter patient name"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Patient Phone</Label>
                        <Input
                          required
                          value={requestForm.patientPhone}
                          onChange={(e) => setRequestForm({...requestForm, patientPhone: e.target.value})}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Doctor Name</Label>
                        <Input
                          required
                          value={requestForm.doctorName}
                          onChange={(e) => setRequestForm({...requestForm, doctorName: e.target.value})}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Enter doctor name"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Hospital Name</Label>
                        <Input
                          required
                          value={requestForm.hospitalName}
                          onChange={(e) => setRequestForm({...requestForm, hospitalName: e.target.value})}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Enter hospital name"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 mt-4"
                        disabled={requestSubmitting}
                      >
                        {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>
                  </Card>

                  {/* Requests List */}
                  <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-6">Request History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Patient</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-300">Doctor/Hospital</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-300">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No requests submitted yet</p>
                              </td>
                            </tr>
                          ) : (
                            requests.map((req) => (
                              <tr key={req._id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-4 px-4 text-sm text-gray-400">
                                  {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-4 px-4 text-sm text-white">
                                  <div className="font-medium">{req.patientName}</div>
                                  <div className="text-xs text-gray-500">{req.patientPhone}</div>
                                </td>
                                <td className="py-4 px-4 text-sm text-white">
                                  <div className="font-medium">{req.doctorName}</div>
                                  <div className="text-xs text-gray-500">{req.hospitalName}</div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                    req.status === 'approved'
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : req.status === 'rejected'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  }`}>
                                    {req.status}
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
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <UserCircle className="h-6 w-6 text-cyan-400" />
                      Profile Settings
                    </h3>
                    {!isEditingProfile ? (
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setIsEditingProfile(false);
                            setChangingPassword(false);
                            setProfileForm({
                              fullName: affiliate.fullName || affiliate.name || '',
                              email: affiliate.email || '',
                              phoneNumber: affiliate.phoneNumber || '',
                              paymentMethod: affiliate.paymentMethod || '',
                              paymentDetails: affiliate.paymentDetails || '',
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                          }}
                          variant="outline"
                          className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10 bg-transparent"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleProfileUpdate}
                          disabled={profileLoading}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600"
                        >
                          {profileLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-cyan-400" />
                        Personal Information
                      </h4>
                      
                      <div>
                        <Label className="text-gray-400 mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white text-lg">{affiliate.fullName || affiliate.name}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-400 mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        {isEditingProfile ? (
                          <Input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white text-lg">{affiliate.email}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-400 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileForm.phoneNumber}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white text-lg">{affiliate.phoneNumber}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-400 mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Affiliate Code
                        </Label>
                        <div className="flex items-center gap-2">
                          <p className="text-cyan-400 text-lg font-bold">{affiliate.affiliateCode}</p>
                          <button
                            onClick={copyAffiliateCode}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <Copy className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment & Security */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-cyan-400" />
                        Payment Settings
                      </h4>

                      <div>
                        <Label className="text-gray-400 mb-2">Payment Method</Label>
                        {isEditingProfile ? (
                          <Select
                            value={profileForm.paymentMethod}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white w-full"
                          >
                            <option value="" className="bg-slate-900">Select payment method</option>
                            <option value="bkash" className="bg-slate-900">bKash</option>
                            <option value="nagad" className="bg-slate-900">Nagad</option>
                            <option value="rocket" className="bg-slate-900">Rocket</option>
                            <option value="bank" className="bg-slate-900">Bank Transfer</option>
                          </Select>
                        ) : (
                          <p className="text-white text-lg capitalize">{affiliate.paymentMethod || 'Not set'}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-400 mb-2">Payment Details (Account Number)</Label>
                        {isEditingProfile ? (
                          <Input
                            value={profileForm.paymentDetails}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, paymentDetails: e.target.value }))}
                            placeholder="Enter account/phone number"
                            className="bg-white/5 border-white/10 text-white"
                          />
                        ) : (
                          <p className="text-white text-lg">{affiliate.paymentDetails || 'Not set'}</p>
                        )}
                      </div>

                      {/* Password Change Section */}
                      {isEditingProfile && (
                        <div className="pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Shield className="h-5 w-5 text-cyan-400" />
                              Change Password
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setChangingPassword(!changingPassword)}
                              className="text-gray-400 hover:text-white"
                            >
                              {changingPassword ? 'Cancel' : 'Change'}
                            </Button>
                          </div>

                          {changingPassword && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-gray-400 mb-2">Current Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={profileForm.currentPassword}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="bg-white/5 border-white/10 text-white pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                  >
                                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-gray-400 mb-2">New Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={profileForm.newPassword}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="bg-white/5 border-white/10 text-white pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                  >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <Label className="text-gray-400 mb-2">Confirm New Password</Label>
                                <div className="relative">
                                  <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={profileForm.confirmPassword}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="bg-white/5 border-white/10 text-white pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-cyan-400" />
                      Account Statistics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-400">৳{(affiliate.totalEarned || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Total Earned</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-cyan-400">৳{(affiliate.walletBalance || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Current Balance</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-purple-400">{affiliate.referrals || 0}</p>
                        <p className="text-sm text-gray-400">Total Referrals</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-blue-400">৳{(affiliate.totalWithdrawn || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-400">Total Withdrawn</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
