import { Card } from "@/components/ui/card";

interface DiagnosticInvoiceProps {
  selectedVenue: any;
  checkoutData: any;
  bookedTests: any[];
  totalPrice: number;
  bookingRef: string;
  uniqueRecs: string[];
}

export default function DiagnosticInvoice({
  selectedVenue,
  checkoutData,
  bookedTests,
  totalPrice,
  bookingRef,
  uniqueRecs
}: DiagnosticInvoiceProps) {
  return (
    <Card className="overflow-hidden border border-slate-200 shadow-lg">
      {/* Teal Header */}
      <div className="bg-[#004B50] text-white px-8 py-6">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-2 rounded-xl">
            <img src="/logo.png" alt="MediTime Logo" className="h-8 w-auto" />
          </div>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{selectedVenue?.name || 'MediTime Diagnostics'}</h1>
            <p className="text-white/60 text-sm mt-1">Booked via MediTime Portal</p>
          </div>
          <div className="text-right">
            {bookingRef && bookingRef !== "PENDING" && (
              <>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Booking ID</p>
                <p className="text-lg font-bold text-[#FFD700] mt-0.5">{bookingRef}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Patient & Appointment */}
        <div>
          <h2 className="text-sm font-bold text-[#004B50] uppercase tracking-wider border-b-2 border-[#004B50] pb-2 mb-5">
            Patient & Appointment Information
          </h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-5">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient Name</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{checkoutData.patientName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patient ID</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">PID-{checkoutData.mobileNumber?.slice(-5) || '00000'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date & Time</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {new Date(checkoutData.appointmentDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Center Location</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{selectedVenue?.address}</p>
            </div>
          </div>
        </div>

        {/* Booked Tests Table */}
        <div>
          <h2 className="text-sm font-bold text-[#004B50] uppercase tracking-wider mb-4">Booked Tests</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Test Name</th>
                  <th className="text-right py-3 px-4 font-bold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookedTests.map((test: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 px-4 text-slate-900">{test.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">৳{test.price || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal:</span><span>৳{totalPrice}</span></div>
            <div className="flex justify-between text-slate-500"><span>Platform Fee:</span><span>৳0</span></div>
            <div className="flex justify-between text-green-600"><span>Discount:</span><span>-৳0</span></div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-lg font-bold text-[#004B50]">
              <span>Total Due:</span><span>৳{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Pre-Test Instructions */}
        {uniqueRecs.length > 0 && (
          <div className="border-l-4 border-[#FFD700] bg-amber-50/50 rounded-r-lg p-5">
            <h3 className="text-sm font-bold text-amber-700 mb-3">Pre-Test Instructions</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {uniqueRecs.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span className="text-slate-800 font-medium">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
