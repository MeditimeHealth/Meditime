"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Loader2, MapPin, Phone, Mail, Percent, Info } from "lucide-react";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

interface DiagnosticCenter {
  _id: string;
  name: string;
  nameBn?: string;
  division?: string;
  divisionBn?: string;
  district?: string;
  districtBn?: string;
  thana?: string;
  thanaBn?: string;
  address?: string;
  addressBn?: string;
  phone?: string;
  email?: string;
  packageDiscount?: number;
  minTestsForPackage?: number;
}

export default function DiagnosticCentersPage() {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diagnostic/centers");
      const data = await response.json();
      if (response.ok) {
        setCenters(data.centers);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      showToast.error("Failed to fetch diagnostic centers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এই সেন্টারটি মুছে ফেলতে চান?" : "Are you sure you want to delete this center?")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/diagnostic/centers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCenters(centers.filter((center) => center._id !== id));
        showToast.success("Center deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete center");
      }
    } catch (error) {
      console.error("Error deleting center:", error);
      showToast.error("Failed to delete center");
    } finally {
      setLoading(false);
    }
  };

  if (loading && centers.length === 0) {
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
            {t("manageDiagnosticCenters", language)}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {t("diagnosticCenterSubTitle", language)}
          </p>
        </div>
        <Link href="/admin/diagnostic/centers/create">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white h-12 px-6 text-lg font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("create", language)}
          </Button>
        </Link>
      </div>

      {centers.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-3xl">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-sm">
              <MapPin className="h-12 w-12 text-gray-300" />
            </div>
            <p className="text-gray-500 text-2xl font-medium">{t("noCenters", language)}</p>
            <Link href="/admin/diagnostic/centers/create">
              <Button 
                className="bg-primary text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg"
              >
                <Plus className="h-6 w-6 mr-2" />
                {t("createFirstCenter", language)}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {centers.map((center: DiagnosticCenter) => (
            <Card key={center._id} className="group relative p-0 bg-white border-2 border-gray-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="p-8 space-y-6 flex-1">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                      {getLocalizedValue(center.name, center.nameBn, language)}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 group-hover:bg-white transition-all">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                    <div className="text-sm font-bold text-gray-600">
                      {[
                        language === 'bn' ? center.divisionBn || center.division : center.division,
                        language === 'bn' ? center.districtBn || center.district : center.district,
                        language === 'bn' ? center.thanaBn || center.thana : center.thana
                      ].filter(Boolean).join(", ")}
                    </div>
                  </div>
                  {center.address && (
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-gray-400 mt-1 shrink-0" />
                      <div className="text-sm font-bold text-gray-600">
                        {getLocalizedValue(center.address, center.addressBn, language)}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div className="text-sm font-bold text-gray-600">{center.phone}</div>
                  </div>
                  {center.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div className="text-sm font-bold text-gray-600 truncate">{center.email}</div>
                    </div>
                  )}
                </div>

                {(center.packageDiscount || 0) > 0 && (
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-white p-2 rounded-xl">
                        <Percent className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-primary font-extrabold text-lg leading-none">{center.packageDiscount}% {language === 'bn' ? 'অফার' : 'Discount'}</p>
                        <p className="text-primary/60 text-[10px] font-bold mt-1 uppercase tracking-wider">{center.minTestsForPackage}+ {language === 'bn' ? 'টি টেস্টের জন্য প্রযোজ্য' : 'Tests Required'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-1 p-4 bg-gray-50 border-t border-gray-100">
                <Link href={`/admin/diagnostic/centers/edit/${center._id}`} className="flex-1">
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
                  onClick={() => handleDelete(center._id)}
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
