import React from "react";
import { RotateCcw, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

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
}: DiagnosticPatientFormProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-[#00B7B5]/20 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          রোগীর তথ্য
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
          className="flex items-center gap-2 text-gray-600 hover:text-[#00B7B5] hover:border-[#00B7B5]"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          <RotateCcw className="h-4 w-4" />
          মুছুন
        </Button>
      </div>

      {/* Required fields notice */}
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600 flex items-center gap-2" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
          <span className="text-red-500 font-bold">*</span>
          চিহ্নিত ঘরগুলো অবশ্যই পূরণ করতে হবে
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Name - Required */}
        <div>
          <Label htmlFor="patientName" className="flex items-center gap-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            রোগীর নাম <span className="text-red-500 font-bold">*</span>
          </Label>
          <Input
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
            placeholder="রোগীর নাম লিখুন"
            className={`mt-1 border-2 ${!patientName ? 'border-red-300 bg-red-50/50' : 'border-green-300 bg-green-50/30'}`}
          />
        </div>

        {/* Mobile Number - Required */}
        <div>
          <Label htmlFor="mobileNumber" className="flex items-center gap-1" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            মোবাইল নম্বর <span className="text-red-500 font-bold">*</span>
          </Label>
          <Input
            id="mobileNumber"
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
            placeholder="মোবাইল নম্বর লিখুন"
            className={`mt-1 border-2 ${!mobileNumber ? 'border-red-300 bg-red-50/50' : 'border-green-300 bg-green-50/30'}`}
          />
        </div>

        {/* Gender - Optional */}
        <div>
          <Label htmlFor="gender" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            লিঙ্গ
          </Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B7B5] bg-white"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            <option value="">লিঙ্গ নির্বাচন করুন</option>
            <option value="male">পুরুষ</option>
            <option value="female">মহিলা</option>
          </select>
        </div>

        {/* Age - Optional */}
        <div>
          <Label htmlFor="age" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            বয়স
          </Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="বয়স লিখুন"
            className="mt-1 border-2 border-gray-200 focus-visible:ring-[#00B7B5]"
            min="0"
          />
        </div>

        {/* Affiliate Code - with Serial Input Option */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
          <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-purple-700" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            <Ticket className="h-4 w-4" />
            সিরিয়াল/অ্যাফিলিয়েট কোড (ঐচ্ছিক)
          </Label>
          <Input
            id="affiliateCode"
            value={affiliateCode}
            onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
            placeholder="সিরিয়াল বা অ্যাফিলিয়েট কোড লিখুন"
            className="mt-2 border-2 border-purple-300 focus:border-purple-500 bg-white"
          />
          <p className="mt-2 text-xs text-purple-600" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
            রেফারেল কোড থাকলে এখানে লিখুন
          </p>
        </div>

        <Button
          type="submit"
          disabled={!selectedDate || !patientName || !mobileNumber || submitting}
          className="w-full bg-gradient-to-r from-[#00B7B5] to-[#FF6B00] hover:from-[#FF6B00] hover:to-[#00B7B5] text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              বুক করা হচ্ছে...
            </>
          ) : (
            "Proceed File"
          )}
        </Button>
      </form>
    </Card>
  );
}
