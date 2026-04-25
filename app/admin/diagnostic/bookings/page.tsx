"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  Loader2, 
  Search, 
  X,
  Eye,
  Activity,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";

const ITEMS_PER_PAGE = 10;

export default function AdminDiagnosticBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/diagnostic/bookings", window.location.origin);
      if (searchQuery) url.searchParams.set("search", searchQuery);
      if (statusFilter) url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showToast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/diagnostic/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast.success("Status updated successfully");
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
        if (selectedBooking?._id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      } else {
        showToast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast.error("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      setIsUpdating(true);
      const res = await fetch("/api/admin/diagnostic/bookings", {
        method: "DELETE"
      });

      if (res.ok) {
        showToast.success("All booking history has been cleared.");
        setBookings([]);
        setShowDeleteConfirm(false);
      } else {
        showToast.error("Failed to clear history.");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      showToast.error("An error occurred while clearing history."); 
    } finally {
      setIsUpdating(false);
    }
  }; 

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchBookings();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Accepted': return 'bg-[#00B7B5]/10 text-[#00B7B5] border-[#00B7B5]/20';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/20'; // Pending
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Diagnostic Bookings</h1>
          <p className="text-gray-500 text-sm">View all lab test bookings and records.</p>
          <Button 
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            size="sm"
            disabled={bookings.length === 0 || isUpdating}
            className="mt-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-2 h-8"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B7B5] focus:border-transparent text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B7B5] text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Booking ID</th>
                <th className="px-6 py-4 font-medium">Patient Info</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Venue</th>
                <th className="px-6 py-4 font-medium">Total Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Affiliated By</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading records...
                  </td>
                </tr>
              ) : paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#00B7B5]">
                        {booking.bookingId || `#MDT-OLD-${booking._id.slice(-6).toUpperCase()}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{booking.patientName}</div>
                      <div className="text-gray-500 text-xs">{booking.mobileNumber}</div>
                      <div className="text-gray-400 text-[10px] uppercase mt-1 tracking-wider">{booking.patientType} Patient</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">
                        {format(new Date(booking.appointmentDate), "MMM dd, yyyy")}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Booked: {format(new Date(booking.createdAt), "dd/MM/yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{booking.venueId?.name || 'Unknown Venue'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">৳{booking.totalPrice}</div>
                      <div className="text-xs text-gray-500">{booking.tests?.length || 0} Test(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                        disabled={isUpdating}
                        className={`px-3 py-1 rounded-full text-xs font-bold border focus:ring-2 focus:ring-[#00B7B5] cursor-pointer outline-none transition-all ${getStatusColor(booking.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{booking.affiliateCode || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedBooking(booking)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, bookings.length)}</strong> of <strong>{bookings.length}</strong> bookings
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-8 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, currentPage - 3),
                Math.min(totalPages, currentPage + 2)
              ).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-[#00B7B5] text-white' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-8 px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Booking Details Modal (View Only) */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00B7B5]" />
                Booking Details <span className="text-sm font-normal text-gray-400">({selectedBooking.bookingId})</span>
              </h2>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Patient Details</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                    <p><span className="text-gray-500 w-20 inline-block">Name:</span> <strong>{selectedBooking.patientName}</strong></p>
                    <p><span className="text-gray-500 w-20 inline-block">Mobile:</span> {selectedBooking.mobileNumber}</p>
                    <p><span className="text-gray-500 w-20 inline-block">Type:</span> <span className="capitalize">{selectedBooking.patientType}</span></p>
                    {selectedBooking.age && <p><span className="text-gray-500 w-20 inline-block">Age:</span> {selectedBooking.age}</p>}
                    {selectedBooking.gender && <p><span className="text-gray-500 w-20 inline-block">Gender:</span> <span className="capitalize">{selectedBooking.gender}</span></p>}
                    <p><span className="text-gray-500 w-20 inline-block">Affiliated:</span> <strong className="text-[#00B7B5]">{selectedBooking.affiliateCode || 'None'}</strong></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Appointment</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                    <p><span className="text-gray-500 w-20 inline-block">Status:</span> 
                      <select 
                        value={selectedBooking.status}
                        onChange={(e) => handleStatusUpdate(selectedBooking._id, e.target.value)}
                        disabled={isUpdating}
                        className={`ml-1 px-2 py-0.5 rounded text-xs font-bold border focus:ring-2 focus:ring-[#00B7B5] cursor-pointer outline-none ${getStatusColor(selectedBooking.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </p>
                    <p><span className="text-gray-500 w-20 inline-block">Date:</span> <strong>{format(new Date(selectedBooking.appointmentDate), "MMM dd, yyyy")}</strong></p>
                    <p><span className="text-gray-500 w-20 inline-block">Venue:</span> {selectedBooking.venueId?.name}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Selected Tests ({selectedBooking.tests?.length || 0})</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 font-medium text-left">Test Name</th>
                        <th className="px-4 py-2 font-medium text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedBooking.tests?.map((test: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3">{test.name}</td>
                          <td className="px-4 py-3 text-right">৳{test.price}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-right">Total</td>
                        <td className="px-4 py-3 text-right text-[#00B7B5]">৳{selectedBooking.totalPrice}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Clear All History?</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  You are about to <span className="text-red-600 font-bold underline">permanently delete all diagnostic booking history</span>. This action is irreversible. All patient records in the system will be lost.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 h-14 rounded-xl border-gray-200 hover:bg-gray-50 font-bold text-gray-700"
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleClearHistory}
                    disabled={isUpdating}
                    className="flex-1 h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Yes, Delete All"
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-red-600 h-2 w-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
