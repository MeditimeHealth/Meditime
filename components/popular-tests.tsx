"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface DiagnosticTest {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
}

export default function PopularTests() {
  const [popularTests, setPopularTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTests();
  }, []);

  const fetchPopularTests = async () => {
    try {
      const response = await fetch("/api/diagnostic/tests");
      const data = await response.json();
      if (response.ok && data.tests) {
        // Get first 6 tests as popular
        setPopularTests(data.tests.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching popular tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryCounts = {
    "Blood Tests": popularTests.filter(t => t.category === "Blood Tests").length,
    "Cardiology": popularTests.filter(t => t.category === "Cardiology").length,
    "Imaging": popularTests.filter(t => t.category === "Imaging").length,
    "Pathology": popularTests.filter(t => t.category === "Pathology").length,
  };

  if (loading) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Category Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-2">🩸</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {categoryCounts["Blood Tests"] || 45}
            </div>
            <div className="text-sm text-gray-600">Blood Tests</div>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-2">❤️</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {categoryCounts["Cardiology"] || 12}
            </div>
            <div className="text-sm text-gray-600">Cardiology</div>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-2">📷</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {categoryCounts["Imaging"] || 18}
            </div>
            <div className="text-sm text-gray-600">Imaging</div>
          </Card>
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-2">🔬</div>
            <div className="text-3xl font-bold text-primary mb-1">
              {categoryCounts["Pathology"] || 32}
            </div>
            <div className="text-sm text-gray-600">Pathology</div>
          </Card>
        </div>

        {/* Popular Tests Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Tests</h2>
            <p className="text-gray-600">Most requested diagnostic tests</p>
          </div>
          <Link href="/diagnostic">
            <Button variant="outline">
              View All Tests
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {popularTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTests.map((test) => (
              <Card key={test._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {test.name}
                    </h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {test.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {test.originalPrice && test.originalPrice > test.price && (
                      <span className="text-sm text-gray-400 line-through mr-2">
                        {test.originalPrice}৳
                      </span>
                    )}
                    <span className="text-xl font-bold text-primary">
                      {test.price}৳
                    </span>
                  </div>
                  <Link href="/diagnostic">
                    <Button size="sm">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">No tests available yet</p>
            <Link href="/diagnostic">
              <Button>Browse Tests</Button>
            </Link>
          </Card>
        )}
      </div>
    </section>
  );
}

