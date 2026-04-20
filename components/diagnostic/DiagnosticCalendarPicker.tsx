import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { showToast } from "@/lib/toast";

const banglaDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const banglaMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const toBengaliNumber = (num: number): string => {
  return num.toString();
};

const getDayName = (date: Date): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

interface DiagnosticCalendarPickerProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
}

export default function DiagnosticCalendarPicker({
  selectedDate,
  setSelectedDate
}: DiagnosticCalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isDateAvailable = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const handleDateSelect = (date: Date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    }
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const calendarDays = getCalendarDays();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const maxYear = todayMonth === 11 ? todayYear + 1 : todayYear;
  const maxMonth = todayMonth === 11 ? 0 : todayMonth + 1;

  const isPrevDisabled = 
    currentYear < todayYear ||
    (currentYear === todayYear && currentMonthIndex <= todayMonth);

  const isNextDisabled =
    currentYear > maxYear ||
    (currentYear === maxYear && currentMonthIndex >= maxMonth);

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-orange-50 border-2 border-[#FF6B00]/20 shadow-xl">
      <h2
        className="text-2xl font-bold text-gray-900 mb-5"
        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
      >
        Select Date
      </h2>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeMonth(-1)}
          type="button"
          disabled={isPrevDisabled}
          className={`p-2 rounded-lg transition-colors ${isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#FF6B00]/10'}`}
        >
          <ArrowLeft className="h-5 w-5 text-[#FF6B00]" />
        </button>
        <h3
          className="text-xl font-bold text-gray-900"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          {banglaMonths[currentMonthIndex]} {toBengaliNumber(currentYear)}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          type="button"
          disabled={isNextDisabled}
          className={`p-2 rounded-lg transition-colors ${isNextDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#FF6B00]/10'}`}
        >
          <ArrowLeft className="h-5 w-5 text-[#FF6B00] rotate-180" />
        </button>
      </div>

      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {banglaDays.map((day, index) => (
          <div
            key={index}
            className="text-center font-semibold text-gray-700 py-2"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="aspect-square" />;
          }

          const isAvailable = isDateAvailable(date);
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (isAvailable) {
                  handleDateSelect(date);
                } else {
                  showToast.error("You cannot select a past date");
                }
              }}
              disabled={!isAvailable}
              className={`aspect-square rounded-full transition-all font-semibold flex items-center justify-center ${
                isSelected
                  ? "text-white shadow-lg scale-110 ring-4 ring-orange-300 bg-[#FF6B00]"
                  : isAvailable
                  ? "bg-white text-slate-700 border border-slate-200 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:shadow-md"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-transparent"
              } ${isToday && !isSelected && !isAvailable ? "ring-2 ring-gray-400" : ""}`}
              style={{ 
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              {toBengaliNumber(date.getDate())}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-[#FF6B00]/10 rounded-xl border-2 border-[#FF6B00]/20">
          <p
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            Selected Date: {getDayName(selectedDate)}, {selectedDate.getDate()} {banglaMonths[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
          </p>
        </div>
      )}
    </Card>
  );
}
