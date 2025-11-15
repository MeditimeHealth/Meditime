import { Card } from "@/components/ui/card";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-2">Manage patient appointments</p>
      </div>

      <Card className="p-6">
        <p className="text-gray-500">No appointments yet.</p>
      </Card>
    </div>
  );
}

