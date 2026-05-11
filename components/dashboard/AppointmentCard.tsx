"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Stethoscope, 
  FileText, 
  Loader2, 
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { Appointment } from "@/types/appointment";

interface AppointmentCardProps {
  appointment: Appointment;
  language: "en" | "bn";
  cancellingId: string | null;
  onCancel: (id: string) => void;
  formatDate: (date: string) => string;
  formatTime: (time?: string) => string;
}

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
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status as keyof typeof styles] || styles.pending}`}>
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

export default function AppointmentCard({
  appointment,
  language,
  cancellingId,
  onCancel,
  formatDate,
  formatTime,
}: AppointmentCardProps) {
  return (
    <Card className="p-4 md:p-5 hover:shadow-md transition-shadow border-slate-100">
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
          <div className="flex flex-col gap-1 flex-1 min-w-0 lg:hidden">
          
            <p className="text-xs text-primary font-bold">
              {language === 'bn' 
                ? (appointment.doctorId?.name || appointment.doctorId?.nameBn) 
                : (appointment.doctorId?.name || appointment.doctorId?.nameBn)}
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium line-clamp-1">
              {language === 'bn' 
                ? (appointment.doctorId?.qualificationBn || appointment.doctorId?.qualification) 
                : (appointment.doctorId?.qualification || appointment.doctorId?.qualificationBn)}
            </p>
          </div>
          <div className="lg:hidden shrink-0">
            {getStatusBadge(appointment.status, language)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="hidden lg:flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'bn' 
                  ? (appointment.doctorId?.nameBn || appointment.doctorId?.name || 'ডাক্তার') 
                  : (appointment.doctorId?.name || appointment.doctorId?.nameBn || 'Doctor')}
              </h3>
              <p className="text-sm text-primary font-bold">
                {language === 'bn' 
                  ? (appointment.doctorId?.specialtyBn || appointment.doctorId?.specialty) 
                  : (appointment.doctorId?.specialty || appointment.doctorId?.specialtyBn)}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {language === 'bn' 
                  ? (appointment.doctorId?.qualificationBn || appointment.doctorId?.qualification) 
                  : (appointment.doctorId?.qualification || appointment.doctorId?.qualificationBn)}
                {language === 'bn' 
                  ? ((appointment.doctorId?.departmentBn || appointment.doctorId?.department) && ` • ${appointment.doctorId.departmentBn || appointment.doctorId.department}`)
                  : ((appointment.doctorId?.department || appointment.doctorId?.departmentBn) && ` • ${appointment.doctorId.department || appointment.doctorId.departmentBn}`)}
              </p>
            </div>
            {getStatusBadge(appointment.status, language)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-3 md:gap-y-4 gap-x-4 md:gap-x-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-gray-700">
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
              <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                {appointment.hospitalName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
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
          <Link href={`/user/appointments/${appointment._id}`} className="flex-1 lg:flex-none">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 md:h-10 px-3 md:px-4 rounded-xl font-bold border-primary/20 text-primary hover:bg-primary/5 text-xs md:text-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'বিস্তারিত' : 'Details'}
            </Button>
          </Link>
  <Link href={`/doctor/${appointment.doctorId._id}`} className="flex-1 lg:flex-none">
            <Button variant="outline" size="sm" className="w-full h-9 md:h-10 px-3 md:px-4 rounded-xl font-bold border-slate-200 text-xs md:text-sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'ডাক্তার' : 'Doctor'}
            </Button>
          </Link>
          {(appointment.status === "pending" || appointment.status === "confirmed") && (
            <Button
              onClick={() => onCancel(appointment._id)}
              disabled={cancellingId === appointment._id}
              variant="ghost"
              className="flex-1 lg:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 h-9 md:h-10 px-3 md:px-4 rounded-xl font-bold text-xs md:text-sm"
              size="sm"
            >
              {cancellingId === appointment._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
          )}
        
        </div>
      </div>
    </Card>
  );
}
