"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Search, Check, ChevronDown, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/translations";
import { showToast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

interface MultiSelectOption {
  value: string;
  en: string;
  bn: string;
}

const DEPARTMENT_OPTIONS: MultiSelectOption[] = [
  { value: "Blood", en: "Blood", bn: "রক্ত (Blood)" },
  { value: "Cardiology", en: "Cardiology", bn: "কার্ডিওলজি (Cardiology)" },
  { value: "Imaging", en: "Imaging", bn: "ইমেজিং (Imaging)" },
  { value: "Pathology", en: "Pathology", bn: "প্যাথলজি (Pathology)" },
];

const RECOMMENDATION_OPTIONS: MultiSelectOption[] = [
  { value: "Fasting Required", en: "Fasting Required", bn: "খালি পেটে থাকতে হবে (Fasting Required)" },
  { value: "Drink plenty of water", en: "Drink plenty of water", bn: "প্রচুর পানি পান করুন (Drink plenty of water)" },
  { value: "No smoking", en: "No smoking", bn: "ধূমপান করবেন না (No smoking)" },
  { value: "Morning sample only", en: "Morning sample only", bn: "শুধুমাত্র সকালের স্যাম্পল (Morning sample only)" },
  { value: "Consult doctor before test", en: "Consult doctor before test", bn: "টেস্টের আগে ডাক্তারের পরামর্শ নিন (Consult doctor)" },
];

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (value: string) => void;
  placeholder: string;
  language: 'en' | 'bn';
}

function SearchableMultiSelect({ label, options, selected, onChange, placeholder, language }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt[language].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3" ref={containerRef}>
      <Label className="text-base font-bold text-gray-700">
        {label} <span className="text-red-500">*</span>
      </Label>
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[3rem] w-full rounded-xl border-2 bg-white px-4 py-2 cursor-pointer transition-all flex flex-wrap gap-2 items-center ${
          isOpen ? 'border-primary shadow-sm' : 'border-gray-100 hover:border-primary/30'
        }`}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 font-medium">{placeholder}</span>
        ) : (
          selected.map(val => {
            const option = options.find(o => o.value === val);
            return (
              <span 
                key={val} 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(val);
                }}
              >
                {option ? option[language] : val}
                <X className="h-3 w-3 cursor-pointer" />
              </span>
            );
          })
        )}
        <ChevronDown className={`ml-auto h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-2 border-primary/5 rounded-2xl shadow-xl overflow-hidden mt-2"
          >
           
            <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">
                  {language === 'bn' ? "কোনো ফলাফল পাওয়া যায়নি" : "No options found"}
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      selected.includes(option.value)
                        ? 'bg-primary/5 text-primary'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-sm font-bold">{option[language]}</span>
                    {selected.includes(option.value) && <Check className="h-4 w-4 stroke-[3]" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CreateDiagnosticTestPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    description: "",
    descriptionBn: "",
    price: "",
    serialNumber: "",
    recommendations: [] as string[],
    departments: [] as string[],
  });

  const departmentOptions = DEPARTMENT_OPTIONS;
  const recommendationOptions = RECOMMENDATION_OPTIONS;

  const toggleSelection = (field: 'recommendations' | 'departments', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.recommendations.length === 0) {
      showToast.error(language === 'bn' ? "দয়া করে অন্তত একটি সুপারিশ নির্বাচন করুন" : "Please select at least one recommendation");
      return;
    }

    if (formData.departments.length === 0) {
      showToast.error(language === 'bn' ? "দয়া করে অন্তত একটি বিভাগ নির্বাচন করুন" : "Please select at least one department");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/diagnostic/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          nameBn: formData.nameBn,
          description: formData.description || undefined,
          descriptionBn: formData.descriptionBn || undefined,
          price: parseFloat(formData.price),
          serialNumber: parseInt(formData.serialNumber) || 0,
          recommendations: formData.recommendations,
          departments: formData.departments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(language === 'bn' ? "টেস্ট সফলভাবে তৈরি হয়েছে" : "Test created successfully");
        router.push("/admin/diagnostic/tests");
        router.refresh();
      } else {
        showToast.error(data.error || "Failed to create diagnostic test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="rounded-xl border-2 hover:bg-gray-50 bg-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back", language)}
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("createDiagnosticTest", language)}
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            {language === 'bn' ? 'সিস্টেমে একটি নতুন ডায়াগনস্টিক টেস্ট যোগ করুন' : 'Add a new diagnostic test to the system'}
          </p>
        </div>
      </div>

      <Card className="p-8 bg-white border-2 border-primary/10 shadow-xl rounded-2xl transition-all animate-in fade-in slide-in-from-top-4">


        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-bold text-gray-700">
                {language === 'bn' ? "টেস্টের নাম (English)" : "Test Name (English)"} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Complete Blood Count (CBC)"
                className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl mt-3"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="nameBn" className="text-base font-bold text-gray-700">
                {language === 'bn' ? "টেস্টের নাম (বাংলা)" : "Test Name (Bengali)"}
              </Label>
              <Input
                id="nameBn"
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                placeholder="সম্পূর্ণ রক্ত গণনা (CBC)"
                className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl mt-3"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="price" className="text-base font-bold text-gray-700">
                {t("price", language)} (৳) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="500"
                className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl mt-3"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="serialNumber" className="text-base font-bold text-gray-700">
                {language === 'bn' ? "প্রায়োরিটি নম্বর (Priority)" : "Priority Number"}
              </Label>
              <Input
                id="serialNumber"
                type="number"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="0"
                className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl mt-3"
              />
            </div>
          </div>

          {/* New Searchable Multi-select Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SearchableMultiSelect
              label={language === 'bn' ? "টেস্ট বিভাগ" : "Test Department"}
              options={departmentOptions}
              selected={formData.departments}
              onChange={(val) => toggleSelection('departments', val)}
              placeholder={language === 'bn' ? "বিভাগ নির্বাচন করুন" : "Select departments"}
              language={language}
            />

            <SearchableMultiSelect
              label={language === 'bn' ? "সুপারিশ" : "Recommendation"}
              options={recommendationOptions}
              selected={formData.recommendations}
              onChange={(val) => toggleSelection('recommendations', val)}
              placeholder={language === 'bn' ? "সুপারিশ নির্বাচন করুন" : "Select recommendations"}
              language={language}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-bold text-gray-700">
                {language === 'bn' ? "টেস্ট বর্ণনা (English)" : "Test Description (English)"}
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Detailed description of the diagnostic test..."
                className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all mt-3"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="descriptionBn" className="text-base font-bold text-gray-700">
                {language === 'bn' ? "টেস্ট বর্ণনা (বাংলা)" : "Test Description (Bengali)"}
              </Label>
              <textarea
                id="descriptionBn"
                value={formData.descriptionBn}
                onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                rows={4}
                placeholder="টেস্টের বিস্তারিত বিবরণ লিখুন..."
                className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all mt-3"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("saving", language)}
                </>
              ) : (
                t("create", language)
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1 h-12 text-lg font-bold border-2 rounded-xl transition-all"
            >
              {t("cancel", language)}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
