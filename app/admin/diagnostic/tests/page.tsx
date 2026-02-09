"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, Edit, Loader2, Image as ImageIcon, IndianRupee } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface DiagnosticTest {
  _id: string;
  name: string;
  nameBn?: string;
  description?: string;
  descriptionBn?: string;
  price: number;
  image?: string;
}

export default function DiagnosticTestsPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    description: "",
    descriptionBn: "",
    price: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (!showForm) {
      setFormLanguage(language);
    }
  }, [language, showForm]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diagnostic/tests");
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      showToast.error("Failed to fetch diagnostic tests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      showToast.error(language === 'bn' ? "দয়া করে টেস্টের জন্য একটি ছবি আপলোড করুন" : "Please upload an image for the test");
      return;
    }

    setLoading(true);
    try {
      const url = "/api/diagnostic/tests";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId && { id: editingId }),
        name: formData.name,
        nameBn: formData.nameBn,
        description: formData.description || undefined,
        descriptionBn: formData.descriptionBn || undefined,
        price: parseFloat(formData.price),
        image: formData.image || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showToast.success(editingId ? "Test updated successfully" : "Test created successfully");
        setShowForm(false);
        resetForm();
        fetchTests();
      } else {
        showToast.error(data.error || "Failed to save diagnostic test");
      }
    } catch (error) {
      console.error("Error saving test:", error);
      showToast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test: DiagnosticTest) => {
    setEditingId(test._id);
    setFormData({
      name: test.name,
      nameBn: test.nameBn || "",
      description: test.description || "",
      descriptionBn: test.descriptionBn || "",
      price: test.price.toString(),
      image: test.image || "",
    });
    setFormLanguage(language);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এই টেস্টটি মুছে ফেলতে চান?" : "Are you sure you want to delete this test?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/diagnostic/tests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTests(tests.filter((test) => test._id !== id));
        showToast.success("Test deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete test");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      showToast.error("Failed to delete test");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameBn: "",
      description: "",
      descriptionBn: "",
      price: "",
      image: "",
    });
    setEditingId(null);
  };

  if (loading && tests.length === 0) {
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
            {t("manageDiagnosticTests", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {language === 'bn' ? 'ডায়াগনস্টিক টেস্টের ক্যাটালগ তৈরি এবং পরিচালনা করুন' : 'Create and manage your diagnostic test catalog'}
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-6 text-lg font-semibold rounded-xl shadow-md transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t("createDiagnosticTest", language)}
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 bg-white border-2 border-primary/10 shadow-xl rounded-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingId ? t("editDiagnosticTest", language) : t("createDiagnosticTest", language)}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setShowForm(false); resetForm(); }}
              className="rounded-full h-10 w-10 p-0 hover:bg-gray-100"
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

            <div className="space-y-4">
              <Label className="text-base font-bold text-gray-700">{t("testImage", language)} <span className="text-red-500">*</span></Label>
              <div className="flex flex-col md:flex-row items-start gap-6 bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                {formData.image ? (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-lg border-2 border-white ring-1 ring-gray-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-white rounded-xl border-2 border-gray-100 flex items-center justify-center text-gray-300">
                     <ImageIcon className="h-16 w-16" />
                  </div>
                )}
                <div className="flex-1 w-full space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploading(true);
                        const data = new FormData();
                        data.append("image", file);
                        try {
                          const res = await fetch("/api/upload/imgbb", {
                            method: "POST",
                            body: data,
                          });
                          const json = await res.json();
                          if (json.url) {
                            setFormData({ ...formData, image: json.url });
                            showToast.success("Image uploaded successfully");
                          } else {
                            showToast.error("Failed to upload image");
                          }
                        } catch (err) {
                          console.error("Upload error:", err);
                          showToast.error("Failed to upload image");
                        } finally {
                          setUploading(false);
                        }
                      }
                    }}
                    disabled={uploading}
                    className="h-12 file:bg-primary file:text-white file:border-0 file:px-4 file:h-full file:rounded-lg file:mr-4 file:cursor-pointer hover:file:bg-primary/90"
                  />
                  {uploading && (
                    <div className="flex items-center text-primary font-bold">
                       <Loader2 className="h-4 w-4 animate-spin mr-2" />
                       {t("uploading", language)}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 font-medium">Recommended: Square image, max 2MB (JPG, PNG)</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 {formLanguage === 'en' ? (
                  <>
                    <Label htmlFor="name" className="text-base font-bold text-gray-700">
                      {t("testName", language)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Complete Blood Count (CBC)"
                      className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
                      required
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor="nameBn" className="text-base font-bold text-gray-700">
                      {t("nameBn", language)}
                    </Label>
                    <Input
                      id="nameBn"
                      value={formData.nameBn}
                      onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                      placeholder="সম্পূর্ণ রক্ত গণনা (CBC)"
                      className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                    />
                  </>
                )}
               </div>

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
                    className="h-12 text-lg border-gray-200 focus:ring-primary focus:border-primary rounded-xl"
                  />
               </div>
            </div>

            <div className="space-y-3">
              {formLanguage === 'en' ? (
                <>
                  <Label htmlFor="description" className="text-base font-bold text-gray-700">{t("description", language)}</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Detailed description of the diagnostic test..."
                    className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="descriptionBn" className="text-base font-bold text-gray-700">{t("description", language)}</Label>
                  <textarea
                    id="descriptionBn"
                    value={formData.descriptionBn}
                    onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                    rows={4}
                    placeholder="টেস্টের বিস্তারিত বিবরণ লিখুন..."
                    className="flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                </>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-14 text-xl font-bold bg-primary hover:bg-primary/90 shadow-lg rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    {t("saving", language)}
                  </>
                ) : (
                  editingId ? t("update", language) : t("create", language)
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 h-14 text-xl font-bold border-2 rounded-xl"
              >
                {t("cancel", language)}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {tests.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-3xl">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-sm">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
            <p className="text-gray-500 text-2xl font-medium">{t("noTests", language)}</p>
            <Button 
              onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-primary text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg"
            >
              <Plus className="h-6 w-6 mr-2" />
              {t("createFirstTest", language)}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tests.map((test) => (
            <Card key={test._id} className="p-0 border-2 border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 rounded-3xl group overflow-hidden bg-white">
              <div className="flex flex-col sm:flex-row h-full">
                <div className="sm:w-48 sm:h-full relative overflow-hidden group">
                  {test.image ? (
                    <img 
                      src={test.image} 
                      alt={test.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-full bg-gray-50 flex items-center justify-center text-gray-200">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-primary transition-colors pr-2">
                        {language === 'bn' && test.nameBn ? test.nameBn : test.name}
                      </h3>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(test)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(test._id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-3 font-medium leading-relaxed">
                       {language === 'bn' && test.descriptionBn ? test.descriptionBn : test.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="text-2xl font-black tabular-nums">{test.price}</span>
                      <span className="text-lg font-bold">৳</span>
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">
                       ID: {test._id.slice(-6)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
