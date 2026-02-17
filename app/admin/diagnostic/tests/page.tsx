"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon } from "lucide-react";
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
  const { language } = useLanguage();

  useEffect(() => {
    fetchTests();
  }, []);

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
        <Link href="/admin/diagnostic/tests/create">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white h-12 px-6 text-lg font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("create", language)}
          </Button>
        </Link>
      </div>

      {tests.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-3xl">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-sm">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
            <p className="text-gray-500 text-2xl font-medium">{t("noTests", language)}</p>
            <Link href="/admin/diagnostic/tests/create">
              <Button 
                className="bg-primary text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                {t("createFirstTest", language)}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {tests.map((test) => (
            <Card key={test._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-50 border-b border-gray-100 group">
                {test.image ? (
                  <img 
                    src={test.image} 
                    alt={test.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <ImageIcon className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-all opacity-0 group-hover:opacity-100" />
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                    {language === 'bn' && test.nameBn ? test.nameBn : test.name}
                  </h3>
                  
                  {test.description && (
                    <p className="text-gray-500 text-sm line-clamp-3 font-medium leading-relaxed">
                       {language === 'bn' && test.descriptionBn ? test.descriptionBn : test.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-6">
                  <div className="flex items-center gap-1.5 text-primary">
                    <span className="text-2xl font-black tabular-nums">{test.price}</span>
                    <span className="text-lg font-bold">৳</span>
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full ring-1 ring-gray-100">
                     ID: {test._id.slice(-6)}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                <Link href={`/admin/diagnostic/tests/edit/${test._id}`} className="flex-1">
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 font-black text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit", language)}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 font-black text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  onClick={() => handleDelete(test._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete", language)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
