"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X, ShoppingCart, MapPin, Percent, FileText, Download } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface DiagnosticTest {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  preparation?: string;
  fastingRequired?: boolean;
  image?: string;
}

interface DiagnosticCenter {
  _id: string;
  name: string;
  division?: string;
  district?: string;
  thana?: string;
  address?: string;
  phone?: string;
  email?: string;
  packageDiscount?: number;
  minTestsForPackage?: number;
}

interface CartItem extends DiagnosticTest {
  quantity: number;
}

const categories = [
  { id: "Blood Tests", name: "Blood Tests", icon: "🩸" },
  { id: "Cardiology", name: "Cardiology", icon: "❤️" },
  { id: "Imaging", name: "Imaging", icon: "📷" },
  { id: "Pathology", name: "Pathology", icon: "🔬" },
];

export default function DiagnosticPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [showPaymentSlip, setShowPaymentSlip] = useState(false);

  // Location filters
  const [divisions, setDivisions] = useState<Array<{_id: string; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{_id: string; name: string}>>([]);
  const [thanas, setThanas] = useState<Array<{_id: string; name: string}>>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedThana, setSelectedThana] = useState("");

  const fetchTests = useCallback(async () => {
    try {
      const url = selectedCategory
        ? `/api/diagnostic/tests?category=${selectedCategory}`
        : "/api/diagnostic/tests";
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchCenters = useCallback(async () => {
    try {
      let url = "/api/diagnostic/centers";
      const params = new URLSearchParams();
      if (selectedDivision) params.append("division", selectedDivision);
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedThana) params.append("thana", selectedThana);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setCenters(data.centers);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  }, [selectedDivision, selectedDistrict, selectedThana]);

  useEffect(() => {
    fetchTests();
    fetchCenters();
    fetchDivisions();
  }, [fetchTests, fetchCenters]);

  useEffect(() => {
    fetchCenters();
  }, [selectedDivision, selectedDistrict, selectedThana, fetchCenters]);

  useEffect(() => {
    if (selectedDivision) {
      const division = divisions.find(d => d.name === selectedDivision);
      if (division) {
        fetch(`/api/locations/districts?division=${division._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.districts) setDistricts(data.districts);
          });
      }
    } else {
      setDistricts([]);
      setThanas([]);
    }
  }, [selectedDivision, divisions]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.name === selectedDistrict);
      if (district) {
        fetch(`/api/locations/thanas?district=${district._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.thanas) setThanas(data.thanas);
          });
      }
    } else {
      setThanas([]);
    }
  }, [selectedDistrict, districts]);

  const fetchDivisions = async () => {
    try {
      const response = await fetch("/api/locations/divisions");
      const data = await response.json();
      if (response.ok) {
        setDivisions(data.divisions);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Filter tests
  const filteredTests = useMemo(() => {
    let filtered = [...tests];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        test =>
          test.name.toLowerCase().includes(query) ||
          test.category.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [tests, searchQuery]);

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    const totalTests = cart.reduce((sum, item) => sum + item.quantity, 0);
    let discount = 0;

    // Discount tiers
    if (totalTests >= 10) discount = 15; // 15% off for 10+ tests
    else if (totalTests >= 5) discount = 10; // 10% off for 5+ tests
    else if (totalTests >= 3) discount = 5; // 5% off for 3+ tests

    // Additional center package discount
    if (selectedCenter) {
      const center = centers.find(c => c._id === selectedCenter);
      if (center && totalTests >= (center.minTestsForPackage || 3)) {
        discount += center.packageDiscount || 0;
      }
    }

    return Math.min(discount, 30); // Max 30% discount
  }, [cart, selectedCenter, centers]);

  const discountedTotal = useMemo(() => {
    const discountAmount = (cartTotal * cartDiscount) / 100;
    return cartTotal - discountAmount;
  }, [cartTotal, cartDiscount]);

  const addToCart = (test: DiagnosticTest) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === test._id);
      if (existing) {
        return prev.map(item =>
          item._id === test._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...test, quantity: 1 }];
    });
  };

  const removeFromCart = (testId: string) => {
    setCart(prev => prev.filter(item => item._id !== testId));
  };

  const updateQuantity = (testId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(testId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item._id === testId ? { ...item, quantity } : item
      )
    );
  };

  const generatePaymentSlip = () => {
    setShowPaymentSlip(true);
  };

  const downloadPaymentSlip = () => {
    const slipContent = `
═══════════════════════════════════════
     MEDI TIME DIAGNOSTIC SERVICES
═══════════════════════════════════════

Payment Slip
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

───────────────────────────────────────
SELECTED TESTS
───────────────────────────────────────
${cart.map(item => `${item.name} x${item.quantity} - ${item.price * item.quantity}৳`).join('\n')}

───────────────────────────────────────
PRICE SUMMARY
───────────────────────────────────────
Subtotal:              ${cartTotal}৳
Discount (${cartDiscount}%):      -${(cartTotal * cartDiscount) / 100}৳
───────────────────────────────────────
TOTAL:                 ${discountedTotal}৳
───────────────────────────────────────

${selectedCenter ? `Diagnostic Center: ${centers.find(c => c._id === selectedCenter)?.name || 'N/A'}\n` : ''}
Total Tests: ${cart.reduce((sum, item) => sum + item.quantity, 0)}

Thank you for choosing Medi Time!
═══════════════════════════════════════
    `;

    const blob = new Blob([slipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-slip-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: tests.filter(t => t.category === cat.id).length,
    }));
  }, [tests]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - 70% of homepage height */}
      <div className="relative mt-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="h-[350px] sm:h-[385px] lg:h-[420px] rounded-2xl overflow-hidden">
            <div className="relative h-full w-full">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(/slide.jpg)`,
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full items-center justify-center">
                <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="mx-auto max-w-3xl text-center text-white">
                    <h1 className="mb-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      Find the Most Affordable Diagnostic Options
                    </h1>
                    <p className="mb-8 text-base leading-relaxed sm:text-lg lg:text-xl">
                      Save up to 15% Using our membership cards in all types of Diagnostic Tests.
                    </p>
                    <a 
                      href="/membership"
                      className="inline-flex items-center bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-base px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                      Order Membership Card
                      <svg
                        className="ml-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mt-10 mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
            <Input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-4 py-6 text-lg border-2 border-gray-300 focus:border-primary rounded-xl shadow-lg focus:shadow-xl transition-all"
            />
          </div>
        </div>

  
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tests List */}
          <div className="lg:col-span-2">
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredTests.length} of {tests.length} tests
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading tests...</div>
            ) : filteredTests.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500">No tests found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTests.map((test) => (
                  <Card key={test._id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image Section */}
                      <div className="sm:w-48 h-48 sm:h-auto relative bg-gray-100 shrink-0">
                        {test.image ? (
                          <img
                            src={test.image}
                            alt={test.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FileText className="h-12 w-12" />
                          </div>
                        )}
                        {test.fastingRequired && (
                          <div className="absolute top-2 left-2 bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            Fasting Required
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-full mb-2 inline-block">
                                {test.category}
                              </span>
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                {test.name}
                              </h3>
                            </div>
                            <div className="text-right">
                              {test.originalPrice && test.originalPrice > test.price && (
                                <div className="text-sm text-gray-400 line-through mb-1">
                                  {test.originalPrice}৳
                                </div>
                              )}
                              <div className="text-2xl font-bold text-primary">
                                {test.price}৳
                              </div>
                            </div>
                          </div>

                          {test.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {test.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                            {test.duration && (
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                <span className="text-xs">⏱️</span>
                                <span>{test.duration}</span>
                              </div>
                            )}
                            {test.preparation && (
                              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                                <span className="text-xs">📋</span>
                                <span className="truncate max-w-[200px]">{test.preparation}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                          <Button 
                            onClick={() => addToCart(test)} 
                            className="bg-gray-900 hover:bg-primary text-white transition-colors rounded-full px-6"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:sticky lg:top-6 h-fit">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
                {cart.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCart([])}
                  >
                    Clear
                  </Button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item._id)}
                            className="p-1 h-6 w-6"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              +
                            </Button>
                          </div>
                          <span className="font-semibold">
                            {item.price * item.quantity}৳
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Discount Info */}
                  {cartDiscount > 0 && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <Percent className="h-4 w-4" />
                        <span className="font-semibold">
                          {cartDiscount}% Discount Applied!
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} tests selected
                      </p>
                    </div>
                  )}

                  {/* Select Diagnostic Center */}
                  {centers.length > 0 && (
                    <div className="mb-4">
                      <Label className="mb-2 block">Select Diagnostic Center</Label>
                      <select
                        value={selectedCenter}
                        onChange={(e) => setSelectedCenter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Choose a center</option>
                        {centers.map((center) => (
                          <option key={center._id} value={center._id}>
                            {center.name}
                            {center.packageDiscount && center.minTestsForPackage && (
                              <span>
                                {" "}
                                - {center.packageDiscount}% off on {center.minTestsForPackage}+ tests
                              </span>
                            )}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{cartTotal}৳</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({cartDiscount}%):</span>
                        <span>-{(cartTotal * cartDiscount) / 100}৳</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span className="text-primary">{discountedTotal}৳</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">
                    <Button
                      className="w-full"
                      onClick={generatePaymentSlip}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Payment Slip
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* Payment Slip Modal */}
        {showPaymentSlip && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Payment Slip</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentSlip(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 font-mono text-sm">
                <div className="text-center border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold">MEDI TIME DIAGNOSTIC SERVICES</h3>
                  <p className="text-gray-600">
                    {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">SELECTED TESTS</h4>
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between py-1">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>{item.price * item.quantity}৳</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>{cartTotal}৳</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-green-600 mb-2">
                      <span>Discount ({cartDiscount}%):</span>
                      <span>-{(cartTotal * cartDiscount) / 100}৳</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                    <span>TOTAL:</span>
                    <span className="text-primary">{discountedTotal}৳</span>
                  </div>
                </div>

                {selectedCenter && (
                  <div className="border-t border-gray-200 pt-4">
                    <p>
                      <strong>Diagnostic Center:</strong>{" "}
                      {centers.find((c) => c._id === selectedCenter)?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Total Tests:</strong>{" "}
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>
                )}

                <div className="text-center border-t border-gray-200 pt-4 text-gray-600">
                  <p>Thank you for choosing Medi Time!</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  className="flex-1"
                  onClick={downloadPaymentSlip}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Slip
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPaymentSlip(false)}
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
    
  );
}
