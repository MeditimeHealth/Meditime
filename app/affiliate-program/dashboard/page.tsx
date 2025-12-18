"use client";

import { useEffect, useState, useCallback } from "react";
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
  Filter,
  TrendingDown as TrendingDownIcon,
  Upload,
  Image as ImageIcon,
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
  proofPhoto?: string;
  proofPhotos?: string[];
  appointmentId?: string;
  commissionAmount?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface ReferralPatient {
  _id: string;
  serialNumber?: string;
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'old' | 'new' | 'report';
  chamberName: string;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  doctorId?: {
    name: string;
    qualification: string;
    department?: string;
    hospital?: string;
  };
}

interface ReferralStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export default function EnhancedAffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [requests, setRequests] = useState<AffiliateRequest[]>([]);
  const [referralPatients, setReferralPatients] = useState<ReferralPatient[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportType, setReportType] = useState<'all' | 'monthly' | 'daily' | 'pending' | 'paid'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'commissions' | 'withdrawals' | 'profile' | 'requests' | 'reports' | 'referrals'>('overview');
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

  // Photo upload state for referral patients
  const [selectedPatient, setSelectedPatient] = useState<ReferralPatient | null>(null);
  const [photoUploadDialogOpen, setPhotoUploadDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUploadForm, setPhotoUploadForm] = useState({
    doctorName: '',
    hospitalName: '',
  });

  // Hospital search state
  const [hospitalSearchRequest, setHospitalSearchRequest] = useState('');
  const [hospitalSearchPhoto, setHospitalSearchPhoto] = useState('');
  const [showHospitalDropdownRequest, setShowHospitalDropdownRequest] = useState(false);
  const [showHospitalDropdownPhoto, setShowHospitalDropdownPhoto] = useState(false);

  // Common hospital list
  const hospitals = [
    'Square Hospital',
    'United Hospital',
    'Apollo Hospital',
    'Labaid Hospital',
    'Popular Diagnostic Centre',
    'Ibn Sina Hospital',
    'Evercare Hospital',
    'Bangladesh Medical College Hospital',
    'Holy Family Red Crescent Hospital',
    'National Heart Foundation',
    'Dhaka Medical College Hospital',
    'Bangabandhu Sheikh Mujib Medical University',
    'Birdem General Hospital',
    'Ad-Din Hospital',
    'Islami Bank Hospital',
    'Delta Medical College Hospital',
    'Anwar Khan Modern Hospital',
    'Central Hospital',
    'Green Life Hospital',
    'Japan Bangladesh Friendship Hospital',
  ];

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

  const fetchReferralPatients = async (affiliateCode: string) => {
    setReferralLoading(true);
    try {
      const response = await fetch(`/api/affiliate/referrals?affiliateCode=${affiliateCode}`);
      const data = await response.json();
      if (response.ok) {
        setReferralPatients(data.appointments || []);
        setReferralStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching referral patients:', error);
    } finally {
      setReferralLoading(false);
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

  const hasProofBeenSent = (patientId: string) => {
    return requests.some(req => 
      req.appointmentId === patientId && 
      (req.proofPhoto || (req.proofPhotos && req.proofPhotos.length > 0))
    );
  };

  const getRequestStatus = (patientId: string) => {
    const request = requests.find(req => req.appointmentId === patientId);
    return request ? request.status : null;
  };

  const handlePatientClick = (patient: ReferralPatient) => {
    // Don't open dialog if proof already sent
    if (hasProofBeenSent(patient._id)) {
      return;
    }
    setSelectedPatient(patient);
    setPhotoUploadForm({
      doctorName: patient.doctorId?.name || '',
      hospitalName: patient.chamberName || '',
    });
    setPhotoUploadDialogOpen(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast.error(`${file.name} is larger than 10MB`);
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === validFiles.length) {
          setPhotoPreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedPhotos([...selectedPhotos, ...validFiles]);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async () => {
    if (selectedPhotos.length === 0 || !selectedPatient || !affiliate?.id) {
      showToast.error('Please select at least one photo');
      return;
    }

    if (!photoUploadForm.doctorName || !photoUploadForm.hospitalName) {
      showToast.error('Please fill in doctor and hospital name');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Upload all photos to imgbb
      const uploadPromises = selectedPhotos.map(async (photo) => {
        const formData = new FormData();
        formData.append('image', photo);

        const uploadResponse = await fetch('/api/upload/imgbb', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Failed to upload photo');
        }

        return uploadData.url;
      });

      const photoUrls = await Promise.all(uploadPromises);

      // Create request with photos
      const response = await fetch('/api/affiliate/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliateId: affiliate.id,
          patientName: selectedPatient.patientName,
          patientPhone: selectedPatient.mobileNumber,
          doctorName: photoUploadForm.doctorName,
          hospitalName: photoUploadForm.hospitalName,
          proofPhotos: photoUrls,
          appointmentId: selectedPatient._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success("Photos submitted successfully!");
        setPhotoUploadDialogOpen(false);
        setSelectedPhotos([]);
        setPhotoPreviews([]);
        setSelectedPatient(null);
        setPhotoUploadForm({ doctorName: '', hospitalName: '' });
        fetchRequests(affiliate.id);
      } else {
        showToast.error(data.error || "Failed to submit photos");
      }
    } catch (error: any) {
      showToast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const refreshData = async () => {
    if (affiliate?.affiliateCode) {
      setLoading(true);
      await fetchWalletData(affiliate.affiliateCode);
      if (activeTab === 'reports') {
        await fetchReports();
      }
      if (activeTab === 'referrals') {
        await fetchReferralPatients(affiliate.affiliateCode);
      }
      showToast.success("Data refreshed!");
    }
  };

  const fetchReports = useCallback(async () => {
    if (!affiliate?.affiliateCode) return;
    
    setReportsLoading(true);
    try {
      const params = new URLSearchParams({
        affiliateCode: affiliate.affiliateCode,
        type: reportType,
      });
      
      if (reportType === 'monthly') {
        params.append('month', selectedMonth.toString());
        params.append('year', selectedYear.toString());
      }
      
      const response = await fetch(`/api/affiliate/reports?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setReports(data);
      } else {
        showToast.error(data.error || "Failed to fetch reports");
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast.error("Failed to fetch reports");
    } finally {
      setReportsLoading(false);
    }
  }, [affiliate?.affiliateCode, reportType, selectedMonth, selectedYear]);

  useEffect(() => {
    if (activeTab === 'reports' && affiliate?.affiliateCode) {
      fetchReports();
    }
  }, [activeTab, fetchReports, affiliate?.affiliateCode]);

  useEffect(() => {
    if (activeTab === 'referrals' && affiliate?.affiliateCode) {
      fetchReferralPatients(affiliate.affiliateCode);
      // Also fetch requests to check which patients have proof sent
      if (affiliate.id) {
        fetchRequests(affiliate.id);
      }
      
      // Auto-refresh every 30 seconds when on referrals tab
      const interval = setInterval(() => {
        fetchReferralPatients(affiliate.affiliateCode);
        if (affiliate.id) {
          fetchRequests(affiliate.id);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [activeTab, affiliate?.affiliateCode, affiliate?.id]);

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
    { id: 'referrals', label: 'Referral Patients', labelBn: 'রেফারেল রোগী', icon: Users },
    { id: 'commissions', label: 'Commissions', labelBn: 'কমিশন', icon: DollarSign },
    { id: 'withdrawals', label: 'Withdrawals', labelBn: 'উত্তোলন', icon: Wallet },
    { id: 'reports', label: 'Reports', labelBn: 'রিপোর্ট', icon: FileText },
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-3 lg:gap-4 w-full lg:w-auto">
                <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-lg shadow-cyan-500/30">
                  {(affiliate.fullName || affiliate.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    স্বাগতম, {affiliate.fullName || affiliate.name}!
                  </h1>
                  <p className="text-cyan-300 text-sm lg:text-base truncate">{affiliate.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active Affiliate
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
                <Button
                  onClick={refreshData}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent flex-1 lg:flex-none text-sm lg:text-base"
                >
                  <RefreshCw className="h-4 w-4 lg:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent flex-1 lg:flex-none text-sm lg:text-base"
                >
                  <LogOut className="h-4 w-4 lg:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
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
            <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto scrollbar-hide">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{item.labelBn}</span>
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
                    <Card className="p-4 sm:p-6 h-full bg-white/5 backdrop-blur-xl border-white/10">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                            <HiOutlineChartBar className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                            <span className="hidden sm:inline">Earnings Overview</span>
                            <span className="sm:hidden">Earnings</span>
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-400">Monthly commission trends</p>
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
                    <Card className="p-4 sm:p-6 h-full bg-white/5 backdrop-blur-xl border-white/10">
                      <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                          <FiActivity className="h-5 w-5 text-cyan-400" />
                          <span className="hidden sm:inline">Commission Status</span>
                          <span className="sm:hidden">Status</span>
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">Breakdown by status</p>
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

            {/* Referral Patients Tab */}
            {activeTab === 'referrals' && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Referral Stats Cards */}
                {referralStats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-500/20">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-blue-400">{referralStats.total}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">মোট রোগী</p>
                      </div>
                    </Card>
                    <Card className="p-3 sm:p-4 bg-gradient-to-br from-orange-500/10 to-amber-600/10 border-orange-500/20">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-orange-400">{referralStats.pending}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">পেন্ডিং</p>
                      </div>
                    </Card>
                    <Card className="p-3 sm:p-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/20">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-cyan-400">{referralStats.confirmed}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">কনফার্মড</p>
                      </div>
                    </Card>
                    <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-green-400">{referralStats.completed}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">সম্পন্ন</p>
                      </div>
                    </Card>
                    <Card className="p-3 sm:p-4 bg-gradient-to-br from-red-500/10 to-rose-600/10 border-red-500/20">
                      <div className="text-center">
                        <p className="text-xl sm:text-2xl font-bold text-red-400">{referralStats.cancelled}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400">বাতিল</p>
                      </div>
                    </Card>
                  </div>
                )}

                <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-1">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                        রেফারেল রোগী তালিকা
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        আপনার রেফারেল কোড ব্যবহার করে বুক করা রোগীদের তথ্য
                      </p>
                    </div>
                    <Button
                      onClick={() => affiliate?.affiliateCode && fetchReferralPatients(affiliate.affiliateCode)}
                      variant="outline"
                      size="sm"
                      disabled={referralLoading}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent w-full sm:w-auto"
                    >
                      <RefreshCw className={`h-4 w-4 sm:mr-2 ${referralLoading ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">রিফ্রেশ</span>
                    </Button>
                  </div>

                  {referralLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full min-w-[900px]">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">সিরিয়াল</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">রোগীর নাম</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">মোবাইল</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">ডাক্তার</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">চেম্বার</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">তারিখ</th>
                            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">রোগীর ধরন</th>
                            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">স্ট্যাটাস</th>
                            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referralPatients.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-12 text-gray-500">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>এখনো কোন রোগী আপনার রেফারেল কোড ব্যবহার করেনি</p>
                                <p className="text-xs mt-2">আপনার কোড: <span className="text-cyan-400 font-bold">{affiliate?.affiliateCode}</span></p>
                              </td>
                            </tr>
                          ) : (
                            referralPatients.map((patient) => (
                              <tr key={patient._id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-mono">
                                  {patient.serialNumber ? (
                                    <span className="text-cyan-400">{patient.serialNumber}</span>
                                  ) : (
                                    <span className="text-yellow-400 text-xs px-2 py-1 bg-yellow-500/20 rounded">অপেক্ষমান</span>
                                  )}
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-white">
                                  <div className="font-medium">{patient.patientName}</div>
                                  {patient.gender && (
                                    <div className="text-xs text-gray-500">
                                      {patient.gender === 'male' ? 'পুরুষ' : patient.gender === 'female' ? 'মহিলা' : 'অন্যান্য'}
                                      {patient.age && `, ${patient.age} বছর`}
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-400">
                                  {patient.mobileNumber}
                                </td>
                                <td className="py-4 px-4 text-sm text-white">
                                  {patient.doctorId ? (
                                    <div>
                                      <div className="font-medium">{patient.doctorId.name}</div>
                                      <div className="text-xs text-gray-500">{patient.doctorId.qualification}</div>
                                    </div>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-400">
                                  {patient.chamberName}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-400">
                                  {format(new Date(patient.appointmentDate), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    patient.patientType === 'new'
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : patient.patientType === 'old'
                                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  }`}>
                                    {patient.patientType === 'new' ? 'নতুন' : patient.patientType === 'old' ? 'পুরাতন' : 'রিপোর্ট'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                    patient.status === 'completed'
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : patient.status === 'confirmed'
                                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                      : patient.status === 'cancelled'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                  }`}>
                                    {patient.status === 'completed' ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : patient.status === 'confirmed' ? (
                                      <CheckCircle className="h-3 w-3" />
                                    ) : patient.status === 'cancelled' ? (
                                      <XCircle className="h-3 w-3" />
                                    ) : (
                                      <Clock className="h-3 w-3" />
                                    )}
                                    {patient.status === 'pending' ? 'পেন্ডিং' : 
                                     patient.status === 'confirmed' ? 'কনফার্মড' : 
                                     patient.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  {hasProofBeenSent(patient._id) ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <Button
                                        size="sm"
                                        disabled
                                        className="bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        সম্পন্ন
                                      </Button>
                                      {getRequestStatus(patient._id) && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          getRequestStatus(patient._id) === 'approved'
                                            ? 'bg-green-500/20 text-green-400'
                                            : getRequestStatus(patient._id) === 'rejected'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-orange-500/20 text-orange-400'
                                        }`}>
                                          {getRequestStatus(patient._id) === 'approved' ? 'অনুমোদিত' : 
                                           getRequestStatus(patient._id) === 'rejected' ? 'বাতিল' : 
                                           'পেন্ডিং'}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() => handlePatientClick(patient)}
                                      size="sm"
                                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                                    >
                                      <Upload className="h-4 w-4 mr-1" />
                                      প্রমাণ পাঠান
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>

                {/* Photo Upload Dialog */}
                <Dialog open={photoUploadDialogOpen} onOpenChange={setPhotoUploadDialogOpen}>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="h-6 w-6 text-cyan-400" />
                        প্রমাণ ফটো পাঠান
                      </DialogTitle>
                    </DialogHeader>
                    {selectedPatient && (
                      <div className="space-y-4 mt-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">রোগীর নাম</p>
                          <p className="text-white font-medium">{selectedPatient.patientName}</p>
                          <p className="text-sm text-gray-400 mt-2 mb-1">মোবাইল</p>
                          <p className="text-white">{selectedPatient.mobileNumber}</p>
                        </div>

                        <div>
                          <Label className="text-gray-300 mb-2">ডাক্তারের নাম *</Label>
                          <Input
                            value={photoUploadForm.doctorName}
                            onChange={(e) => setPhotoUploadForm({...photoUploadForm, doctorName: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="ডাক্তারের নাম"
                            required
                          />
                        </div>

                        <div className="relative">
                          <Label className="text-gray-300 mb-2">হাসপাতাল/চেম্বারের নাম *</Label>
                          <Input
                            value={hospitalSearchPhoto || photoUploadForm.hospitalName}
                            onChange={(e) => {
                              setHospitalSearchPhoto(e.target.value);
                              setPhotoUploadForm({...photoUploadForm, hospitalName: e.target.value});
                              setShowHospitalDropdownPhoto(true);
                            }}
                            onFocus={() => setShowHospitalDropdownPhoto(true)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="হাসপাতাল/চেম্বারের নাম অনুসন্ধান করুন"
                            required
                          />
                          {showHospitalDropdownPhoto && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowHospitalDropdownPhoto(false)}
                              />
                              <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl">
                                {hospitals
                                  .filter(h => h.toLowerCase().includes((hospitalSearchPhoto || photoUploadForm.hospitalName).toLowerCase()))
                                  .map((hospital, index) => (
                                    <div
                                      key={index}
                                      onClick={() => {
                                        setPhotoUploadForm({...photoUploadForm, hospitalName: hospital});
                                        setHospitalSearchPhoto(hospital);
                                        setShowHospitalDropdownPhoto(false);
                                      }}
                                      className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-white transition-colors"
                                    >
                                      {hospital}
                                    </div>
                                  ))}
                                {hospitals.filter(h => h.toLowerCase().includes((hospitalSearchPhoto || photoUploadForm.hospitalName).toLowerCase())).length === 0 && (
                                  <div className="px-4 py-2 text-gray-400">কোন হাসপাতাল পাওয়া যায়নি</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        <div>
                          <Label className="text-gray-300 mb-2">প্রমাণ ফটো * (একাধিক ফটো নির্বাচন করতে পারেন)</Label>
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handlePhotoSelect}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label
                              htmlFor="photo-upload"
                              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-colors bg-white/5"
                            >
                              <div className="text-center">
                                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-400">ক্লিক করে ফটো নির্বাচন করুন</p>
                                <p className="text-xs text-gray-500 mt-1">একাধিক ফটো নির্বাচন করতে পারেন</p>
                              </div>
                            </label>
                          </div>
                          {photoPreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {photoPreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                  <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <p className="text-xs text-gray-400 mt-1 truncate">{selectedPhotos[index]?.name}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => {
                              setPhotoUploadDialogOpen(false);
                              setSelectedPhotos([]);
                              setPhotoPreviews([]);
                              setSelectedPatient(null);
                              setPhotoUploadForm({ doctorName: '', hospitalName: '' });
                            }}
                            variant="outline"
                            className="flex-1 border-white/10 text-gray-400 hover:text-white"
                          >
                            বাতিল
                          </Button>
                          <Button
                            onClick={handlePhotoUpload}
                            disabled={selectedPhotos.length === 0 || uploadingPhoto || !photoUploadForm.doctorName || !photoUploadForm.hospitalName}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                          >
                            {uploadingPhoto ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                আপলোড হচ্ছে...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                পাঠান
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Info Card */}
                <Card className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-cyan-500/20">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="font-semibold text-cyan-400">নোট:</span> এই তালিকায় শুধুমাত্র সেই রোগীরা দেখানো হচ্ছে যারা বুকিং এর সময় আপনার রেফারেল কোড (<span className="font-bold text-cyan-400">{affiliate?.affiliateCode}</span>) ব্যবহার করেছেন। আপনি রোগীদের তথ্য এবং অ্যাপয়েন্টমেন্ট স্ট্যাটাস দেখতে পারবেন, কিন্তু স্ট্যাটাস পরিবর্তন করতে পারবেন না।
                      </p>
                    </div>
                  </div>
                </Card>
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
                <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                      Commission History
                    </h3>
                  </div>

                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Date</th>
                          <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Patient</th>
                          <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Bill</th>
                          <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Commission</th>
                          <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Status</th>
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
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-400">
                                <span className="hidden sm:inline">{format(new Date(commission.createdAt), 'MMM dd, yyyy')}</span>
                                <span className="sm:hidden">{format(new Date(commission.createdAt), 'MMM dd')}</span>
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-white">
                                {commission.appointmentId?.patientName || 'N/A'}
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-right text-white">
                                ৳{commission.totalBill.toLocaleString()}
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-right font-medium text-emerald-400">
                                ৳{commission.commissionAmount.toLocaleString()}
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
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
                <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                      Withdrawal History
                    </h3>
                    <Button
                      onClick={() => router.push('/affiliate-program/withdrawal')}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 text-sm sm:text-base w-full sm:w-auto"
                      disabled={(affiliate.walletBalance || 0) === 0}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">New Withdrawal</span>
                      <span className="sm:hidden">Withdraw</span>
                    </Button>
                  </div>

                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Date</th>
                          <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Amount</th>
                          <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Status</th>
                          <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Processed</th>
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
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-400">
                                <span className="hidden sm:inline">{format(new Date(withdrawal.createdAt), 'MMM dd, yyyy')}</span>
                                <span className="sm:hidden">{format(new Date(withdrawal.createdAt), 'MMM dd')}</span>
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-right font-medium text-white">
                                ৳{withdrawal.amount.toLocaleString()}
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Request Form */}
                  <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-1 h-fit">
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
                      <div className="relative">
                        <Label className="text-gray-300">Hospital Name</Label>
                        <Input
                          required
                          value={hospitalSearchRequest || requestForm.hospitalName}
                          onChange={(e) => {
                            setHospitalSearchRequest(e.target.value);
                            setRequestForm({...requestForm, hospitalName: e.target.value});
                            setShowHospitalDropdownRequest(true);
                          }}
                          onFocus={() => setShowHospitalDropdownRequest(true)}
                          className="bg-white/5 border-white/10 text-white mt-1"
                          placeholder="Search or enter hospital name"
                        />
                        {showHospitalDropdownRequest && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowHospitalDropdownRequest(false)}
                            />
                            <div className="absolute z-20 w-full mt-1 max-h-60 overflow-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl">
                              {hospitals
                                .filter(h => h.toLowerCase().includes((hospitalSearchRequest || requestForm.hospitalName).toLowerCase()))
                                .map((hospital, index) => (
                                  <div
                                    key={index}
                                    onClick={() => {
                                      setRequestForm({...requestForm, hospitalName: hospital});
                                      setHospitalSearchRequest(hospital);
                                      setShowHospitalDropdownRequest(false);
                                    }}
                                    className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-white transition-colors"
                                  >
                                    {hospital}
                                  </div>
                                ))}
                              {hospitals.filter(h => h.toLowerCase().includes((hospitalSearchRequest || requestForm.hospitalName).toLowerCase())).length === 0 && (
                                <div className="px-4 py-2 text-gray-400">No hospitals found</div>
                              )}
                            </div>
                          </>
                        )}
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
                  <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10 lg:col-span-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Request History</h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full min-w-[640px]">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Date</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Patient</th>
                            <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Doctor/Hospital</th>
                            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Photos</th>
                            <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No requests submitted yet</p>
                              </td>
                            </tr>
                          ) : (
                            requests.map((req) => (
                              <tr key={req._id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-400">
                                  <span className="hidden sm:inline">{format(new Date(req.createdAt), 'MMM dd, yyyy')}</span>
                                  <span className="sm:hidden">{format(new Date(req.createdAt), 'MMM dd')}</span>
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-white">
                                  <div className="font-medium">{req.patientName}</div>
                                  <div className="text-xs text-gray-500">{req.patientPhone}</div>
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-white">
                                  <div className="font-medium">{req.doctorName}</div>
                                  <div className="text-xs text-gray-500">{req.hospitalName}</div>
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                                  {(req.proofPhotos && req.proofPhotos.length > 0) || req.proofPhoto ? (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-cyan-400 hover:text-cyan-300"
                                        >
                                          <ImageIcon className="h-4 w-4 mr-1" />
                                          {((req.proofPhotos && req.proofPhotos.length > 0) ? req.proofPhotos.length : 1)} Photo(s)
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-[95vw] sm:max-w-4xl bg-slate-900 border-white/10">
                                        <DialogHeader>
                                          <DialogTitle className="text-white">Proof Photos</DialogTitle>
                                        </DialogHeader>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[70vh] overflow-y-auto">
                                          {req.proofPhotos && req.proofPhotos.length > 0 ? (
                                            req.proofPhotos.map((photo, idx) => (
                                              <div key={idx} className="relative">
                                                <img
                                                  src={photo}
                                                  alt={`Proof ${idx + 1}`}
                                                  className="w-full h-auto rounded-lg"
                                                />
                                              </div>
                                            ))
                                          ) : req.proofPhoto ? (
                                            <div className="relative">
                                              <img
                                                src={req.proofPhoto}
                                                alt="Proof"
                                                className="w-full h-auto rounded-lg"
                                              />
                                            </div>
                                          ) : null}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  ) : (
                                    <span className="text-gray-500 text-xs">No photos</span>
                                  )}
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

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Report Type Selector */}
                  <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                        রিপোর্ট
                      </h3>
                      <div className="flex gap-2 overflow-x-auto w-full sm:w-auto sm:ml-auto scrollbar-hide">
                        {(['all', 'monthly', 'daily', 'pending', 'paid'] as const).map((type) => (
                          <Button
                            key={type}
                            onClick={() => setReportType(type)}
                            variant={reportType === type ? "default" : "outline"}
                            className={
                              reportType === type
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 whitespace-nowrap"
                                : "border-white/10 text-gray-400 hover:text-white whitespace-nowrap"
                            }
                            size="sm"
                          >
                            {type === 'all' ? 'সব' : type === 'monthly' ? 'মাসিক' : type === 'daily' ? 'দৈনিক' : type === 'pending' ? 'পেন্ডিং' : 'পেইড'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {reportType === 'monthly' && (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-auto">
                          <Label className="text-gray-300 text-sm sm:text-base">মাস</Label>
                          <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="mt-1 w-full sm:w-auto px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <option key={m} value={m} className="bg-slate-900">
                                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Label className="text-gray-300 text-sm sm:text-base">বছর</Label>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="mt-1 w-full sm:w-auto px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm sm:text-base"
                          >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                              <option key={y} value={y} className="bg-slate-900">
                                {y}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </Card>

                  {reportsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                    </div>
                  ) : reports ? (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">অ্যাফিলিয়েট কোড সাবমিশন</p>
                            <Users className="h-5 w-5 text-blue-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            {reports.summary?.totalAffiliateCodeSubmissions || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">মোট বুকিং</p>
                        </Card>

                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm text-gray-400">মোট পেইড</p>
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-white">
                            ৳{(reports.summary?.totalPaid || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">অনুমোদিত কমিশন</p>
                        </Card>

                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm text-gray-400">মোট আনপেইড</p>
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                          </div>
                          <p className="text-2xl sm:text-3xl font-bold text-white">
                            ৳{(reports.summary?.totalUnpaid || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">পেন্ডিং + অনুমোদিত</p>
                        </Card>

                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-400">পেন্ডিং</p>
                            <TrendingDownIcon className="h-5 w-5 text-purple-400" />
                          </div>
                          <p className="text-3xl font-bold text-white">
                            ৳{(reports.summary?.totalPending || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">অপেক্ষমান কমিশন</p>
                        </Card>
                      </div>

                      {/* Monthly Breakdown Chart */}
                      {reports.monthlyBreakdown && reports.monthlyBreakdown.length > 0 && (
                        <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                          <h4 className="text-base sm:text-lg font-bold text-white mb-4">মাসিক রিপোর্ট</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={reports.monthlyBreakdown}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="month" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => `৳${value.toLocaleString()}`}
                              />
                              <Legend />
                              <Bar dataKey="paid" fill="#10b981" name="পেইড" />
                              <Bar dataKey="unpaid" fill="#f59e0b" name="আনপেইড" />
                              <Bar dataKey="pending" fill="#ef4444" name="পেন্ডিং" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Card>
                      )}

                      {/* Daily Breakdown Chart */}
                      {reportType === 'daily' || reportType === 'all' ? (
                        <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                          <h4 className="text-base sm:text-lg font-bold text-white mb-4">দৈনিক রিপোর্ট (শেষ ৩০ দিন)</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={reports.dailyBreakdown}>
                              <defs>
                                <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="dateFormatted" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => `৳${value.toLocaleString()}`}
                              />
                              <Legend />
                              <Area type="monotone" dataKey="commissions" stroke="#06b6d4" fill="url(#colorDaily)" name="কমিশন" />
                              <Area type="monotone" dataKey="appointments" stroke="#10b981" fill="url(#colorDaily)" name="অ্যাপয়েন্টমেন্ট" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </Card>
                      ) : null}

                      {/* Pending Report Table */}
                      {reportType === 'pending' || reportType === 'all' ? (
                        <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h4 className="text-base sm:text-lg font-bold text-white">পেন্ডিং কমিশন</h4>
                            <span className="px-2 sm:px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm">
                              {reports.pendingCommissions?.length || 0} টি
                            </span>
                          </div>
                          <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full min-w-[640px]">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">তারিখ</th>
                                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">রোগী</th>
                                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">বিল</th>
                                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">কমিশন</th>
                                  <th className="text-center py-3 px-2 sm:px-4 font-semibold text-gray-300 text-xs sm:text-sm">স্ট্যাটাস</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reports.pendingCommissions?.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                      কোন পেন্ডিং কমিশন নেই
                                    </td>
                                  </tr>
                                ) : (
                                  reports.pendingCommissions?.map((commission: any) => (
                                    <tr key={commission._id} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-400">
                                        <span className="hidden sm:inline">{format(new Date(commission.createdAt), 'MMM dd, yyyy')}</span>
                                        <span className="sm:hidden">{format(new Date(commission.createdAt), 'MMM dd')}</span>
                                      </td>
                                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-white">
                                        {commission.appointmentId?.patientName || 'N/A'}
                                      </td>
                                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-right text-white">
                                        ৳{commission.totalBill?.toLocaleString() || 0}
                                      </td>
                                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-right font-medium text-orange-400">
                                        ৳{commission.commissionAmount?.toLocaleString() || 0}
                                      </td>
                                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                          <Clock className="h-3 w-3" />
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
                      ) : null}

                      {/* Paid/Unpaid Summary Table */}
                      {(reportType === 'paid' || reportType === 'all') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                          <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                              <h4 className="text-base sm:text-lg font-bold text-white">পেইড কমিশন</h4>
                              <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm">
                                {reports.paidCommissions?.length || 0} টি
                              </span>
                            </div>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-2 px-3 font-semibold text-gray-300 text-sm">তারিখ</th>
                                    <th className="text-right py-2 px-3 font-semibold text-gray-300 text-sm">কমিশন</th>
                                    <th className="text-center py-2 px-3 font-semibold text-gray-300 text-sm">স্ট্যাটাস</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reports.paidCommissions?.slice(0, 5).map((commission: any) => (
                                    <tr key={commission._id} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="py-3 px-3 text-xs text-gray-400">
                                        {format(new Date(commission.createdAt), 'MMM dd')}
                                      </td>
                                      <td className="py-3 px-3 text-xs text-right font-medium text-green-400">
                                        ৳{commission.commissionAmount?.toLocaleString() || 0}
                                      </td>
                                      <td className="py-3 px-3 text-center">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                          <CheckCircle className="h-3 w-3" />
                                          Paid
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Card>

                          <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                              <h4 className="text-base sm:text-lg font-bold text-white">আনপেইড কমিশন</h4>
                              <span className="px-2 sm:px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm">
                                {reports.unpaidCommissions?.length || 0} টি
                              </span>
                            </div>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-white/10">
                                    <th className="text-left py-2 px-3 font-semibold text-gray-300 text-sm">তারিখ</th>
                                    <th className="text-right py-2 px-3 font-semibold text-gray-300 text-sm">কমিশন</th>
                                    <th className="text-center py-2 px-3 font-semibold text-gray-300 text-sm">স্ট্যাটাস</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {reports.unpaidCommissions?.slice(0, 5).map((commission: any) => (
                                    <tr key={commission._id} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="py-3 px-3 text-xs text-gray-400">
                                        {format(new Date(commission.createdAt), 'MMM dd')}
                                      </td>
                                      <td className="py-3 px-3 text-xs text-right font-medium text-orange-400">
                                        ৳{commission.commissionAmount?.toLocaleString() || 0}
                                      </td>
                                      <td className="py-3 px-3 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                          commission.status === 'approved'
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        }`}>
                                          {commission.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                          {commission.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Card>
                        </div>
                      )}
                    </>
                  ) : null}
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
                <Card className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <UserCircle className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                      Profile Settings
                    </h3>
                    {!isEditingProfile ? (
                      <Button
                        onClick={() => setIsEditingProfile(true)}
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent text-sm sm:text-base w-full sm:w-auto"
                      >
                        <Edit3 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Edit Profile</span>
                        <span className="sm:hidden ml-2">Edit</span>
                      </Button>
                    ) : (
                      <div className="flex gap-2 w-full sm:w-auto">
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
                          className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10 bg-transparent flex-1 sm:flex-none text-sm sm:text-base"
                        >
                          <X className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Cancel</span>
                        </Button>
                        <Button
                          onClick={handleProfileUpdate}
                          disabled={profileLoading}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 flex-1 sm:flex-none text-sm sm:text-base"
                        >
                          {profileLoading ? (
                            <RefreshCw className="h-4 w-4 sm:mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 sm:mr-2" />
                          )}
                          <span className="hidden sm:inline">Save Changes</span>
                          <span className="sm:hidden ml-2">Save</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Personal Information */}
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
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
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
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
