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
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden flex flex-col">
      {/* Header matching Invoice */}
      <div className="bg-primary text-white px-5 py-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            {language === 'en' ? "Selected Tests" : "নির্বাচিত টেস্টসমূহ"}
          </h3>
          <p className="text-white/60 text-xs mt-0.5">
            {bookedTests.length} {language === 'en' ? "tests added" : "টেস্ট যোগ করা হয়েছে"}
          </p>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          <Activity className="h-5 w-5 text-white" />
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Table Header Area */}
        <div className="flex text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-2">
          <div className="flex-1">{language === 'en' ? "Test Name" : "টেস্টের নাম"}</div>
          <div className="w-16 text-right pr-6">{language === 'en' ? "Amount" : "মূল্য"}</div>
        </div>

        <div className="space-y-0.5 mb-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {bookedTests.map((test) => (
            <div key={test._id} className="flex items-center justify-between py-2.5 border-b border-slate-50 hover:bg-slate-50 transition-colors px-1 rounded">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs font-bold text-slate-900 truncate">{getLocalizedValue(test.name, test.nameBn, language)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">৳{test.price || 0}</span>
                <button onClick={() => handleBooking(test)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-lg shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Totals Section */}
        <div className="mt-auto space-y-2 text-sm pt-4 border-t border-slate-200">
          <div className="flex justify-between text-slate-500">
            <span>{language === 'en' ? "Subtotal:" : "সাবটোটাল:"}</span>
            <span>৳{bookedTests.reduce((acc, curr) => acc + (curr.price || 0), 0)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between text-base font-bold text-[#004B50]">
            <span>{language === 'en' ? "Total Due:" : "সর্বমোট:"}</span>
            <span>৳{bookedTests.reduce((acc, curr) => acc + (curr.price || 0), 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
