import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Medi Time admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xl">👨‍⚕️</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xl">📅</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">৳0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-xl">💰</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/doctors/create"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Create New Doctor</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new doctor profile to the system</p>
          </a>
          <a
            href="/admin/doctors"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Manage Doctors</h3>
            <p className="text-sm text-gray-600 mt-1">View and edit existing doctor profiles</p>
          </a>
          <a
            href="/admin/affiliate-withdrawals"
            className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Affiliate Withdrawal Requests</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and process affiliate withdrawal requests
            </p>
          </a>
        </div>
      </Card>
    </div>
  );
}

