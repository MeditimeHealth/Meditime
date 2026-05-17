import { ChevronLeft, MapPin, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Division, District, Thana, Hospital } from "@/types/diagnostic";
import { getLocalizedValue, Language } from "@/contexts/LanguageContext";

interface DiagnosticLocationFilterProps {
  language: Language;

  selectedDivision: string;
  selectedDistrict: string;
  selectedThana: string;
  setSelectedDivision: (val: string) => void;
  setSelectedDistrict: (val: string) => void;
  setSelectedThana: (val: string) => void;
  handleDivisionSelect: (val: string) => void;
  handleDistrictSelect: (val: string) => void;
  handleThanaSelect: (val: string) => void;
  divisions: Division[];
  districts: District[];
  thanas: Thana[];
  filteredHospitals: Hospital[];
  selectedVenue: Hospital | null;
  setSelectedVenue: (val: Hospital | null) => void;
}

export default function DiagnosticLocationFilter({
  language,

  selectedDivision,
  selectedDistrict,
  selectedThana,
  setSelectedDivision,
  setSelectedDistrict,
  setSelectedThana,
  handleDivisionSelect,
  handleDistrictSelect,
  handleThanaSelect,
  divisions,
  districts,
  thanas,
  filteredHospitals,
  selectedVenue,
  setSelectedVenue
}: DiagnosticLocationFilterProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="p-1.5 bg-[#00B7B5]/10 text-[#00B7B5] rounded-lg">
            <MapPin className="h-4 w-4" />
          </div>
           {language === 'en' ? "Find Local Hospitals" : "স্থানীয় হাসপাতাল খুঁজুন"}
        </h3>
      </div>
      
      <div className="space-y-4">
        <div>
              <label htmlFor="filter-division" className="mb-2 block text-sm font-semibold text-gray-700">১. {language === 'en' ? "Division" : "বিভাগ"}</label>
              <div className="relative">
                <select
                  id="filter-division"
                  value={selectedDivision}
                  onChange={(e) => handleDivisionSelect(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B7B5]/20 focus:border-[#00B7B5] bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">{language === 'en' ? "Select Division" : "বিভাগ নির্বাচন করুন"}</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div.name}>{div.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="filter-district" className="mb-2 block text-sm font-semibold text-gray-700">২. {language === 'en' ? "District" : "জেলা"}</label>
              <div className="relative">
                <select
                  id="filter-district"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  disabled={!selectedDivision}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B7B5]/20 focus:border-[#00B7B5] bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedDivision ? (language === 'en' ? "Select District" : "জেলা নির্বাচন করুন") : (language === 'en' ? "Select Division First" : "প্রথমে বিভাগ নির্বাচন করুন")}</option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist.name}>{dist.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="filter-thana" className="mb-2 block text-sm font-semibold text-gray-700">৩. {language === 'en' ? "Thana" : "থানা"}</label>
              <div className="relative">
                <select
                  id="filter-thana"
                  value={selectedThana}
                  onChange={(e) => handleThanaSelect(e.target.value)}
                  disabled={!selectedDistrict || !selectedDivision}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B7B5]/20 focus:border-[#00B7B5] bg-gray-50/50 hover:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedDivision && selectedDistrict ? (language === 'en' ? "Select Thana" : "থানা নির্বাচন করুন") : (language === 'en' ? "Select District First" : "প্রথমে জেলা নির্বাচন করুন")}</option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>{thana.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                </div>
              </div>
            </div>
            
            {(selectedDivision || selectedDistrict || selectedThana) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDivision("");
                  setSelectedDistrict("");
                  setSelectedThana("");
                }}
                className="w-full flex items-center justify-center gap-2 mt-2 h-10 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
              >
                <X className="h-4 w-4" />
                {language === 'en' ? "Clear Filters" : "ফিল্টার মুছুন"}
              </Button>
            )}

            {/* Diagnostic Centers List */}
            {(selectedDivision && selectedDistrict && selectedThana) && (
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mt-4 h-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-900">{language === 'en' ? "Available Hospitals" : "হাসপাতালসমূহ"}</h3>
                  <span className="text-[10px] font-bold text-[#00B7B5] bg-[#00B7B5]/10 px-1.5 py-0.5 rounded-md">{filteredHospitals.length}</span>
                </div>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredHospitals.slice(0, 10).map((center) => (
                    <Card 
                      key={center._id} 
                      onClick={() => setSelectedVenue(selectedVenue?._id === center._id ? null : center)}
                      className={`p-3 rounded-xl shadow-sm relative overflow-hidden bg-white hover:shadow-md cursor-pointer transition-all border-2 ${selectedVenue?._id === center._id ? 'border-[#00B7B5] ring-2 ring-[#00B7B5]/20 bg-[#00B7B5]/5' : 'border-slate-100 hover:border-[#00B7B5]/30'}`}
                    >
                      {selectedVenue?._id === center._id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-[#00B7B5]" />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-900 text-xs mb-1.5 leading-tight pr-6">{getLocalizedValue(center.name, center.nameBn, language)}</h4>
                      
                      <div className="flex flex-col gap-1 text-[10px] text-slate-500 mb-2 font-medium">
                         <div className="flex items-start gap-1 text-slate-400">
                           <MapPin className="w-3 h-3 shrink-0 mt-0.5" /> 
                           <span className="line-clamp-2">{center.address || center.thana?.name || "Address not provided"}</span>
                         </div>
                      </div>

                      
                    </Card>
                  ))}
                  
                  {filteredHospitals.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-xs font-medium">{language === 'en' ? "No hospitals found in this area." : "এই এলাকায় কোন হাসপাতাল পাওয়া যায়নি।"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

      </div>
    </div>
  );
}
