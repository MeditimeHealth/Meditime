  "use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  X,
  ExternalLink,
  Activity,
  History
} from "lucide-react";
import { showToast } from "@/lib/toast";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DiagnosticHistoryModal from "@/components/diagnostic/DiagnosticHistoryModal";
import ConfirmationModal from "@/components/ui/confirmation-modal";

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    nameBn?: string;
    qualification?: string;
    qualificationBn?: string;
    department?: string;
    departmentBn?: string;
    hospital?: string;
    hospitalBn?: string;
    image?: string;
  };
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'old' | 'new' | 'report';
  hospitalName: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map(digit => bengaliDigits[parseInt(digit)]).join("");
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayNum = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return `${banglaDays[day]}, ${toBengaliNumber(dayNum)} ${banglaMonths[month]}, ${toBengaliNumber(year)}`;
};

const formatTime = (timeString?: string): string => {
  if (!timeString) return "সময় নির্ধারিত হয়নি";
  return timeString;
};

const getStatusBadge = (status: string, language: string) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const labels = {
    pending: language === 'bn' ? "অপেক্ষমান" : "Pending",
    confirmed: language === 'bn' ? "নিশ্চিত" : "Confirmed",
    cancelled: language === 'bn' ? "বাতিল" : "Cancelled",
    completed: language === 'bn' ? "সম্পন্ন" : "Completed",
  };

  const icons = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    cancelled: XCircle,
    completed: CheckCircle,
  };

  const Icon = icons[status as keyof typeof icons] || AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status as keyof typeof styles] || styles.pending}`}
      
    >
      <Icon className="h-4 w-4" />
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};

const getPatientTypeLabel = (type: string, language: string) => {
  const labels: Record<string, string> = {
    old: language === 'bn' ? "পুরাতন রোগী" : "Old Patient",
    new: language === 'bn' ? "নতুন রোগী" : "New Patient",
    report: language === 'bn' ? "রিপোর্ট দেখানো" : "Report Showing",
  };
  return labels[type] || type;
};

export default function UserDashboardPage() {
  const { language } = useLanguage() as { language: "en" | "bn" };
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [user, setUser] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [myBookingsHistory, setMyBookingsHistory] = useState<any[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      const savedBookings = localStorage.getItem("myDiagnosticBookings");
      
      if (savedBookings) setMyBookingsHistory(JSON.parse(savedBookings));
      
      if (!userData) {
        router.push("/login");
        return;
      }

      try {
        const parsedData = JSON.parse(userData);
        setUser(parsedData);
        fetchAppointments(parsedData.id);
        fetchUserBookings(parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    }
  }, [router, filter]);

  const fetchAppointments = async (userId: string) => {
    try {
      setLoading(true);
      const url = filter !== "all" 
        ? `/api/appointments?userId=${userId}&status=${filter}` 
        : `/api/appointments?userId=${userId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (userData: any) => {
    if (!userData) return;
    
    try {
      const userId = userData.id || userData._id;
      const res = await fetch(`/api/diagnostic/bookings?userId=${userId}`);
      const data = await res.json();
      
      if (res.ok && data.bookings) {
        const localBookings = JSON.parse(localStorage.getItem("myDiagnosticBookings") || "[]");
        const combined = [...data.bookings, ...localBookings];
        const unique = Array.from(new Map(combined.map(b => [b._id || b.bookingRef, b])).values());
        
        setMyBookingsHistory(unique);
        localStorage.setItem("myDiagnosticBookings", JSON.stringify(unique));
      }
    } catch (error) {
      console.error("Error fetching diagnostic bookings:", error);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelConfirm(true);
  };

  const confirmCancelAppointment = async () => {
    if (!user || !appointmentToCancel) return;

    try {
      setCancellingId(appointmentToCancel);
      const response = await fetch(`/api/appointments/${appointmentToCancel}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "cancelled",
          userId: user.id 
        }),
      });

      if (response.ok) {
        showToast.success(language === 'bn' ? "অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে" : "Appointment cancelled");
        fetchAppointments(user.id);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" >
            {language === 'bn' ? 'আমার ড্যাশবোর্ড' : 'My Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2" >
            {language === 'bn' ? `স্বাগতম, ${user?.fullName}` : `Welcome, ${user?.fullName}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setShowBookingsModal(true)} 
            className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl shadow-lg transition-all py-6"
            
          >
            <Activity className="w-5 h-5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'ডায়াগনস্টিক ইতিহাস' : 'Diagnostic History'}</span>
            <span className="sm:hidden">{language === 'bn' ? 'ইতিহাস' : 'History'}</span>
            {myBookingsHistory.length > 0 && (
              <span className="bg-white text-primary px-2 py-0.5 rounded-md text-xs ml-1 font-black">
                {myBookingsHistory.length}
              </span>
            )}
          </Button>

          <Button 
            onClick={() => window.open('https://wa.me/8801610385555', '_blank')}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-xl shadow-lg transition-all py-6"
            
          >
            <Phone className="w-5 h-5" />
            {language === 'bn' ? 'সাপোর্ট' : 'Support'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
          <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{toBengaliNumber(stats.total)}</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'মোট' : 'Total'}</p>
        </Card>
        <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
          <p className="text-xl md:text-2xl font-bold text-yellow-600 mb-1">{toBengaliNumber(stats.pending)}</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'অপেক্ষমান' : 'Pending'}</p>
        </Card>
        <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
          <p className="text-xl md:text-2xl font-bold text-green-600 mb-1">{toBengaliNumber(stats.confirmed)}</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</p>
        </Card>
        <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
          <p className="text-xl md:text-2xl font-bold text-blue-600 mb-1">{toBengaliNumber(stats.completed)}</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</p>
        </Card>
        <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xl md:text-2xl font-bold text-red-600 mb-1">{toBengaliNumber(stats.cancelled)}</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</p>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2" >
            <Calendar className="h-5 w-5 text-primary" />
            {language === 'bn' ? 'আমার অ্যাপয়েন্টমেন্টসমূহ' : 'My Appointments'}
          </h2>
          
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                  filter === f 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
                
              >
                {f === 'all' ? (language === 'bn' ? 'সব' : 'All') : 
                 f === 'pending' ? (language === 'bn' ? 'অপেক্ষমান' : 'Pending') :
                 f === 'confirmed' ? (language === 'bn' ? 'নিশ্চিত' : 'Confirmed') :
                 f === 'completed' ? (language === 'bn' ? 'সম্পন্ন' : 'Completed') :
                 (language === 'bn' ? 'বাতিল' : 'Cancelled')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <Card className="p-8 md:p-12 text-center border-dashed border-2">
            <Calendar className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm md:text-base text-gray-500 mb-6" >
              {language === 'bn' ? 'কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি' : 'No appointments found'}
            </p>
            <Link href="/doctor">
              <Button className="rounded-xl">
                {language === 'bn' ? 'নতুন অ্যাপয়েন্টমেন্ট করুন' : 'Book New Appointment'}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment._id} className="p-4 md:p-5 hover:shadow-md transition-shadow border-slate-100">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                  <div className="flex flex-row lg:flex-col gap-4 items-center lg:items-start flex-shrink-0">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      {appointment.doctorId?.image ? (
                        <Image
                          src={appointment.doctorId.image}
                          alt={appointment.doctorId.name}
                          fill
                          sizes="(max-width: 768px) 64px, 80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <Stethoscope className="h-6 w-6 md:h-8 md:w-8 text-primary/40" />
                        </div>
                      )}
                    </div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 truncate" >
                        {language === 'bn' 
                          ? (appointment.doctorId?.nameBn || appointment.doctorId?.name || 'ডাক্তার') 
                          : (appointment.doctorId?.name || 'Doctor')}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate" >
                        {language === 'bn' 
                          ? (appointment.doctorId?.qualificationBn || appointment.doctorId?.qualification) 
                          : appointment.doctorId?.qualification}
                      </p>
                    </div>
                    <div className="lg:hidden">
                      {getStatusBadge(appointment.status, language)}
                    </div>

                  <div className="flex-1 min-w-0">
                    <div className="hidden lg:flex flex-wrap items-start justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900" >
                          {language === 'bn' 
                            ? (appointment.doctorId?.nameBn || appointment.doctorId?.name || 'ডাক্তার') 
                            : (appointment.doctorId?.name || 'Doctor')}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium" >
                          {language === 'bn' 
                            ? (appointment.doctorId?.qualificationBn || appointment.doctorId?.qualification) 
                            : appointment.doctorId?.qualification}
                          {language === 'bn' 
                            ? ((appointment.doctorId?.departmentBn || appointment.doctorId?.department) && ` • ${appointment.doctorId.departmentBn || appointment.doctorId.department}`)
                            : (appointment.doctorId?.department && ` • ${appointment.doctorId.department}`)}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status, language)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-gray-700" >
                          {formatDate(appointment.appointmentDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          {formatTime(appointment.appointmentTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-gray-700 truncate" >
                          {appointment.hospitalName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-gray-700 truncate" >
                          {appointment.patientName} ({getPatientTypeLabel(appointment.patientType, language)})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
                        <span className="text-xs md:text-sm font-semibold text-gray-700">
                          {appointment.mobileNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 justify-end border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
                    {(appointment.status === "pending" || appointment.status === "confirmed") && (
                      <Button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancellingId === appointment._id}
                        variant="ghost"
                        className="flex-1 lg:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 h-9 md:h-10 px-3 md:px-4 rounded-xl font-bold text-xs md:text-sm"
                        size="sm"
                        
                      >
                        {cancellingId === appointment._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </Button>
                    )}
                    <Link href={`/doctor/${appointment.doctorId._id}`} className="flex-1 lg:flex-none">
                      <Button variant="outline" size="sm" className="w-full h-9 md:h-10 px-3 md:px-4 rounded-xl font-bold border-slate-200 text-xs md:text-sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {language === 'bn' ? 'ডাক্তার' : 'Doctor'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DiagnosticHistoryModal
        language={language}
        showBookingsModal={showBookingsModal}
        setShowBookingsModal={setShowBookingsModal}
        myBookingsHistory={myBookingsHistory}
        setMyBookingsHistory={setMyBookingsHistory}
      />

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => {
          setShowCancelConfirm(false);
          setAppointmentToCancel(null);
        }}
        onConfirm={confirmCancelAppointment}
        title={language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বাতিল করুন' : 'Cancel Appointment'}
        message={language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?' : 'Are you sure you want to cancel this appointment?'}
        confirmText={language === 'bn' ? 'হ্যাঁ, বাতিল করুন' : 'Yes, Cancel'}
        cancelText={language === 'bn' ? 'না' : 'No'}
        variant="danger"
        language={language}
      />
    </div>
  );
}
