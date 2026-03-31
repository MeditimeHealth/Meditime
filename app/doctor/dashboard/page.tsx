"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Clock, DollarSign, Calendar, Activity, Video, PhoneOff, UserCheck, ToggleLeft, ToggleRight, Camera, RefreshCw, Search } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserData {
  id: string;
  role: string;
  userType: string;
  doctorId: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  image?: string;
}

export default function DoctorDashboardPage() {
  const { language } = useLanguage();
  const router = useRouter();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState("");

  const fetchDashboardData = async (doctorId: string) => {
    try {
      const res = await fetch(`/api/doctor/dashboard?doctorId=${doctorId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        
        // Fetch specific doctor info for the profile card
        const docRes = await fetch(`/api/doctors/${doctorId}`);
        if (docRes.ok) {
           const docJson = await docRes.json();
           setDoctorInfo(docJson);
        }
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorByPhoneAndLoadData = async (phone: string, email?: string) => {
    try {
      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();
      
      const doctorsList = Array.isArray(doctorsData) ? doctorsData : doctorsData.doctors || [];
      const foundDoctor = doctorsList.find(
        (d: any) => d.phoneNumber === phone || d.email === email
      );
      
      if (foundDoctor) {
        fetchDashboardData(foundDoctor._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.userType !== "doctor" && parsedUser.role !== "doctor") {
        router.push("/");
        return;
      }
      setUser(parsedUser);
      
      if (parsedUser.doctorId) {
        fetchDashboardData(parsedUser.doctorId);
      } else if (parsedUser.phoneNumber) {
        fetchDoctorByPhoneAndLoadData(parsedUser.phoneNumber, parsedUser.email);
      } else {
        setLoading(false);
        toast.error("Doctor ID not found in user profile.");
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  const handleToggleLive = async () => {
    if (!data.liveConsultant) return;
    try {
      const res = await fetch(`/api/admin/live-consultants/${data.liveConsultant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleLive" }),
      });
      if (res.ok) {
        toast.success("Status toggled!");
        if (user?.doctorId) fetchDashboardData(user.doctorId);
      }
    } catch (err) {
      toast.error("Failed to toggle");
    }
  };

  const handleAcceptNext = async () => {
    if (!data.liveConsultant) return;
    try {
      const res = await fetch(`/api/admin/live-consultants/${data.liveConsultant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acceptNext" }),
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success("Patient accepted!");
        if (user?.doctorId) fetchDashboardData(user.doctorId);
      } else {
        toast.error(resData.error || "No waiting patients");
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleCompleteCall = async () => {
    if (!data.liveConsultant) return;
    try {
      const res = await fetch(`/api/admin/live-consultants/${data.liveConsultant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "completeCall" }),
      });
      if (res.ok) {
        toast.success("Call completed!");
        if (user?.doctorId) fetchDashboardData(user.doctorId);
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleUpdatePhoto = async () => {
    if (!user?.doctorId || !photoUrl) {
      toast.error("Please provide a photo URL");
      return;
    }
    setIsUpdatingPhoto(true);
    try {
      // First get current doctor info
      const docRes = await fetch(`/api/doctors/${user.doctorId}`);
      const docJson = await docRes.json();
      
      const res = await fetch(`/api/doctors/${user.doctorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...docJson.doctor,
          image: photoUrl
        }),
      });
      if (res.ok) {
        toast.success("Profile photo updated!");
        fetchDashboardData(user.doctorId);
        setPhotoUrl("");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to update photo");
      }
    } catch (err) {
      toast.error("Error updating photo");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleJoinMeeting = () => {
    if (data.liveConsultant && data.liveConsultant.roomId) {
      window.open(`https://meet.jit.si/${data.liveConsultant.roomId}`, "_blank");
    } else {
      toast.error("Live consultation room not configured");
    }
  };

  const calculateRevenue = () => {
    const fee = data.liveConsultant?.consultationFee || doctorInfo?.doctor?.consultationFee || 500;
    return (data.summary.totalCompleted || 0) * fee;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (!user || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <Card className="p-12 text-center shadow-lg">
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p>Could not load your doctor data. Please contact admin to link your account.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "bn" ? `স্বাগতম, ডা. ${user.fullName || doctorInfo?.doctor?.name}` : `Welcome, Dr. ${user.fullName || doctorInfo?.doctor?.name}`}
            </h1>
            <p className="text-gray-500 mt-1">
              {language === "bn" ? "আপনার ড্যাশবোর্ড এবং রোগীদের পরিচালনা করুন" : "Manage your dashboard and patients"}
            </p>
          </div>
          {data.liveConsultant && (
            <div className="mt-4 md:mt-0 flex gap-2">
              <button 
                onClick={handleToggleLive}
                className={`px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition ${
                  data.liveConsultant.isLive 
                    ? "bg-red-50 text-red-600 hover:bg-red-100" 
                    : "bg-teal-500 text-white hover:bg-teal-600"
                }`}
              >
                {data.liveConsultant.isLive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {data.liveConsultant.isLive ? (language === "bn" ? "অফলাইন যান" : "Go Offline") : (language === "bn" ? "লাইভ যান" : "Go Live")}
              </button>
              <button 
                onClick={handleJoinMeeting}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm transition"
              >
                <Video className="w-5 h-5" />
                {language === "bn" ? "লাইভ মিটিং" : "Live Meeting"}
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{language === "bn" ? "মোট রোগী" : "Total Patients"}</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.summary.totalPatients}</h3>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{language === "bn" ? "অপেক্ষমাণ" : "Waiting"}</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.summary.waitingCount}</h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{language === "bn" ? "আপকামিং" : "Upcoming"}</p>
              <h3 className="text-2xl font-bold text-gray-900">{data.upcomingAppointments?.length || 0}</h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{language === "bn" ? "আয়" : "Revenue"}</p>
              <h3 className="text-2xl font-bold text-gray-900">৳{calculateRevenue().toLocaleString()}</h3>
            </div>
          </Card>
        </div>

        {/* Tabs Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="border-b flex flex-wrap">
            {['overview', 'waitlist', 'appointments', 'patients'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-teal-500 text-teal-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {language === "bn" 
                  ? (tab === 'overview' ? 'ওভারভিউ' : tab === 'waitlist' ? 'অপেক্ষমাণ' : tab === 'appointments' ? 'অ্যাপয়েন্টমেন্ট' : 'রোগীর তালিকা')
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <Activity className="w-5 h-5 text-gray-400" />
                       {language === "bn" ? "সাম্প্রতিক অপেক্ষমাণ" : "Recent Waiting List"}
                    </h3>
                    {data.waitlist.length === 0 ? (
                      <p className="text-gray-500 text-sm">{language === "bn" ? "কোন রোগী অপেক্ষা করছে না" : "No patients waiting"}</p>
                    ) : (
                      <div className="space-y-3">
                        {data.waitlist.slice(0, 5).map((w: any) => (
                          <div key={w._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{w.patientName}</p>
                              <p className="text-xs text-gray-500">{w.patientPhone}</p>
                            </div>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Wait</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{language === "bn" ? "ডাক্তারের প্রোফাইল" : "Doctor Info"}</h3>
                      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <div className="relative group">
                          {(doctorInfo?.doctor?.image || user.image) ? (
                            <img 
                              src={doctorInfo?.doctor?.image || user.image} 
                              alt="Profile" 
                              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-3xl border-4 border-white shadow-md">
                              {user.fullName?.charAt(0) || "D"}
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition duration-200">
                             <Camera className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="text-center sm:text-left">
                          <h4 className="font-bold text-gray-900">{user.fullName || doctorInfo?.doctor?.name}</h4>
                          <p className="text-sm text-gray-500">{doctorInfo?.doctor?.specialty || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                             {language === "bn" ? "প্রোফাইল ফটো আপডেট করুন (URL)" : "Update Profile Photo (URL)"}
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="https://..."
                              value={photoUrl}
                              onChange={(e) => setPhotoUrl(e.target.value)}
                              className="flex-1 text-sm border rounded-md px-3 py-2 bg-white"
                            />
                            <button 
                              onClick={handleUpdatePhoto}
                              disabled={isUpdatingPhoto}
                              className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-md hover:bg-teal-600 disabled:opacity-50"
                            >
                              {isUpdatingPhoto ? "..." : (language === "bn" ? "সেভ" : "Save")}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                          <div className="p-3 border rounded-lg">
                            <span className="text-gray-500 block mb-1">Qualification</span>
                            <span className="text-gray-900 font-medium">{doctorInfo?.doctor?.qualification || 'N/A'}</span>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <span className="text-gray-500 block mb-1">Fee (৳)</span>
                            <span className="text-gray-900 font-medium font-bold">৳{doctorInfo?.doctor?.consultationFee || data.liveConsultant?.consultationFee || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      {language === "bn" ? "সাম্প্রতিক অ্যাপয়েন্টমেন্ট" : "Upcoming Appointments"}
                    </h3>
                    {data.upcomingAppointments.length === 0 ? (
                      <p className="text-gray-500 text-sm">{language === "bn" ? "কোন অ্যাপয়েন্টমেন্ট নেই" : "No upcoming appointments"}</p>
                    ) : (
                      <div className="space-y-3">
                        {data.upcomingAppointments.slice(0, 5).map((a: any) => (
                          <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{a.patientName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(a.appointmentDate).toLocaleDateString()} {a.appointmentTime ? `at ${a.appointmentTime}` : ''}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full capitalize">
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{language === "bn" ? "দ্রুত একশন" : "Quick Actions"}</h3>
                    <div className="space-y-3">
                      <Link href="/doctor/time-slots">
                        <Button className="w-full" variant="default">
                          {language === "bn" ? "সময় স্লট পরিচালনা করুন" : "Manage Time Slots"}
                        </Button>
                      </Link>
                      <Link href="/doctor/patients">
                        <Button className="w-full" variant="outline">
                          {language === "bn" ? "সব রোগী দেখুন" : "View All Patients"}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'waitlist' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-900">{language === "bn" ? "লাইভ কনসালটেশন কিউ" : "Live Consultation Queue"}</h3>
                  {data.waitlist.filter((w: any) => w.status === 'waiting').length > 0 && (
                    <button 
                      onClick={handleAcceptNext}
                      className="px-6 py-2.5 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition flex items-center gap-2 shadow-md shadow-teal-100"
                    >
                      <UserCheck className="w-5 h-5" />
                      {language === "bn" ? "পরবর্তী রোগী গ্রহণ করুন" : "Accept Next Patient"}
                    </button>
                  )}
                </div>

                {/* Active Call Section */}
                {data.liveConsultant?.currentQueue?.find((e: any) => e.status === 'in-call') ? (
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                           <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">In Active Call</span>
                        </div>
                        <h4 className="text-3xl font-black text-blue-900">
                          {data.liveConsultant.currentQueue.find((e: any) => e.status === 'in-call').patientName}
                        </h4>
                        <p className="text-blue-700 font-medium text-lg mt-1">{data.liveConsultant.currentQueue.find((e: any) => e.status === 'in-call').patientPhone}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button 
                          onClick={handleJoinMeeting}
                          className="flex-1 md:flex-none px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all hover:scale-105 active:scale-95"
                        >
                          <Video className="w-5 h-5" /> {language === "bn" ? "মিটিং যোগ দিন" : "Join Meeting"}
                        </button>
                        <button 
                          onClick={handleCompleteCall}
                          className="flex-1 md:flex-none px-6 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 flex items-center justify-center gap-2 shadow-lg shadow-red-100 transition-all hover:scale-105 active:scale-95"
                        >
                          <PhoneOff className="w-5 h-5" /> {language === "bn" ? "কল শেষ করুন" : "Complete Call"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 border border-dashed rounded-2xl">
                    <p className="text-gray-500">{language === "bn" ? "বর্তমানে কোনো রোগী কলে নেই" : "No active call at the moment"}</p>
                    {data.waitlist.filter((w: any) => w.status === 'waiting').length > 0 && (
                       <button onClick={handleAcceptNext} className="mt-4 text-teal-600 font-bold hover:underline">
                         {language === "bn" ? "পরবর্তী রোগী গ্রহণ করুন" : "Accept the next patient in queue"}
                       </button>
                    )}
                  </div>
                )}

                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined At</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.waitlist.filter((w: any) => w.status === 'waiting').map((w: any) => (
                        <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{w.patientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{w.patientPhone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(w.joinedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 inline-flex text-[10px] leading-5 font-black rounded-full bg-yellow-100 text-yellow-800 uppercase tracking-widest">
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {data.waitlist.filter((w: any) => w.status === 'waiting').length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-12 py-12 text-center text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>{language === "bn" ? "কিউতে কেউ নেই" : "No patients in queue"}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold">{language === "bn" ? "অ্যাপয়েন্টমেন্ট তালিকা" : "All Appointments"}</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder={language === "bn" ? "রোগী খুঁজুন..." : "Search patient..."}
                      value={appointmentSearchQuery}
                      onChange={(e) => setAppointmentSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="bg-white border rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.upcomingAppointments.concat(data.completedAppointments)
                        .filter((a: any) => 
                          a.patientName?.toLowerCase().includes(appointmentSearchQuery.toLowerCase()) ||
                          a.mobileNumber?.includes(appointmentSearchQuery)
                        )
                        .map((a: any) => (
                        <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{a.patientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{a.mobileNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(a.appointmentDate).toLocaleDateString()} {a.appointmentTime ? `at ${a.appointmentTime}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black rounded-full capitalize uppercase tracking-widest ${
                              a.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">{language === "bn" ? "রোগীর তালিকা" : "Patient Directory"}</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder={language === "bn" ? "নাম বা ফোন নম্বর..." : "Name or phone..."}
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.patientsList
                    .filter((p: any) => 
                      p.patientName?.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                      p.mobileNumber?.includes(patientSearchQuery)
                    )
                    .map((p: any, idx: number) => (
                    <div key={idx} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl font-black uppercase">
                          {p.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg">{p.patientName}</p>
                          <p className="text-sm text-gray-500">{p.mobileNumber}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl">
                        <p className="flex justify-between">
                           <span className="text-gray-400">Last visit:</span>
                           <span className="font-medium">{new Date(p.lastVisit).toLocaleDateString()}</span>
                        </p>
                        {p.age && (
                           <p className="flex justify-between">
                             <span className="text-gray-400">Age:</span>
                             <span className="font-medium">{p.age}</span>
                           </p>
                        )}
                        {p.gender && (
                           <p className="flex justify-between">
                             <span className="text-gray-400">Gender:</span>
                             <span className="font-medium capitalize">{p.gender}</span>
                           </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
