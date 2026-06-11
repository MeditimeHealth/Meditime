import React from "react";
import { RotateCcw, Ticket, Loader2, ChevronRight } from "lucide-react";
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

  // Load saved patient form data from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      let loggedInUser: any = null;
      if (userData) {
        try {
          loggedInUser = JSON.parse(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      const savedFormData = localStorage.getItem("diagnosticPatientFormData");
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);
          if (parsed.patientName) setPatientName(parsed.patientName);
          if (parsed.mobileNumber) setMobileNumber(parsed.mobileNumber);
          if (parsed.gender) setGender(parsed.gender);
          if (parsed.age) setAge(parsed.age);
          if (parsed.patientType) setPatientType(parsed.patientType);
          if (parsed.affiliateCode) setAffiliateCode(parsed.affiliateCode);
          return;
        } catch (e) {
          console.error("Error parsing diagnostic saved form data:", e);
        }
      }

      if (loggedInUser) {
        if (loggedInUser.fullName) {
          setPatientName(loggedInUser.fullName);
        }
        if (loggedInUser.phoneNumber) {
          const phone = loggedInUser.phoneNumber.startsWith("+880")
            ? loggedInUser.phoneNumber.slice(4)
            : loggedInUser.phoneNumber;
          setMobileNumber(phone);
        }
      }
    }
  }, [setPatientName, setMobileNumber, setGender, setAge, setPatientType, setAffiliateCode]);

  // Save diagnostic form data on changes
  React.useEffect(() => {
    if (typeof window !== "undefined" && (patientName || mobileNumber || gender || age || affiliateCode)) {
      localStorage.setItem(
        "diagnosticPatientFormData",
        JSON.stringify({
          patientName,
          mobileNumber,
          gender,
          age,
          patientType,
          affiliateCode,
        })
      );
    }
  }, [patientName, mobileNumber, gender, age, patientType, affiliateCode]);

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-2 border-primary/20 shadow-xl">
      <div className="absolute top-0 left-0 w-full h-1 " />
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-2xl font-bold text-gray-900"

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
            if (typeof window !== "undefined") {
              localStorage.removeItem("diagnosticPatientFormData");
            }
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-[#00B7B5] hover:border-[#00B7B5] rounded-lg"

        >
          <RotateCcw className="h-4 w-4" />
          {t("resetForm", language)}
        </Button>
      </div>

      {/* Required fields notice */}
      <div className="mb-4 p-3 bg-red-50/50 border border-red-100 rounded-lg">
        <p className="text-xs text-red-500 font-medium flex items-center gap-2" >
          <span className="text-red-500 font-bold">*</span>
          {t("requiredFieldsNotice", language)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Patient Name - Required */}
        <div>
          <Label htmlFor="patientName" className="flex items-center gap-1  " >
            {t("patientNameLabel", language)} <span className="text-red-500 font-bold">*</span>
          </Label>
          <Input
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            placeholder={t("patientNameLabel", language)}
            className={`mt-1 h-10 border-primary rounded-none  ${!patientName ? 'border-gray-100' : 'border-[#00B7B5]/30 bg-[#00B7B5]/5'}`}
          />
        </div>

        {/* Mobile Number - Required */}
        <div>
          <Label htmlFor="mobileNumber" className="flex items-center gap-1 " >
            {t("mobileNumberLabel", language)} <span className="text-red-500 font-bold">*</span>
          </Label>
          <div className="relative flex items-center mt-1">
            <span className="absolute left-3 flex items-center gap-1.5 text-gray-500 text-sm border-r pr-2 h-6 border-gray-300 pointer-events-none select-none">
              <span>🇧🇩</span>
              <span>+880</span>
            </span>
            <Input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setMobileNumber(val);
              }}
              required
              placeholder={t("mobileNumberLabel", language)}
              className={`pl-[4.5rem] h-10 w-full border-primary rounded-none ${!mobileNumber ? 'border-gray-100' : 'border-[#00B7B5]/30 bg-[#00B7B5]/5'}`}
            />
          </div>
        </div>

        {/* Gender - Optional */}
        <div>
          <Label htmlFor="gender" className="" >
            {t("genderLabel", language)}
          </Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 h-12 w-full px-4 border-2 border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B7B5] bg-white transition-all"

          >
            <option value="">{t("selectGender", language)}</option>
            <option value="male">{t("male", language)}</option>
            <option value="female">{t("female", language)}</option>
            <option value="others">{t("others", language)}</option>
          </select>
        </div>

        {/* Age - Optional */}
        <div>
          <Label htmlFor="age" className="" >
            {t("ageLabel", language)}
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder={t("ageLabel", language)}
            className="mt-1 h-10 border-2 border-gray-100 rounded-xl transition-all focus-visible:ring-[#00B7B5]"
            min="0"
          />
        </div>

        {/* Affiliate Code - with Serial Input Option */}
        <div className="p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
          <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-primary" >
            <Ticket className="h-4 w-4" />
            {t("serialAffiliateCode", language)}
          </Label>
          <Input
            id="affiliateCode"
            value={affiliateCode}
            onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
            placeholder={t("serialAffiliateCode", language)}
                    className={`mt-2 h-10 border-2 border-primary focus:border-primary bg-white ${!affiliateCode ? '' : 'border-primary bg-green-50/30'}`}
          />
          <p className="mt-2 text-xs text-primary" >
            {t("referralCodeHelp", language)}
          </p>
        </div>

        <Button
          type="submit"
          disabled={!selectedDate || !patientName || !mobileNumber || submitting}
          className="w-full h-14 btn-primary btn-slide text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"

        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("bookingInProgress", language)}
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>{t("proceedFile", language)}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
}
