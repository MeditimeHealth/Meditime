"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DiagnosticTest {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
}

export default function DiagnosticPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/diagnostic/tests");
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const categoryCounts = {
    "Blood Tests": tests.filter((t) => t.category === "Blood Tests").length,
    "Cardiology": tests.filter((t) => t.category === "Cardiology").length,
    "Imaging": tests.filter((t) => t.category === "Imaging").length,
    "Pathology": tests.filter((t) => t.category === "Pathology").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic Management</h1>
          <p className="text-gray-600 mt-2">Manage tests and diagnostic centers</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Blood Tests</div>
          <div className="text-3xl font-bold text-primary">{categoryCounts["Blood Tests"]}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Cardiology</div>
          <div className="text-3xl font-bold text-primary">{categoryCounts["Cardiology"]}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Imaging</div>
          <div className="text-3xl font-bold text-primary">{categoryCounts["Imaging"]}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Pathology</div>
          <div className="text-3xl font-bold text-primary">{categoryCounts["Pathology"]}</div>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Tests</h3>
              <p className="text-gray-600 mb-4">
                Create and manage diagnostic tests across all categories
              </p>
              <Link href="/admin/diagnostic/tests">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Tests
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Centers</h3>
              <p className="text-gray-600 mb-4">
                Create and manage diagnostic centers with location and pricing
              </p>
              <Link href="/admin/diagnostic/centers">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Centers
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

