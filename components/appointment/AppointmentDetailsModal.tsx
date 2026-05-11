"use client";

import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Printer, 
  Clock, 
  CreditCard 
} from "lucide-react";
import Image from "next/image";
import { getLocalizedValue } from "@/contexts/LanguageContext";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  language: "en" | "bn";
}

const toBengaliNumber = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map((d) => bengaliDigits[parseInt(d)] ?? d).join("");
};

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const englishMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const englishDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const formatDate = (dateString: string, language: "en" | "bn"): string => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayNum = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  if (language === "bn") {
    return `${banglaDays[day]}, ${toBengaliNumber(dayNum)} ${banglaMonths[month]}, ${toBengaliNumber(year)}`;
  }
  return `${englishDays[day]}, ${dayNum} ${englishMonths[month]}, ${year}`;
};

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  language
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const handlePrint = () => {
    const printContent = document.getElementById("appointment-slip-print");
    if (!printContent) return;

    const win = window.open("", "", "width=800,height=900");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Appointment Slip - Meditime</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: auto; margin: 0; }
              body { margin: 0; padding: 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="max-w-xl mx-auto">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const doc = appointment.doctorId || {};

  const translations = {
    slipTitle: { en: "Appointment Slip", bn: "অ্যাপয়েন্টমেন্ট স্লিপ" },
    serialNumber: { en: "Serial Number", bn: "সিরিয়াল নম্বর" },
    doctorInfo: { en: "Doctor Information", bn: "ডাক্তারের তথ্য" },
    patientInfo: { en: "Patient Information", bn: "রোগীর তথ্য" },
    patientName: { en: "Patient Name", bn: "রোগীর নাম" },
    mobileNumber: { en: "Mobile Number", bn: "মোবাইল নম্বর" },
    appointmentDate: { en: "Appointment Date", bn: "অ্যাপয়েন্টমেন্টের তারিখ" },
    hospital: { en: "Chamber / Hospital", bn: "চেম্বার / হাসপাতাল" },
    patientType: { en: "Patient Type", bn: "রোগীর ধরন" },
    status: { en: "Status", bn: "স্ট্যাটাস" },
    gender: { en: "Gender", bn: "লিঙ্গ" },
    age: { en: "Age", bn: "বয়স" },
    years: { en: "Years", bn: "বছর" },
    print: { en: "Print Slip", bn: "স্লিপ প্রিন্ট করুন" },
    importantInfo: { en: "Important Information", bn: "গুরুত্বপূর্ণ তথ্য" },
    note1: { en: "Be present on time on the appointment date", bn: "অ্যাপয়েন্টমেন্টের তারিখে সময়মতো উপস্থিত থাকুন" },
    note2: { en: "Keep this slip printed or take a screenshot", bn: "এই স্লিপটি প্রিন্ট করে বা স্ক্রিনশট নিয়ে সাথে রাখুন" },
    note3: { en: "Pay at the chamber — no advance payment needed", bn: "চেম্বারে গিয়ে পেমেন্ট করুন — কোনো অগ্রিম পেমেন্ট নেই" },
  };

  const t = translations;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={language === 'bn' ? 'অ্যাপয়েন্টমেন্টের বিস্তারিত' : 'Appointment Details'} maxWidth="max-w-2xl">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
        <div id="appointment-slip-print">
          <Card className="bg-white border-2 border-slate-100 overflow-hidden shadow-xl">
            {/* Slip Header */}
            <div className="bg-gradient-to-r from-primary to-teal-600 px-6 py-6 text-center text-white">
              <h3 className="font-bold text-2xl tracking-tight">MediTime</h3>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider mt-1">
                {t.slipTitle[language]}
              </p>
              {appointment.serialNumber && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                    {t.serialNumber[language]}
                  </p>
                  <p className="font-mono font-bold text-3xl">{appointment.serialNumber}</p>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Information */}
              <div className="pb-5 border-b border-dashed border-slate-200">
                <p className="text-[11px] text-primary font-bold uppercase tracking-widest mb-3">
                  {t.doctorInfo[language]}
                </p>
                <div className="flex items-start gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xl leading-tight mb-1">
                      {getLocalizedValue(doc.name, doc.nameBn, language)}
                    </p>
                    <p className="text-sm text-primary font-semibold mb-1">
                      {language === 'bn' 
                        ? (doc.specialtyBn || doc.specialty) 
                        : (doc.specialty || doc.specialtyBn)}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      {language === 'bn' 
                        ? (doc.qualificationBn || doc.qualification) 
                        : (doc.qualification || doc.qualificationBn)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <p className="text-[11px] text-primary font-bold uppercase tracking-widest mb-4">
                  {t.patientInfo[language]}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {t.patientName[language]}
                    </p>
                    <p className="font-bold text-slate-800 text-sm">{appointment.patientName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {t.appointmentDate[language]}
                    </p>
                    <p className="font-bold text-slate-800 text-sm">{formatDate(appointment.appointmentDate, language)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {t.mobileNumber[language]}
                    </p>
                    <p className="font-bold text-slate-800 text-sm">{appointment.mobileNumber}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      {t.hospital[language]}
                    </p>
                    <p className="font-bold text-slate-800 text-sm">{appointment.hospitalName}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Button onClick={handlePrint} className="w-full h-12 rounded-xl gap-2 font-bold shadow-lg">
            <Printer className="w-5 h-5" />
            {t.print[language]}
          </Button>

          <Card className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-600" />
              {t.importantInfo[language]}
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{t.note1[language]}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{t.note2[language]}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span>{t.note3[language]}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </Modal>
  );
}
