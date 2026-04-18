import React, { forwardRef } from "react";
import { CheckCircle2, AlertCircle, X, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookedTest } from "@/types/diagnostic";
import { getLocalizedValue, Language } from "@/contexts/LanguageContext";

interface DiagnosticTestListProps {
  language: Language;
  totalTests: number;
  tests: any[];
  bookedTests: BookedTest[];
  handleBooking: (test: any) => void;
  loading: boolean;
  t: any;
}

const DiagnosticTestList = forwardRef<HTMLDivElement, DiagnosticTestListProps>(
  ({ language, totalTests, tests, bookedTests, handleBooking, loading, t }, ref) => {
    return (
      <div className="flex-1 lg:w-3/4">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">{language === 'en' ? 'Popular Tests' : 'জনপ্রিয় টেস্টসমূহ'}</h2>
          <span className="text-sm font-medium text-[#00B7B5]">{totalTests} {language === 'en' ? 'tests found' : 'টি টেস্ট পাওয়া গেছে'}</span>
        </div>

        <div className="space-y-4">
          {tests.length > 0 ? (
            <>
              {tests.map((test, i) => (
                <Card key={`${test._id || i}`} className="p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="text-lg font-bold text-slate-900">{getLocalizedValue(test.name, test.nameBn, language)}</h4>
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                          {getLocalizedValue(test.category, test.categoryBn, language) || t.categories.blood}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                        {getLocalizedValue(test.description, test.descriptionBn, language) || `${getLocalizedValue(test.name, test.nameBn, language)} analysis and measurement`}
                      </p>
                      <div className="flex gap-4 text-xs font-semibold text-slate-500 items-center">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0088FF]" /> {t.categories.blood}
                        </div>
                        {(test.fastingRequired || i % 2 === 0) && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> {t.fastingRequired}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-center gap-3 min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Starting price</span>
                        <div className="flex items-start md:justify-end gap-1 text-slate-900 font-black text-3xl">
                          <span className="text-lg text-green-500 mt-1">৳</span>{test.price}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleBooking(test)}
                        className={`w-full ${bookedTests.some(t => t._id === test._id) ? 'bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-200' : 'bg-[#0088FF] hover:bg-[#0088FF]/90 text-white'} font-bold rounded-xl gap-2 h-11 transition-all`}
                      >
                        {bookedTests.some(t => t._id === test._id) ? (
                          <>
                            <X className="w-4 h-4" />
                            {language === 'en' ? "Remove from List" : "তালিকা থেকে মুছুন"}
                          </>
                        ) : (
                          <>
                            <Activity className="w-4 h-4" />
                            {language === 'en' ? "Add to List" : "তালিকায় যুক্ত করুন"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {loading && (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00B7B5]" />
                </div>
              )}
              <div ref={ref} className="h-4 w-full cursor-default" />
            </>
          ) : (
            !loading ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium text-lg">
                  {t.noTests}
                </p>
              </div>
            ) : (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B7B5]" />
              </div>
            )
          )}
        </div>
      </div>
    );
  }
);

DiagnosticTestList.displayName = "DiagnosticTestList";

export default DiagnosticTestList;
