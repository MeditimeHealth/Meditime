import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { useState } from "react";
import { Card } from "../ui/card";
import { ArrowLeft } from "lucide-react";
import { showToast } from "@/lib/toast";

const getDayName = (date: Date, language: 'en' | 'bn'): string => {
  const dayIndex = date.getDay();
  return t(`day_long_${dayIndex}` as any, language);
};

const convertToBengaliNumber = (num: number | string, language: 'en' | 'bn'): string => {
  const str = num.toString();
  if (language === 'en') return str;
  const englishDigits = '0123456789'.split('');
  const bengaliDigits = '0123456789'.split('');
  return str.split('').map(digit => {
    const index = englishDigits.indexOf(digit);
    return index !== -1 ? bengaliDigits[index] : digit;
  }).join('');
};

interface DiagnosticCalendarPickerProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
}

export default function DiagnosticCalendarPicker({
  selectedDate,
  setSelectedDate
}: DiagnosticCalendarPickerProps): React.JSX.Element {
  const { language } = useLanguage();
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
  // Precompute the next 2 available dates starting today
  const latestAvailableDates = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return [today.toDateString(), tomorrow.toDateString()];
  })();

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-2 border-primary/20 shadow-xl">
      <h2
        className="text-2xl font-bold text-gray-900 mb-5"
      >
        {t("selectDate", language)}
      </h2>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeMonth(-1)}
          type="button"
          disabled={isPrevDisabled}
          className={`p-2 rounded-lg transition-colors ${isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10'}`}
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </button>
        <h3
          className="text-xl font-bold"
        >
          {t(`month_${currentMonthIndex}` as any, language)} {convertToBengaliNumber(currentYear, language)}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          type="button"
          disabled={isNextDisabled}
          className={`p-2 rounded-lg transition-colors ${isNextDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-primary/10'}`}
        >
          <ArrowLeft className="h-5 w-5 text-primary rotate-180" />
        </button>
      </div>

      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 gap-3 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => (
          <div
            key={dayIndex}
            className="text-center font-semibold text-gray-700 py-2"
          >
            {t(`day_${dayIndex}` as any, language)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3 lg:gap-6">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={index} className="aspect-square" />;
          }

          const isAvailable = isDateAvailable(date);
          const isSuggested = isAvailable && latestAvailableDates.includes(date.toDateString());
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
                  showToast.error(t("pastDateError", language));
                }
              }}
              disabled={!isAvailable}
              className={`aspect-square rounded-full transition-all font-semibold flex items-center justify-center md:text-2xl text-sm ${isSelected
                  ? "bg-primary text-white"
                  : isAvailable
                    ? "bg-primary/10 text-primary border-none hover:bg-primary/20 hover:scale-105"
                    : isAvailable
                      ? "bg-white text-primary border-2 border-primary hover:bg-primary/5 hover:scale-105"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed border-none"
                } ${!isSelected && !isAvailable ? "ring-2 ring-gray-400" : ""}`}
            >
              {convertToBengaliNumber(date.getDate(), language)}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
          <p
            className="text-lg font-semibold text-gray-900"
          >
            {t("selectedDatePrefix", language)} {getDayName(selectedDate, language)}, {convertToBengaliNumber(selectedDate.getDate(), language)} {t(`month_${selectedDate.getMonth()}` as any, language)}, {convertToBengaliNumber(selectedDate.getFullYear(), language)}
          </p>
        </div>
      )}
    </Card>
  );
}
