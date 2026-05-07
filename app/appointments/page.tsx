"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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
} from "lucide-react";
import { showToast } from "@/lib/toast";
import Link from "next/link";

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    qualification?: string;
    department?: string;
    hospital?: string;
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

const getStatusBadge = (status: string) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const labels = {
    pending: "অপেক্ষমান",
    confirmed: "নিশ্চিত",
    cancelled: "বাতিল",
    completed: "সম্পন্ন",
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

const getPatientTypeLabel = (type: string) => {
  const labels = {
    old: "পুরাতন রোগী",
    new: "নতুন রোগী",
    report: "রিপোর্ট দেখানো",
  };
  return labels[type as keyof typeof labels] || type;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [user, setUser] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setUser(parsedData);
      fetchAppointments(parsedData.id);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
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
      } else {
        showToast.error(data.error || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      showToast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!user) return;

    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?")) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success("অ্যাপয়েন্টমেন্ট বাতিল করা হয়েছে");
        if (user) {
          fetchAppointments(user.id);
        }
      } else {
        showToast.error(data.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      showToast.error("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"

            >
              আমার অ্যাপয়েন্টমেন্ট
            </h1>
            <p
              className="text-gray-600"

            >
              আপনার সকল অ্যাপয়েন্টমেন্টের তালিকা দেখুন
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs text-gray-600">মোট</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.pending}</p>
              <p className="text-xs text-gray-600">অপেক্ষমান</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.confirmed}</p>
              <p className="text-xs text-gray-600">নিশ্চিত</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.completed}</p>
              <p className="text-xs text-gray-600">সম্পন্ন</p>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.cancelled}</p>
              <p className="text-xs text-gray-600">বাতিল</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap mb-6">
            {[
              { value: "all", label: "সব" },
              { value: "pending", label: "অপেক্ষমান" },
              { value: "confirmed", label: "নিশ্চিত" },
              { value: "completed", label: "সম্পন্ন" },
              { value: "cancelled", label: "বাতিল" },
            ].map((filterOption) => (
              <Button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                variant={filter === filterOption.value ? "default" : "outline"}
                className={filter === filterOption.value ? "bg-primary text-white" : ""}

              >
                {filterOption.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </Card>
          ) : appointments.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p
                className="text-gray-500 text-lg mb-4"

              >
                কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি
              </p>
              <Link href="/doctor">
                <Button>
                  নতুন অ্যাপয়েন্টমেন্ট করুন
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {appointments.map((appointment) => (
                <Card key={appointment._id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Side - Doctor Info */}
                    <div className="flex-shrink-0">
                      <Link href={`/doctor/${appointment.doctorId._id}`}>
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors cursor-pointer">
                          {appointment.doctorId.image ? (
                            <Image
                              src={appointment.doctorId.image}
                              alt={appointment.doctorId.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white text-2xl font-bold">
                              {appointment.doctorId.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>

                    {/* Middle - Appointment Details */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/doctor/${appointment.doctorId._id}`}>
                            <h3
                              className="text-xl font-bold text-gray-900 mb-1 hover:text-primary transition-colors cursor-pointer"

                            >
                              {appointment.doctorId?.name || "Unknown Doctor"}
                            </h3>
                          </Link>
                          {appointment.doctorId?.qualification && (
                            <p className="text-sm text-gray-600">
                              {appointment.doctorId.qualification}
                              {appointment.doctorId.department && `, ${appointment.doctorId.department}`}
                            </p>
                          )}
                          {appointment.doctorId?.hospital && (
                            <p className="text-sm text-gray-500">
                              {appointment.doctorId.hospital}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">তারিখ</p>
                            <p
                              className="font-semibold text-gray-900"

                            >
                              {formatDate(appointment.appointmentDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">সময়</p>
                            <p
                              className="font-semibold text-gray-900"

                            >
                              {formatTime(appointment.appointmentTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">হাসপাতাল</p>
                            <p
                              className="font-semibold text-gray-900"

                            >
                              {appointment.hospitalName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Stethoscope className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">রোগীর ধরন</p>
                            <p
                              className="font-semibold text-gray-900"

                            >
                              {getPatientTypeLabel(appointment.patientType)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">রোগীর নাম</p>
                            <p
                              className="font-semibold text-gray-900"

                            >
                              {appointment.patientName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">মোবাইল</p>
                            <p className="font-semibold text-gray-900">
                              {appointment.mobileNumber}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Booking Date */}
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          বুকিং তারিখ: {formatDate(appointment.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col gap-2 lg:min-w-[150px]">
                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <Button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={cancellingId === appointment._id}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"

                        >
                          {cancellingId === appointment._id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              বাতিল হচ্ছে...
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              বাতিল করুন
                            </>
                          )}
                        </Button>
                      )}
                      <Link href={`/doctor/${appointment.doctorId._id}`}>
                        <Button
                          variant="outline"
                          className="w-full"

                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          ডাক্তার দেখুন
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

