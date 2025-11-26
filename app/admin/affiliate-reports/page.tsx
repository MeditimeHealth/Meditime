"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Download,
  Calendar as CalendarIcon,
  Loader2
} from "lucide-react";

interface Summary {
  totalAffiliates: number;
  totalAffiliateAppointments: number;
  monthlyAppointments: number;
  monthlyCommissions: {
    total: number;
    count: number;
  };
  pendingCommissions: {
    total: number;
    count: number;
  };
  pendingWithdrawals: {
    total: number;
    count: number;
  };
}

interface MonthlyReport {
  affiliateId: string;
  name: string;
  affiliateCode: string;
  email: string;
  phoneNumber: string;
  bookingsThisMonth: number;
  earnedThisMonth: number;
  pendingAmount: number;
  walletBalance: number;
  totalEarned: number;
}

export default function AffiliateReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryRes = await fetch('/api/admin/reports/affiliate-summary');
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        setSummary(summaryData.summary);
      }

      // Fetch monthly report
      const reportRes = await fetch(
        `/api/admin/reports/affiliate-monthly?month=${selectedMonth}&year=${selectedYear}`
      );
      const reportData = await reportRes.json();
      if (reportRes.ok) {
        setMonthlyReport(reportData.report);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (monthlyReport.length === 0) return;

    const headers = [
      'Affiliate Name',
      'Code',
      'Email',
      'Phone',
      'Bookings',
      'Earned',
      'Pending',
      'Balance',
      'Total Earned'
    ];

    const rows = monthlyReport.map((item) => [
      item.name,
      item.affiliateCode,
      item.email,
      item.phoneNumber,
      item.bookingsThisMonth,
      item.earnedThisMonth.toFixed(2),
      item.pendingAmount.toFixed(2),
      item.walletBalance.toFixed(2),
      item.totalEarned.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `affiliate-report-${selectedYear}-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const stats = summary ? [
    {
      icon: Users,
      title: 'Total Affiliates',
      value: summary.totalAffiliates.toString(),
      bgColor: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-600',
    },
    {
      icon: CalendarIcon,
      title: 'Monthly Appointments',
      value: summary.monthlyAppointments.toString(),
      bgColor: 'from-purple-500/10 to-purple-600/10',
      iconColor: 'text-purple-600',
    },
    {
      icon: DollarSign,
      title: 'Monthly Commissions',
      value: `৳${summary.monthlyCommissions.total.toLocaleString()}`,
      subtitle: `${summary.monthlyCommissions.count} commissions`,
      bgColor: 'from-green-500/10 to-green-600/10',
      iconColor: 'text-green-600',
    },
    {
      icon: Clock,
      title: 'Pending Commissions',
      value: `৳${summary.pendingCommissions.total.toLocaleString()}`,
      subtitle: `${summary.pendingCommissions.count} pending`,
      bgColor: 'from-orange-500/10 to-orange-600/10',
      iconColor: 'text-orange-600',
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Reports</h1>
          <p className="text-gray-600 mt-1">Performance analytics and insights</p>
        </div>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 bg-gradient-to-br ${stat.bgColor} border-none shadow-lg`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`p-3 rounded-lg bg-white/50 ${stat.iconColor}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Monthly Report */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Monthly Performance Report</h2>
              
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <Button onClick={exportToCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Affiliate</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Bookings</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Earned</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Pending</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Balance</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No data available for selected period
                      </td>
                    </tr>
                  ) : (
                    monthlyReport.map((item) => (
                      <tr key={item.affiliateId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{item.affiliateCode}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{item.bookingsThisMonth}</td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          ৳{item.earnedThisMonth.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-orange-600">
                          ৳{item.pendingAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          ৳{item.walletBalance.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          ৳{item.totalEarned.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
