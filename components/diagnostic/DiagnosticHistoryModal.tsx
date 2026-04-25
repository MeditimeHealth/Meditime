import { motion } from "framer-motion";
import { Activity, MapPin, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateDiagnosticBookingPDF } from "@/lib/diagnostic-pdf";

interface DiagnosticHistoryModalProps {
  language: string;
  showBookingsModal: boolean;
  setShowBookingsModal: (val: boolean) => void;
  myBookingsHistory: any[];
  setMyBookingsHistory: (val: any[]) => void;
}

export default function DiagnosticHistoryModal({
  language,
  showBookingsModal,
  setShowBookingsModal,
  myBookingsHistory,
  setMyBookingsHistory
}: DiagnosticHistoryModalProps) {
  if (!showBookingsModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#00B7B5]" />
            {language === 'en' ? 'My Booking History' : 'আমার বুকিং ইতিহাস'}
          </h2>
          <div className="flex items-center gap-2">
            {myBookingsHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1.5"
                onClick={() => {
                  if (confirm(language === 'en' ? 'Are you sure you want to clear all booking history?' : 'আপনি কি সমস্ত বুকিং ইতিহাস মুছে ফেলতে চান?')) {
                    localStorage.removeItem('myDiagnosticBookings');
                    setMyBookingsHistory([]);
                  }
                }}
              >
                <X className="w-3.5 h-3.5" />
                {language === 'en' ? 'Clear History' : 'ইতিহাস মুছুন'}
              </Button>
            )}
            <button onClick={() => setShowBookingsModal(false)} className="text-slate-400 hover:text-slate-600 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {myBookingsHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>{language === 'en' ? 'No bookings found in your history.' : 'আপনার ইতিহাসে কোনো বুকিং পাওয়া যায়নি।'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookingsHistory.map((booking: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-[#00B7B5]/30 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                          booking.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status || 'Pending'}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{new Date(booking.appointmentDate).toISOString().split('T')[0]}</span>
                        <span className="text-xs font-medium text-slate-400">ID: {booking.bookingId || booking._id?.slice(-8).toUpperCase() || 'N/A'}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-lg">{booking.tests?.map((t: any) => t.name).join(", ")}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0088FF]" /> 
                        {booking.venueId ? (booking.venueId.name || 'Hospital') : 'Hospital'}
                      </p>
                    </div>
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Due</p>
                        <p className="text-2xl font-black text-[#FF6B00]">৳{booking.totalPrice}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white text-xs"
                        onClick={() => generateDiagnosticBookingPDF(booking)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
