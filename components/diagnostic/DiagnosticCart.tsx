import { Activity, X } from "lucide-react";
import { BookedTest } from "@/types/diagnostic";
import { getLocalizedValue, Language } from "@/contexts/LanguageContext";

interface DiagnosticCartProps {
  bookedTests: BookedTest[];
  language: Language;
  handleBooking: (test: BookedTest) => void;
}

export default function DiagnosticCart({
  bookedTests,
  language,
  handleBooking,
}: DiagnosticCartProps) {
  if (bookedTests.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#FF6B00]/20 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="p-1.5 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg">
          <Activity className="h-4 w-4" />
        </div>
        {language === 'en' ? "Selected Tests" : "নির্বাচিত টেস্টসমূহ"}
        <span className="ml-auto text-xs font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-1 rounded-md">{bookedTests.length}</span>
      </h3>
      
      <div className="space-y-3 mb-1 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {bookedTests.map((test) => (
          <div key={test._id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-xs font-bold text-slate-900 truncate">{getLocalizedValue(test.name, test.nameBn, language)}</p>
              {test.price && <p className="text-[10px] font-bold text-green-600 mt-0.5">৳{test.price}</p>}
            </div>
            <button onClick={() => handleBooking(test)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Total */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
        <span className="text-sm font-bold text-slate-500">{language === 'en' ? "Total:" : "সর্বমোট:"}</span>
        <span className="text-lg font-black text-slate-900">
          ৳{bookedTests.reduce((acc, curr) => acc + (curr.price || 0), 0)}
        </span>
      </div>
    </div>
  );
}
