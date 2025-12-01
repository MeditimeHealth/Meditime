"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Search, Image as ImageIcon, DollarSign, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { showToast } from "@/lib/toast";

interface AffiliateRequest {
  _id: string;
  affiliateId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    affiliateCode: string;
    paymentMethod?: string;
    paymentDetails?: string;
  };
  patientName: string;
  patientPhone: string;
  doctorName: string;
  hospitalName: string;
  proofPhoto?: string;
  proofPhotos?: string[];
  appointmentId?: string;
  commissionAmount?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AffiliatePhotoRequestsPage() {
  const [requests, setRequests] = useState<AffiliateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AffiliateRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/affiliate-requests");
      const data = await response.json();
      if (response.ok) {
        // Filter only requests with photos
        const photoRequests = (data.requests || []).filter((req: AffiliateRequest) => 
          req.proofPhoto || (req.proofPhotos && req.proofPhotos.length > 0)
        );
        setRequests(photoRequests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      showToast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (request: AffiliateRequest) => {
    setSelectedRequest(request);
    setCommissionAmount(request.commissionAmount?.toString() || "");
    setApprovalDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    const amount = parseFloat(commissionAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast.error("Please enter a valid commission amount");
      return;
    }

    setApproving(true);
    try {
      const response = await fetch("/api/admin/affiliate-requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest._id,
          commissionAmount: amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success("Request approved and commission added!");
        setApprovalDialogOpen(false);
        setSelectedRequest(null);
        setCommissionAmount("");
        fetchRequests();
      } else {
        showToast.error(data.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showToast.error("An error occurred");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm("Are you sure you want to reject this request?")) return;

    setRejecting(true);
    try {
      const response = await fetch("/api/admin/affiliate-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: "rejected" }),
      });

      if (response.ok) {
        showToast.success("Request rejected");
        fetchRequests();
      } else {
        showToast.error("Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast.error("An error occurred");
    } finally {
      setRejecting(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.patientPhone.includes(searchTerm) ||
      req.affiliateId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.affiliateId?.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && req.status === 'pending';
  });

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Photo Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve affiliate photo submissions with commission</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Affiliate</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Patient Details</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm">Doctor/Hospital</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Photo</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No pending photo requests found</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                      <div className="text-xs text-gray-400 mt-1">
                        {format(new Date(req.createdAt), 'h:mm a')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium text-gray-900">{req.affiliateId?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{req.affiliateId?.affiliateCode}</div>
                      <div className="text-xs text-gray-500">{req.affiliateId?.phoneNumber}</div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium text-gray-900">{req.patientName}</div>
                      <div className="text-xs text-gray-500">{req.patientPhone}</div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="font-medium text-gray-900">{req.doctorName}</div>
                      <div className="text-xs text-gray-500">{req.hospitalName}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {(req.proofPhotos && req.proofPhotos.length > 0) || req.proofPhoto ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View {((req.proofPhotos && req.proofPhotos.length > 0) ? req.proofPhotos.length : 1)} Photo(s)
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Proof Photos</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                              {req.proofPhotos && req.proofPhotos.length > 0 ? (
                                req.proofPhotos.map((photo, idx) => (
                                  <div key={idx} className="relative">
                                    <img
                                      src={photo}
                                      alt={`Proof ${idx + 1}`}
                                      className="w-full h-auto rounded-lg"
                                    />
                                  </div>
                                ))
                              ) : req.proofPhoto ? (
                                <div className="relative">
                                  <img
                                    src={req.proofPhoto}
                                    alt="Proof"
                                    className="w-full h-auto rounded-lg"
                                  />
                                </div>
                              ) : null}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-gray-400">No photo</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200">
                        <Clock className="h-3.5 w-3.5" />
                        Pending
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveClick(req)}
                          className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(req._id)}
                          disabled={rejecting}
                          className="h-8 px-3"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request & Add Commission</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Affiliate</p>
                <p className="font-medium">{selectedRequest.affiliateId?.fullName}</p>
                <p className="text-sm text-gray-500">{selectedRequest.affiliateId?.affiliateCode}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Patient</p>
                <p className="font-medium">{selectedRequest.patientName}</p>
                <p className="text-sm text-gray-500">{selectedRequest.patientPhone}</p>
              </div>
              <div>
                <Label htmlFor="commission">Commission Amount (Flat Rate) *</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  step="0.01"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  placeholder="Enter commission amount"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">This amount will be added to the affiliate's wallet</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setApprovalDialogOpen(false);
                    setSelectedRequest(null);
                    setCommissionAmount("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approving || !commissionAmount || parseFloat(commissionAmount) <= 0}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {approving ? "Processing..." : "Approve & Add Commission"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
