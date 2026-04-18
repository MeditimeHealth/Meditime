"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Edit, Loader2, ImageIcon, AlertTriangle, X, 
  ChevronLeft, ChevronRight, Hash 
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

interface DiagnosticTest {
  _id: string;
  serialNumber: number;
  name: string;
  nameBn?: string;
  description?: string;
  descriptionBn?: string;
  price: number;
  recommendations: string[];
  departments: string[];
}

export default function DiagnosticTestsPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTests, setTotalTests] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<DiagnosticTest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    fetchTests(currentPage);
  }, [currentPage]);

  const fetchTests = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/diagnostic/tests?page=${page}&limit=9`);
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
        setTotalPages(data.totalPages);
        setTotalTests(data.totalTests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      showToast.error(language === 'bn' ? "ডায়াগনস্টিক টেস্ট লোড করতে ব্যর্থ হয়েছে" : "Failed to fetch diagnostic tests");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (test: DiagnosticTest) => {
    setTestToDelete(test);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTestToDelete(null);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/diagnostic/tests/${testToDelete._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // If we delete the last item on a page, go back a page
        if (tests.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchTests(currentPage);
        }
        showToast.success(language === 'bn' ? "টেস্টটি সফলভাবে মুছে ফেলা হয়েছে" : "Test deleted successfully");
        closeDeleteModal();
      } else {
        const data = await response.json();
        showToast.error(data.error || (language === 'bn' ? "টেস্ট মুছতে ব্যর্থ হয়েছে" : "Failed to delete test"));
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      showToast.error(language === 'bn' ? "সার্ভারে ত্রুটি দেখা দিয়েছে" : "Failed to delete test");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {t("manageDiagnosticTests", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {language === 'bn' ? 'ডায়াগনস্টিক টেস্টের ক্যাটালগ তৈরি এবং পরিচালনা করুন' : 'Create and manage your diagnostic test catalog'}
          </p>
        </div>
        <div className="flex items-center gap-4">
           {totalTests > 0 && (
             <span className="hidden md:block bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold text-sm">
               {language === 'bn' ? `মোট ${totalTests}টি টেস্ট` : `${totalTests} Total Tests`}
             </span>
           )}
          <Link href="/admin/diagnostic/tests/create">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white h-12 px-6 text-lg font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("create", language)}
            </Button>
          </Link>
        </div>
      </div>

      {tests.length === 0 && !loading ? (
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
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[400px] bg-gray-100 rounded-[2rem] animate-pulse" />
              ))
            ) : (
              tests.map((test) => (
                <Card key={test._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col h-full ring-1 ring-gray-100/50">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Priority Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                       <Hash className="h-3.5 w-3.5 text-primary" />
                       <span className="text-sm font-black text-gray-900">{test.serialNumber || 0}</span>
                    </div>
                  </div>

                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start pr-12">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                          {language === 'bn' && test.nameBn ? test.nameBn : test.name}
                        </h3>
                      </div>
                      
                      {test.description && (
                        <p className="text-gray-500 text-sm line-clamp-3 font-medium leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                           {language === 'bn' && test.descriptionBn ? test.descriptionBn : test.description}
                        </p>
                      )}

                      {/* Departments display */}
                      <div className="flex flex-wrap gap-2">
                        {test.departments?.map((dept: string) => (
                          <span key={dept} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider rounded-lg border border-primary/10">
                            {dept}
                          </span>
                        ))}
                      </div>
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
                      onClick={() => openDeleteModal(test)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("delete", language)}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Premium Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4 pb-12">
              <div className="flex items-center gap-2 bg-white p-2 rounded-[1.5rem] border-2 border-gray-100 shadow-sm">
                <Button
                  variant="ghost"
                  disabled={currentPage === 1 || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="h-12 w-12 p-0 rounded-xl hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center gap-1 px-4">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Only show a few numbers if there are too many pages
                    if (
                      totalPages > 7 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      (pageNum < currentPage - 1 || pageNum > currentPage + 1)
                    ) {
                      if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className="text-gray-300 font-black px-1">...</span>;
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        className={`h-11 w-11 p-0 rounded-xl text-sm font-black transition-all ${
                          currentPage === pageNum 
                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  disabled={currentPage === totalPages || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="h-12 w-12 p-0 rounded-xl hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest px-6 py-2 bg-gray-50 rounded-full border border-gray-100">
                {language === 'bn' 
                  ? `পৃষ্ঠা ${currentPage} / ${totalPages}` 
                  : `Page ${currentPage} of ${totalPages}`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Deletion Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-6 right-6">
                <button 
                  onClick={closeDeleteModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center animate-pulse">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">
                      {language === 'bn' ? "ডিলিট নিশ্চিত করুন" : "Confirm Deletion"}
                    </h2>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                      {language === 'bn' 
                        ? `আপনি কি নিশ্চিত যে "${testToDelete?.nameBn || testToDelete?.name}" টেস্টটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`
                        : `Are you sure you want to delete "${testToDelete?.name}"? This action is permanent and cannot be undone.`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="h-14 w-full bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-6 w-6 mr-2" />
                    )}
                    {language === 'bn' ? "ডিলিট করুন" : "Delete Permanent"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="h-14 w-full text-gray-400 hover:text-gray-600 font-bold text-lg rounded-2xl transition-all"
                  >
                    {language === 'bn' ? "বাতিল করুন" : "No, Keep it"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
