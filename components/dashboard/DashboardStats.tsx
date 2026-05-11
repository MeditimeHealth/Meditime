"use client";

import { Card } from "@/components/ui/card";

interface DashboardStatsProps {
  language: "en" | "bn";
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  toBengaliNumber: (num: number) => string;
}

export default function DashboardStats({ language, stats, toBengaliNumber }: DashboardStatsProps) {
  const getDisplayValue = (num: number) => {
    return language === 'bn' ? toBengaliNumber(num) : num;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
        <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{getDisplayValue(stats.total)}</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'মোট' : 'Total'}</p>
      </Card>
      <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
        <p className="text-xl md:text-2xl font-bold text-yellow-600 mb-1">{getDisplayValue(stats.pending)}</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'অপেক্ষমান' : 'Pending'}</p>
      </Card>
      <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
        <p className="text-xl md:text-2xl font-bold text-green-600 mb-1">{getDisplayValue(stats.confirmed)}</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'নিশ্চিত' : 'Confirmed'}</p>
      </Card>
      <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm">
        <p className="text-xl md:text-2xl font-bold text-blue-600 mb-1">{getDisplayValue(stats.completed)}</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'সম্পন্ন' : 'Completed'}</p>
      </Card>
      <Card className="p-3 md:p-4 text-center bg-white border-slate-100 shadow-sm col-span-2 sm:col-span-1">
        <p className="text-xl md:text-2xl font-bold text-red-600 mb-1">{getDisplayValue(stats.cancelled)}</p>
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider">{language === 'bn' ? 'বাতিল' : 'Cancelled'}</p>
      </Card>
    </div>
  );
}
