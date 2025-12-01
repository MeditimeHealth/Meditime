"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AppointmentReport {
  _id: string;
  patientName: string;
  mobileNumber: string;
  doctor: string;
  department: string;
  hospital: string;
  affiliateType: "Affiliate" | "Self";
  affiliateCode: string | null;
  affiliateName: string | null;
  appointmentDate: string;
  commissionAmount: number;
  commissionStatus: string | null;
  serialNumber?: string;
}

interface ReportStats {
  total: number;
  affiliate: number;
  self: number;
  totalEarned: number;
}

export default function CompletedAppointmentsReportPage() {
  const [appointments, setAppointments] = useState<AppointmentReport[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [affiliateFilter, setAffiliateFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [sortField, setSortField] = useState<string>("appointmentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<AppointmentReport | null>(null);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear, affiliateFilter]);

  useEffect(() => {
    applyFilters();
  }, [appointments, searchTerm, affiliateFilter, sortField, sortDirection]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedYear) params.append("year", selectedYear);
      if (affiliateFilter !== "all") params.append("affiliateFilter", affiliateFilter);

      const response = await fetch(
        `/api/admin/reports/completed-appointments?${params}`
      );
      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
        setStats(data.stats || null);
        setMonthlyBreakdown(data.monthlyBreakdown || {});
      } else {
        showToast.error(data.error || "Failed to fetch report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      showToast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.patientName.toLowerCase().includes(term) ||
          app.doctor.toLowerCase().includes(term) ||
          app.hospital.toLowerCase().includes(term) ||
          app.mobileNumber.includes(term) ||
          (app.affiliateCode && app.affiliateCode.toLowerCase().includes(term))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "patientName":
          aValue = a.patientName;
          bValue = b.patientName;
          break;
        case "doctor":
          aValue = a.doctor;
          bValue = b.doctor;
          break;
        case "hospital":
          aValue = a.hospital;
          bValue = b.hospital;
          break;
        case "commissionAmount":
          aValue = a.commissionAmount;
          bValue = b.commissionAmount;
          break;
        case "appointmentDate":
        default:
          aValue = new Date(a.appointmentDate).getTime();
          bValue = new Date(b.appointmentDate).getTime();
          break;
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });

    setFilteredAppointments(filtered);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Patient",
      "Mobile",
      "Doctor",
      "Department",
      "Hospital",
      "Affiliate/Self",
      "Affiliate Code",
      "Affiliate Name",
      "Appointment Date",
      "Serial Number",
      "Earn (৳)",
      "Commission Status",
    ];

    const rows = filteredAppointments.map((app) => [
      app.patientName,
      app.mobileNumber,
      app.doctor,
      app.department,
      app.hospital,
      app.affiliateType,
      app.affiliateCode || "",
      app.affiliateName || "",
      format(new Date(app.appointmentDate), "yyyy-MM-dd"),
      app.serialNumber || "",
      app.commissionAmount.toFixed(2),
      app.commissionStatus || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `completed-appointments-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast.success("CSV downloaded successfully");
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const totalEarned = useMemo(() => {
    return filteredAppointments.reduce(
      (sum, app) => sum + app.commissionAmount,
      0
    );
  }, [filteredAppointments]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            সম্পন্ন অ্যাপয়েন্টমেন্ট রিপোর্ট
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Completed Appointments Report
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReport} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Completed</p>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Affiliate</p>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.affiliate}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Self</p>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.self}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Earned</p>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ৳{totalEarned.toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label>Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search patient, doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label>Affiliate Type</Label>
            <Select
              value={affiliateFilter}
              onChange={(e) => setAffiliateFilter(e.target.value)}
              className="mt-1"
            >
              <option value="all">All</option>
              <option value="affiliate">Affiliate</option>
              <option value="self">Self</option>
            </Select>
          </div>

          <div>
            <Label>Month</Label>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Year</Label>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mt-1"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                setSearchTerm("");
                setAffiliateFilter("all");
                setSelectedMonth("");
                setSelectedYear("");
              }}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("patientName")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Patient
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("doctor")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Doctor
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  Department
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("hospital")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Hospital
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  Affiliate/Self
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("appointmentDate")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  <button
                    onClick={() => handleSort("commissionAmount")}
                    className="flex items-center gap-1 hover:text-gray-900"
                  >
                    Earn (৳)
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">
                  View Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No completed appointments found</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.mobileNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {appointment.doctor}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {appointment.department}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {appointment.hospital}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.affiliateType === "Affiliate"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.affiliateType}
                      </span>
                      {appointment.affiliateCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          {appointment.affiliateCode}
                        </div>
                      )}
                      {appointment.affiliateName && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {appointment.affiliateName}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {format(new Date(appointment.appointmentDate), "MMM dd, yyyy")}
                    </td>
                    <td className="py-4 px-6 text-center text-sm font-semibold text-emerald-600">
                      ৳{appointment.commissionAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(appointment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Invoice Details</DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">Patient Name</p>
                                  <p className="font-medium">{selectedInvoice.patientName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Mobile</p>
                                  <p className="font-medium">{selectedInvoice.mobileNumber}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Doctor</p>
                                  <p className="font-medium">{selectedInvoice.doctor}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Department</p>
                                  <p className="font-medium">{selectedInvoice.department}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Hospital</p>
                                  <p className="font-medium">{selectedInvoice.hospital}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Appointment Date</p>
                                  <p className="font-medium">
                                    {format(
                                      new Date(selectedInvoice.appointmentDate),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Type</p>
                                  <p className="font-medium">{selectedInvoice.affiliateType}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Commission</p>
                                  <p className="font-medium text-emerald-600">
                                    ৳{selectedInvoice.commissionAmount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Monthly Report Summary */}
      {Object.keys(monthlyBreakdown).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Month</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm">Total Earned (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(monthlyBreakdown)
                  .sort(([a], [b]) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateB.getTime() - dateA.getTime();
                  })
                  .map(([month, amount]) => (
                    <tr key={month} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 text-sm text-gray-900">{month}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-emerald-600">
                        ৳{amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">Total</td>
                  <td className="py-3 px-4 text-sm text-right font-bold text-emerald-600">
                    ৳{Object.values(monthlyBreakdown).reduce((sum, amt) => sum + amt, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Showing {filteredAppointments.length} of {appointments.length} appointments</p>
            {stats && (
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Affiliate: {stats.affiliate}</span>
                <span>Self: {stats.self}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-600">
              ৳{totalEarned.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
