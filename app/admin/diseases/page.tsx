"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Trash2, Filter, Minus, Loader2, Hospital } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

interface Disease {
  _id: string;
  name: string;
  bangla: string;
  department?: Department;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all");
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  
  // Form state
  const [departmentId, setDepartmentId] = useState<string>("");
  const [diseaseNames, setDiseaseNames] = useState<string[]>([""]);
  const [diseaseNamesBn, setDiseaseNamesBn] = useState<string[]>([""]);

  useEffect(() => {
    fetchDiseases();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!showForm) {
      setFormLanguage(language);
    }
  }, [language, showForm]);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diseases");
      const data = await response.json();
      if (response.ok) {
        setDiseases(data.diseases);
      }
    } catch (error) {
      console.error("Error fetching diseases:", error);
      showToast.error("Failed to fetch diseases");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleAddNameField = () => {
    setDiseaseNames([...diseaseNames, ""]);
    setDiseaseNamesBn([...diseaseNamesBn, ""]);
  };

  const handleRemoveNameField = (index: number) => {
    const newNames = [...diseaseNames];
    const newNamesBn = [...diseaseNamesBn];
    newNames.splice(index, 1);
    newNamesBn.splice(index, 1);
    setDiseaseNames(newNames);
    setDiseaseNamesBn(newNamesBn);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...diseaseNames];
    newNames[index] = value;
    setDiseaseNames(newNames);
  };

  const handleNameBnChange = (index: number, value: string) => {
    const newNamesBn = [...diseaseNamesBn];
    newNamesBn[index] = value;
    setDiseaseNamesBn(newNamesBn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/diseases/${editingId}`
        : "/api/diseases";
      const method = editingId ? "PUT" : "POST";

      const validNames = diseaseNames.filter(n => n.trim() !== "");
      
      if (validNames.length === 0) {
        showToast.error("Please enter at least one disease name");
        setLoading(false);
        return;
      }

      const payload = editingId 
        ? { name: validNames[0], bangla: diseaseNamesBn[0], departmentId } 
        : { names: validNames, namesBn: diseaseNamesBn, departmentId };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchDiseases();
        setShowForm(false);
        setEditingId(null);
        setDepartmentId("");
        setDiseaseNames([""]);
        setDiseaseNamesBn([""]);
        
        showToast.success(editingId ? "Disease updated successfully" : "Diseases created successfully");
      } else {
        showToast.error(result.error || "Failed to save disease");
      }
    } catch (error) {
      console.error("Error saving disease:", error);
      showToast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (disease: Disease) => {
    setEditingId(disease._id);
    setDepartmentId(disease.department?._id || "");
    setDiseaseNames([disease.name]);
    setDiseaseNamesBn([disease.bangla || ""]);
    setFormLanguage(language);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?" : "Are you sure you want to delete this disease?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/diseases/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDiseases();
        showToast.success("Disease deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete disease");
      }
    } catch (error) {
      console.error("Error deleting disease:", error);
      showToast.error("Failed to delete disease");
    } finally {
      setLoading(false);
    }
  };

  const filteredDiseases = diseases.filter((disease) => {
    if (selectedDepartmentFilter === "all") return true;
    if (selectedDepartmentFilter === "none") return !disease.department;
    return disease.department?._id === selectedDepartmentFilter;
  });

  if (loading && diseases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{t("loading", language)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("manageDiseases", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {language === 'bn' ? 'রোগের তালিকা এবং বিভাগ পরিচালনা করুন' : 'Create and manage medical diseases and conditions'}
          </p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setDepartmentId("");
            setDiseaseNames([""]);
            setDiseaseNamesBn([""]);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-6 text-lg font-semibold rounded-xl shadow-md transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t("addDisease", language)}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-gray-600 px-3">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-wider">{t("allDepartments", language)}:</span>
        </div>
        <select 
          value={selectedDepartmentFilter} 
          onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
          className="flex-1 min-w-[200px] h-11 rounded-xl border-gray-200 bg-gray-50 px-4 py-2 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <option value="all">{t("allDepartments", language)}</option>
          <option value="none">{t("noDepartment", language)}</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>{dept.name}</option>
          ))}
        </select>
        <div className="text-sm font-bold text-primary px-4 py-2 bg-primary/5 rounded-lg border border-primary/10">
          {filteredDiseases.length} {language === 'bn' ? 'টি পাওয়া গেছে' : 'Diseases Found'}
        </div>
      </div>

      {showForm && (
        <Card className="p-8 bg-white border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? t("editDisease", language) : t("addDisease", language)}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="rounded-full h-10 w-10 p-0"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner">
                <button
                  type="button"
                  onClick={() => setFormLanguage('en')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    formLanguage === 'en'
                      ? 'bg-white text-primary shadow-sm scale-105'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setFormLanguage('bn')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    formLanguage === 'bn'
                      ? 'bg-white text-primary shadow-sm scale-105'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="department" className="text-base font-bold text-gray-700 flex items-center">
                  <Hospital className="h-4 w-4 mr-2 text-primary" />
                  {language === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Department'} ({t("optional", language)})
                </Label>
                <select
                  id="department"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 py-2 text-lg focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="">{t("noDepartment", language)}</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <Label className="text-base font-bold text-gray-700">
                   {formLanguage === 'en' ? t("diseaseNames", language) : t("diseaseNames", language)}
                </Label>
                
                <div className="space-y-3">
                  {(formLanguage === 'en' ? diseaseNames : diseaseNamesBn).map((name, index) => (
                    <div key={index} className="group relative flex gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
                      <div className="flex-1">
                        <Input
                          value={name}
                          onChange={(e) => formLanguage === 'en' 
                            ? handleNameChange(index, e.target.value)
                            : handleNameBnChange(index, e.target.value)
                          }
                          placeholder={formLanguage === 'en' ? "Enter disease name (e.g. Asthma)" : "রোগের নাম লিখুন (যেমন: হাঁপানি)"}
                          required={formLanguage === 'en' && index === 0}
                          className="h-12 text-lg border-gray-200 rounded-xl focus:ring-primary"
                          style={formLanguage === 'bn' ? { fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" } : undefined}
                        />
                      </div>
                      {!editingId && diseaseNames.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNameField(index)}
                          className="h-12 w-12 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Minus className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {!editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddNameField}
                    className="mt-4 border-dashed border-2 py-6 rounded-xl w-full text-gray-500 hover:text-primary hover:border-primary transition-all"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {language === 'bn' ? 'আরও একটি নাম যোগ করুন' : 'Add Another Name'}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-lg rounded-xl transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    {t("saving", language)}
                  </>
                ) : (
                  editingId ? t("update", language) : t("createDiseases", language)
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 h-14 text-xl font-bold border-2 rounded-xl transition-all"
              >
                {t("cancel", language)}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {filteredDiseases.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-3xl">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-sm">
              <Plus className="h-12 w-12 text-gray-300" />
            </div>
            <p className="text-gray-500 text-2xl font-medium">
              {diseases.length === 0 ? t("noDiseases", language) : (language === 'bn' ? 'ফিল্টার অনুযায়ী কোনো রোগ পাওয়া যায়নি' : 'No diseases found for this filter')}
            </p>
            {diseases.length === 0 && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-primary text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                {t("createFirstDisease", language)}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDiseases.map((disease) => (
            <Card key={disease._id} className="group relative p-6 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
              
              <div className="relative flex flex-col h-full justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                        {disease.name}
                      </h3>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(disease)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(disease._id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {disease.department && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl w-fit text-xs font-bold tracking-tight">
                       <Hospital className="h-3 w-3" />
                       <span>{disease.department.name}</span>
                    </div>
                  )}
                </div>
                
                {/* <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 group-hover:text-primary/30 transition-colors">
                  ID: {disease._id.slice(-6)}
                </div> */}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
