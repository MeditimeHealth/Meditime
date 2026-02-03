// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";

// interface Ambulance {
//   _id: string;
//   name: string;
//   phoneNumber: string;
//   division?: string;
//   district?: string;
//   thana?: string;
//   availabilityStatus: string;
//   vehicleType: string;
// }

// export default function AmbulancesPage() {
//   const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchAmbulances();
//   }, []);

//   const fetchAmbulances = async () => {
//     try {
//       const response = await fetch("/api/ambulances");
//       const data = await response.json();
//       if (response.ok) {
//         setAmbulances(data.ambulances);
//       }
//     } catch (error) {
//       console.error("Error fetching ambulances:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this ambulance?")) return;

//     try {
//       const response = await fetch(`/api/ambulances/${id}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         setAmbulances(ambulances.filter((ambulance) => ambulance._id !== id));
//         alert("Ambulance deleted successfully");
//       } else {
//         const data = await response.json();
//         alert(data.error || "Failed to delete ambulance");
//       }
//     } catch (error) {
//       console.error("Error deleting ambulance:", error);
//       alert("Failed to delete ambulance");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-gray-500">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">All Ambulances</h1>
//           <p className="text-gray-600 mt-2">Manage ambulance services</p>
//         </div>
//         <Link href="/admin/ambulances/create">
//           <Button className="cursor-pointer">
//             <Plus className="h-4 w-4 mr-2" />
//             Create Ambulance
//           </Button>
//         </Link>
//       </div>

//       {ambulances.length === 0 ? (
//         <Card className="p-12 text-center">
//           <p className="text-gray-500 mb-4">No ambulances found</p>
//           <Link href="/admin/ambulances/create">
//             <Button>Create First Ambulance</Button>
//           </Link>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {ambulances.map((ambulance) => (
//             <Card key={ambulance._id} className="p-6">
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-xl font-semibold text-gray-900">
//                     {ambulance.name}
//                   </h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Vehicle Type:{" "}
//                     <span className="font-semibold text-primary">
//                       {ambulance.vehicleType}
//                     </span>
//                   </p>
//                 </div>

//                 <div className="space-y-2 text-sm">
//                   <div>
//                     <span className="text-gray-600">Phone: </span>
//                     <span className="text-gray-900">
//                       {ambulance.phoneNumber}
//                     </span>
//                   </div>
//                   {(ambulance.division ||
//                     ambulance.district ||
//                     ambulance.thana) && (
//                     <div>
//                       <span className="text-gray-600">Location: </span>
//                       <span className="text-gray-900">
//                         {[
//                           ambulance.division,
//                           ambulance.district,
//                           ambulance.thana,
//                         ]
//                           .filter(Boolean)
//                           .join(", ")}
//                       </span>
//                     </div>
//                   )}
//                   <div>
//                     <span className="text-gray-600">Status: </span>
//                     <span
//                       className={`font-medium ${
//                         ambulance.availabilityStatus === "Available"
//                           ? "text-green-600"
//                           : ambulance.availabilityStatus === "On Call"
//                             ? "text-yellow-600"
//                             : "text-red-600"
//                       }`}
//                     >
//                       {ambulance.availabilityStatus}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex gap-2 pt-4">
//                   <Button variant="outline" className="flex-1 cursor-pointer">
//                     Edit
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="flex-1 cursor-pointer"
//                     onClick={() => handleDelete(ambulance._id)}
//                   >
//                     Delete
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import clsx from "clsx";

interface Ambulance {
  _id: string;
  name: string;
  phoneNumber: string;
  ambulanceNumber: string; // ← added
  drivingLicence: string; // ← added
  division?: string;
  district?: string;
  thana?: string;
  availabilityStatus: string;
  vehicleType: string;
}

export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const response = await fetch("/api/ambulances");
      const data = await response.json();
      if (response.ok) {
        setAmbulances(data.ambulances);
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ambulance?")) return;

    try {
      const response = await fetch(`/api/ambulances/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAmbulances(ambulances.filter((ambulance) => ambulance._id !== id));
        alert("Ambulance deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete ambulance");
      }
    } catch (error) {
      console.error("Error deleting ambulance:", error);
      alert("Failed to delete ambulance");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Ambulances</h1>
          <p className="text-gray-600 mt-2">Manage ambulance services</p>
        </div>
        <Link href="/admin/ambulances/create">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Ambulance
          </Button>
        </Link>
      </div>

      {ambulances.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No ambulances found</p>
          <Link href="/admin/ambulances/create">
            <Button>Create First Ambulance</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ambulances.map((ambulance) => (
            <Card key={ambulance._id} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {ambulance.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Vehicle Type:{" "}
                    <span className="font-semibold text-primary">
                      {ambulance.vehicleType}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Phone: </span>
                    <span className="text-gray-900">
                      {ambulance.phoneNumber}
                    </span>
                  </div>

                  {/* ──────────────── NEW FIELDS DISPLAYED HERE ──────────────── */}
                  <div>
                    <span className="text-gray-600">Ambulance No: </span>
                    <span className="text-gray-900">
                      {ambulance.ambulanceNumber || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Driving Licence: </span>
                    <span className="text-gray-900">
                      {ambulance.drivingLicence || "—"}
                    </span>
                  </div>
                  {/* ────────────────────────────────────────────────────────────── */}

                  {(ambulance.division ||
                    ambulance.district ||
                    ambulance.thana) && (
                    <div>
                      <span className="text-gray-600">Location: </span>
                      <span className="text-gray-900">
                        {[
                          ambulance.division,
                          ambulance.district,
                          ambulance.thana,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Status: </span>
                    <span
                      className={`font-medium ${
                        ambulance.availabilityStatus === "Available"
                          ? "text-green-600"
                          : ambulance.availabilityStatus === "On Call"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {ambulance.availabilityStatus}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Link href={`/admin/ambulances/edit/${ambulance._id}`} className="flex-1">
                    <Button variant="outline" className="w-full cursor-pointer">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleDelete(ambulance._id)}
                  >
                    Delete
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
