"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage } from "@/contexts/LanguageContext";

// Components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AppointmentList from "@/components/dashboard/AppointmentList";
import DiagnosticHistoryModal from "@/components/diagnostic/DiagnosticHistoryModal";
import ConfirmationModal from "@/components/ui/confirmation-modal";

// Utils & Types
import { toBengaliNumber, formatBengaliDate, formatBengaliTime } from "@/lib/time-utils";
import { Appointment } from "@/types/appointment";

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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
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
      const response = await fetch(url, { cache: 'no-store' });
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

  const handleClearHistory = () => {
    if (appointments.some(a => a.status === 'completed' || a.status === 'cancelled')) {
      setShowClearConfirm(true);
    } else {
      showToast.error(language === 'bn' ? "মুছে ফেলার মতো কোনো ইতিহাস নেই" : "No history to clear");
    }
  };

  const confirmClearHistory = async () => {
    if (!user) return;
    
    try {
      setIsClearing(true);
      const response = await fetch(`/api/appointments?userId=${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success(language === 'bn' ? "ইতিহাস মুছে ফেলা হয়েছে" : "History cleared successfully");
        setAppointments(prev => prev.filter(app => app.status !== 'completed' && app.status !== 'cancelled'));
        fetchAppointments(user.id);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    } finally {
      setIsClearing(false);
      setShowClearConfirm(false);
    }
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
        setAppointments(prev => prev.map(app => 
          app._id === appointmentToCancel ? { ...app, status: 'cancelled' } : app
        ));
        fetchAppointments(user.id);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancellingId(null);
      setShowCancelConfirm(false);
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
      <DashboardHeader 
        language={language}
        user={user}
        myBookingsHistory={myBookingsHistory}
        isClearing={isClearing}
        onShowBookings={() => setShowBookingsModal(true)}
        onClearHistory={handleClearHistory}
      />

      <DashboardStats 
        language={language}
        stats={stats}
        toBengaliNumber={toBengaliNumber}
      />

      <AppointmentList 
        language={language}
        appointments={appointments}
        loading={loading}
        filter={filter}
        setFilter={setFilter}
        cancellingId={cancellingId}
        onCancel={handleCancelAppointment}
        formatDate={formatBengaliDate}
        formatTime={formatBengaliTime}
      />

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

      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearHistory}
        title={language === 'bn' ? 'ইতিহাস মুছে ফেলুন' : 'Clear History'}
        message={language === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি আপনার সকল সম্পন্ন এবং বাতিল অ্যাপয়েন্টমেন্টের ইতিহাস মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।' : 'Are you sure you want to clear your appointment history (completed and cancelled)? This action cannot be undone.'}
        confirmText={language === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Clear'}
        cancelText={language === 'bn' ? 'না' : 'No'}
        variant="danger"
        language={language}
      />
    </div>
  );
}
