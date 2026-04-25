import React from "react";
import { RotateCcw, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

interface DiagnosticPatientFormProps {
  patientName: string;
  setPatientName: (val: string) => void;
  mobileNumber: string;
  setMobileNumber: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  age: string;
  setAge: (val: string) => void;
  patientType: "old" | "new" | "report";
  setPatientType: (val: "old" | "new" | "report") => void;
  affiliateCode: string;
  setAffiliateCode: (val: string) => void;
  selectedDate: Date | null;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function DiagnosticPatientForm({
  patientName,
  setPatientName,
  mobileNumber,
  setMobileNumber,
  gender,
  setGender,
  age,
  setAge,
  patientType,
  setPatientType,
  affiliateCode,
  setAffiliateCode,
  selectedDate,
  submitting,
  handleSubmit
}: DiagnosticPatientFormProps): React.JSX.Element {
  const { language } = useLanguage();
  return (
    <Card className="p-6 bg-white border-2 border-[#00B7B5]/10 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00B7B5] to-[#FF6B00]" />
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          {t("patientInformation", language)}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setPatientName("");
            setMobileNumber("");
            setGender("");
            setAge("");
            setPatientType("new");
            setAffiliateCode("");
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-[#00B7B5] hover:border-[#00B7B5] rounded-lg"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          <RotateCcw className="h-4 w-4" />
          {t("resetForm", language)}
        </Button>
      </div>

      {/* Required fields notice */}
      <div className="mb-4 p-3 bg-red-50/50 border border-red-100 rounded-lg">
        <p className="text-xs text-red-500 font-medium flex items-center gap-2" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
          <span className="text-red-500 font-bold">*</span>
          {t("requiredFieldsNotice", language)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Name - Required */}
        <div>
          <Label htmlFor="patientName" className="flex items-center gap-1 font-bold text-gray-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            {t("patientNameLabel", language)} <span className="text-red-500 font-bold">*</span>
          </Label>
          <Input
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            placeholder={t("patientNameLabel", language)}
            className={`mt-1 border-2 h-12 rounded-xl transition-all focus-visible:ring-[#00B7B5] ${!patientName ? 'border-gray-100' : 'border-[#00B7B5]/30 bg-[#00B7B5]/5'}`}
          />
        </div>

        {/* Mobile Number - Required */}
        <div>
          <Label htmlFor="mobileNumber" className="flex items-center gap-1 font-bold text-gray-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            {t("mobileNumberLabel", language)} <span className="text-red-500 font-bold">*</span>
          </Label>
          <Input
            id="mobileNumber"
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
            placeholder={t("mobileNumberLabel", language)}
            className={`mt-1 border-2 h-12 rounded-xl transition-all focus-visible:ring-[#00B7B5] ${!mobileNumber ? 'border-gray-100' : 'border-[#00B7B5]/30 bg-[#00B7B5]/5'}`}
          />
        </div>

        {/* Gender - Optional */}
        <div>
          <Label htmlFor="gender" className="font-bold text-gray-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            {t("genderLabel", language)}
          </Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 w-full h-12 px-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B7B5] bg-white transition-all"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            <option value="">{t("selectGender", language)}</option>
            <option value="male">{t("male", language)}</option>
            <option value="female">{t("female", language)}</option>
          </select>
        </div>

        {/* Age - Optional */}
        <div>
          <Label htmlFor="age" className="font-bold text-gray-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            {t("ageLabel", language)}
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={t("ageLabel", language)}
            className="mt-1 border-2 border-gray-100 h-12 rounded-xl transition-all focus-visible:ring-[#00B7B5]"
            min="0"
          />
        </div>

        {/* Affiliate Code - with Serial Input Option */}
        <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-[#00B7B5]/20">
          <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-[#004B50] font-bold" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            <Ticket className="h-4 w-4" />
            {t("serialAffiliateCode", language)}
          </Label>
          <Input
            id="affiliateCode"
            value={affiliateCode}
            onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
            placeholder={t("serialAffiliateCode", language)}
            className="mt-2 border-2 border-gray-200 h-12 rounded-xl focus:border-[#00B7B5] bg-white uppercase font-bold tracking-wider"
          />
          <p className="mt-2 text-xs text-gray-500 font-medium" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            {t("referralCodeHelp", language)}
          </p>
        </div>

        <Button
          type="submit"
          disabled={!selectedDate || !patientName || !mobileNumber || submitting}
          className="w-full h-14 bg-[#00B7B5] hover:bg-[#004B50] text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("bookingInProgress", language)}
            </>
          ) : (
            t("proceedFile", language)
          )}
        </Button>
      </form>
    </Card>
  );
}
