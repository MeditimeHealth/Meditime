"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Building2,
  CheckCircle2,
  Loader2,
  FileText
} from "lucide-react";

interface Appointment {
  _id: string;
  patientName: string;
  mobileNumber: string;
  appointmentDate: string;
  hospitalName: string;
  doctorId: {
    name: string;
    qualification: string;
    hospital?: string;
  };
  affiliateId: {
    _id: string;
    name: string;
    affiliateCode: string;
    email: string;
    phoneNumber: string;
  };
  hasCommission: boolean;
}

interface Commission {
  _id: string;
  appointmentId: string;
  totalBill: number;
  commissionType: string;
  commissionValue: number;
  commissionAmount: number;
  status: string;
}

export default function AffiliateCommissionsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('pending');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Commission form state
  const [totalBill, setTotalBill] = useState("");
  const [commissionType, setCommissionType] = useState<'percentage' | 'flat'>('percentage');
  const [commissionValue, setCommissionValue] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const hasCommissionParam = filter === 'pending' ? 'false' : filter === 'processed' ? 'true' : '';
      const url = `/api/admin/affiliate-appointments${hasCommissionParam ? `?hasCommission=${hasCommissionParam}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = () => {
    const bill = parseFloat(totalBill) || 0;
    const value = parseFloat(commissionValue) || 0;
    
    if (commissionType === 'percentage') {
      return (bill * value) / 100;
    }
    return value;
  };

  const handleSubmitCommission = async () => {
    if (!selectedAppointment || !totalBill || !commissionValue) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/affiliate-commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          totalBill: parseFloat(totalBill),
          commissionType,
          commissionValue: parseFloat(commissionValue),
          notes,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Approve immediately
        const approveResponse = await fetch(
          `/api/admin/affiliate-commissions/${data.commission._id}/approve`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              adminId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}')._id : null,
            }),
          }
        );

        if (approveResponse.ok) {
          alert('Commission approved and credited to affiliate wallet!');
          setSelectedAppointment(null);
          setTotalBill("");
          setCommissionValue("");
          setNotes("");
          fetchAppointments();
        } else {
          alert('Commission created but failed to approve');
        }
      } else {
        alert(data.error || 'Failed to create commission');
      }
    } catch (error) {
      console.error('Error submitting commission:', error);
      alert('Failed to submit commission');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Commissions</h1>
        <p className="text-gray-600 mt-1">Manage affiliate commissions and payments</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending Commissions
          </Button>
          <Button
            variant={filter === 'processed' ? 'default' : 'outline'}
            onClick={() => setFilter('processed')}
          >
            Processed
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Appointments
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appointments with Affiliate Code</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No appointments found</p>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card
                key={appointment._id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedAppointment?._id === appointment._id 
                    ? 'border-2 border-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                      <p className="text-sm text-gray-600">Dr. {appointment.doctorId.name}</p>
                    </div>
                    {appointment.hasCommission && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{appointment.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{appointment.hospitalName}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        Affiliate: {appointment.affiliateId.name} ({appointment.affiliateId.affiliateCode})
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Commission Form */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          {selectedAppointment ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Set Commission</h2>

              <div className="space-y-4">
                {/* Appointment Info */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Patient: {selectedAppointment.patientName}</p>
                  <p className="text-sm text-gray-600">
                    Affiliate: {selectedAppointment.affiliateId.name} ({selectedAppointment.affiliateId.affiliateCode})
                  </p>
                </div>

                {/* Total Bill */}
                <div>
                  <Label htmlFor="totalBill">Total Bill Amount (BDT) *</Label>
                  <Input
                    id="totalBill"
                    type="number"
                    value={totalBill}
                    onChange={(e) => setTotalBill(e.target.value)}
                    placeholder="Enter total bill"
                    className="mt-1"
                    min="0"
                  />
                </div>

                {/* Commission Type */}
                <div>
                  <Label>Commission Type *</Label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="commissionType"
                        value="percentage"
                        checked={commissionType === 'percentage'}
                        onChange={() => setCommissionType('percentage')}
                        className="w-4 h-4"
                      />
                      <span>Percentage (%)</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="commissionType"
                        value="flat"
                        checked={commissionType === 'flat'}
                        onChange={() => setCommissionType('flat')}
                        className="w-4 h-4"
                      />
                      <span>Flat Rate (BDT)</span>
                    </label>
                  </div>
                </div>

                {/* Commission Value */}
                <div>
                  <Label htmlFor="commissionValue">
                    {commissionType === 'percentage' ? 'Percentage (%)' : 'Amount (BDT)'} *
                  </Label>
                  <Input
                    id="commissionValue"
                    type="number"
                    value={commissionValue}
                    onChange={(e) => setCommissionValue(e.target.value)}
                    placeholder={commissionType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                    className="mt-1"
                    min="0"
                    step={commissionType === 'percentage' ? '0.1' : '1'}
                  />
                </div>

                {/* Calculated Commission */}
                {totalBill && commissionValue && (
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Commission Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        ৳{calculateCommission().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitCommission}
                  disabled={submitting || !totalBill || !commissionValue}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Approve & Credit Commission
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                Select an appointment to set commission
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
