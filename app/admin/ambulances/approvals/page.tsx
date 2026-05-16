"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Phone, MapPin, Loader2, Check, X, ShieldCheck, FileText } from "lucide-react";
import { showToast } from "@/lib/toast";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

interface Ambulance {
  _id: string;
  name: string;
  nameBn?: string;
  phoneNumber: string;
  ambulanceNumber?: string;
  drivingLicence?: string;
  division?: string;
  divisionBn?: string;
  district?: string;
  districtBn?: string;
  thana?: string;
  thanaBn?: string;
  availabilityStatus: string;
  vehicleType: string;
  isApproved: boolean;
}

export default function AmbulanceApprovalsPage() {
  const { language } = useLanguage();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingAmbulances();
  }, []);

  const fetchPendingAmbulances = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ambulances?admin=true&isApproved=false");
      const data = await response.json();
      if (response.ok) {
        setAmbulances(data.ambulances);
      }
    } catch (error) {
      console.error("Error fetching pending ambulances:", error);
      showToast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/ambulances/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      if (response.ok) {
        setAmbulances(ambulances.filter((a) => a._id !== id));
        showToast.success(language === 'bn' ? "অনুমোদিত হয়েছে!" : "Ambulance approved!");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to approve");
      }
    } catch (error) {
      showToast.error("Network error");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm(language === 'bn' ? "আপনি কি নিশ্চিত যে আপনি এই আবেদনটি বাতিল করতে চান?" : "Are you sure you want to reject this application?")) return;

    try {
      const response = await fetch(`/api/ambulances/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAmbulances(ambulances.filter((a) => a._id !== id));
        showToast.success(language === 'bn' ? "বাতিল করা হয়েছে" : "Application rejected and removed");
      } else {
        showToast.error("Failed to reject");
      }
    } catch (error) {
      showToast.error("Network error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-gray-500 font-medium">{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading applications...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <div className="border-b pb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
          <ShieldCheck className="h-10 w-10 text-primary" />
          {language === 'bn' ? 'অ্যাম্বুলেন্স অনুমোদন' : 'Ambulance Approvals'}
        </h1>
        <p className="text-gray-500 mt-2 text-lg font-medium">
          {language === 'bn' ? 'নতুন পার্টনার আবেদনগুলো পর্যালোচনা করুন' : 'Review and manage new ambulance partner applications'}
        </p>
      </div>

      {ambulances.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-4 bg-gray-50/50 rounded-[2.5rem]">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white p-8 rounded-full w-28 h-28 flex items-center justify-center mx-auto shadow-md">
              <Check className="h-14 w-14 text-green-400" />
            </div>
            <p className="text-gray-500 text-2xl font-black tracking-tight">
              {language === 'bn' ? 'কোনো পেন্ডিং আবেদন নেই' : 'No pending applications'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ambulances.map((ambulance) => (
            <Card key={ambulance._id} className="p-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Car className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {getLocalizedValue(ambulance.name, ambulance.nameBn, language)}
                      </h3>
                      <p className="text-primary font-bold text-sm uppercase tracking-wider">{ambulance.vehicleType}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">{language === 'bn' ? 'ফোন' : 'Phone'}:</span>
                        <a href={`tel:${ambulance.phoneNumber}`} className="text-primary hover:underline">{ambulance.phoneNumber}</a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">{language === 'bn' ? 'ঠিকানা' : 'Address'}:</span>
                        <span>
                          {language === 'bn' ? 
                            [ambulance.thanaBn || ambulance.thana, ambulance.districtBn || ambulance.district, ambulance.divisionBn || ambulance.division].filter(Boolean).join(", ") :
                            [ambulance.thana, ambulance.district, ambulance.division].filter(Boolean).join(", ")
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">{language === 'bn' ? 'যানবাহন নম্বর' : 'Vehicle No'}:</span>
                        <span className="font-medium">{ambulance.ambulanceNumber || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">{language === 'bn' ? 'লাইসেন্স' : 'Licence'}:</span>
                        <span className="font-medium">{ambulance.drivingLicence || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3 justify-center">
                  <Button 
                    onClick={() => handleApprove(ambulance._id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-green-100"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {language === 'bn' ? 'অনুমোদন দিন' : 'Approve'}
                  </Button>
                  <Button 
                    onClick={() => handleReject(ambulance._id)}
                    variant="outline"
                    className="border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold h-12 px-8 rounded-xl"
                  >
                    <X className="h-5 w-5 mr-2" />
                    {language === 'bn' ? 'বাতিল করুন' : 'Reject'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
