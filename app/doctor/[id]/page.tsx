"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Star,
  Clock,
  Building2,
  MapPin,
  Award,
  Phone,
  Check,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";
import DoctorCard from "@/components/doctor-card";
import PageLoader from "@/components/page-loader";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { IDoctor } from "@/models/Doctor";




const banglaDays = [
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
  "রবিবার",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getBengaliDay = (day: string): string => {
  const index = daysOfWeek.indexOf(day);
  return index >= 0 ? banglaDays[index] : day;
};

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [relatedDoctors, setRelatedDoctors] = useState<IDoctor[]>([]);
  const [hospitals, setHospitals] = useState<{ name: string, nameBn?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [departmentDiseases, setDepartmentDiseases] = useState<Array<{ name: string, bangla: string }>>([]);
  const [departmentInfo, setDepartmentInfo] = useState<{ name: string, nameBn?: string } | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
      fetchRelatedDoctors();
      fetchHospitals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/locations/hospitals");
      const data = await response.json();
      if (response.ok && data.hospitals) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`);
      const data = await response.json();
      if (response.ok && data.doctor) {
        setDoctor(data.doctor);
        console.log("Fetched doctor data:", data.doctor);

        // Populate diseases from doctor's specific list first
        if (data.doctor.diseases && data.doctor.diseases.length > 0) {
          const mappedDiseases = data.doctor.diseases.map((d: string) => ({
            name: d,
            bangla: d
          }));
          setDepartmentDiseases(mappedDiseases);
        }

        // Also fetch diseases for the doctor's department to supplement the list
        if (data.doctor.department) {
          fetchDepartmentDiseases(data.doctor.department);
        }
      } else {
        router.push("/doctor");
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      router.push("/doctor");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentDiseases = async (departmentName: string) => {
    try {
      // First, get the department ID by name
      const deptResponse = await fetch(`/api/departments?name=${encodeURIComponent(departmentName)}`);
      const deptData = await deptResponse.json();

      if (deptData.departments && deptData.departments.length > 0) {
        const department = deptData.departments[0];
        // Store department info for language switching
        setDepartmentInfo({
          name: department.name || departmentName,
          nameBn: department.nameBn
        });

        // Then fetch diseases for this department
        const diseaseResponse = await fetch(`/api/diseases?department=${department._id}`);
        const diseaseData = await diseaseResponse.json();

        if (diseaseData.diseases && diseaseData.diseases.length > 0) {
          // Store both English and Bangla names
          const diseasesWithBothNames = diseaseData.diseases
            .map((disease: { name: string, bangla: string }) => ({
              name: disease.name || '',
              bangla: disease.bangla || disease.name || ''
            }))
            .filter((d: { name: string, bangla: string }) => d.name || d.bangla); // Filter out empty diseases

          setDepartmentDiseases(prev => {
            // Merge with existing (doctor-specific) diseases, avoiding duplicates
            const existingNames = new Set(prev.map(d => d.name.toLowerCase()));
            const filteredNew = diseasesWithBothNames.filter((d: any) => !existingNames.has(d.name.toLowerCase()));
            return [...prev, ...filteredNew];
          });
        }
      } else {
        // If department not found, still set the department name
        setDepartmentInfo({
          name: departmentName,
          nameBn: undefined
        });
      }
    } catch (error) {
      console.error("Error fetching department diseases:", error);
    }
  };

  // Helper to calculate similarity score
  const calculateRelevanceScore = (currentDoc: IDoctor, otherDoc: IDoctor): number => {
    let score = 0;
    if (otherDoc.department === currentDoc.department) score += 10;
    if (otherDoc.hospital === currentDoc.hospital) score += 5;
    // Assuming same division/district implies "same area" if hospital is different
    if (otherDoc.district === currentDoc.district) score += 2;
    if (otherDoc.division === currentDoc.division) score += 1;
    return score;
  };

  const fetchRelatedDoctors = async () => {
    if (!doctor) return;

    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok && data.doctors) {
        // Filter out current doctor
        let filtered = data.doctors.filter((d: IDoctor) => d._id !== doctorId);

        // If in Bangla mode, prioritize/filter doctors with Bangla names to avoid mixing
        if (language === 'bn') {
          const withBn = filtered.filter((d: IDoctor) => d.nameBn);
          // If we have enough Bangla doctors, use only them. Otherwise, keep original to show something.
          if (withBn.length >= 4) {
            filtered = withBn;
          } else {
            // Sort so Bangla ones come first
            filtered = filtered.sort((a: IDoctor, b: IDoctor) => {
              if (a.nameBn && !b.nameBn) return -1;
              if (!a.nameBn && b.nameBn) return 1;
              return 0;
            });
          }
        }

        // Sort by relevance score
        const sorted = filtered.sort((a: IDoctor, b: IDoctor) => {
          const relevanceA = calculateRelevanceScore(doctor, a);
          const relevanceB = calculateRelevanceScore(doctor, b);

          // Secondary sort by relevance
          if (relevanceA !== relevanceB) return relevanceB - relevanceA;

          // Tertiary sort: prioritize doctors with images if scores are same
          if (a.image && !b.image) return -1;
          if (!a.image && b.image) return 1;

          return 0;
        });

        setRelatedDoctors(sorted.slice(0, 4)); // Take top 4
      }
    } catch (error) {
      console.error("Error fetching related doctors:", error);
    }
  };


  // Trigger fetchRelatedDoctors when doctor is loaded
  useEffect(() => {
    if (doctor) {
      fetchRelatedDoctors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor, language]);

  if (loading) {
    return <PageLoader />;
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Doctor not found</p>
            <Link href="/doctor">
              <Button>Back to Doctors</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const availabilityArray = Array.isArray(doctor.availability)
    ? doctor.availability
    : [doctor.availability];



  const enrichedDoctor = {
    ...doctor,
    hospitalBn: hospitals.find(h => h.name === doctor.hospital)?.nameBn || doctor.hospitalBn || ""
  };

  const fees = [doctor.newPatientFee, doctor.reportShowFee].filter(f => f !== undefined && f !== null && f > 0) as number[];
  const minFee = fees.length > 0 ? Math.min(...fees) : doctor.newPatientFee;


  const enrichedRelatedDoctors = relatedDoctors.map(rd => ({
    ...rd,
    hospitalBn: hospitals.find(h => h.name === rd.hospital)?.nameBn || rd.hospitalBn || ""
  }));



  // Dynamic JSON-LD Schema Markup for SEO
  const baseUrl = "https://meditime.com.bd";
  const doctorUrl = `${baseUrl}/doctor/${doctor.slug || doctor._id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": "Meditime",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "Meditime",
        "publisher": { "@id": `${baseUrl}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${doctorUrl}#webpage`,
        "url": doctorUrl,
        "name": doctor.name,
        "isPartOf": { "@id": `${baseUrl}/#website` }
      },
      {
        "@type": "Physician",
        "@id": `${doctorUrl}#physician`,
        "name": doctor.name,
        "image": doctor.image || `${baseUrl}/logo.png`,
        "description": getLocalizedValue(doctor.bio, doctor.bioBn, language) || `${doctor.name} - ${doctor.specialty}`,
        "url": doctorUrl,
        "medicalSpecialty": doctor.specialty,
        "telephone": "+8801946102102",
        "priceRange": minFee ? `৳${minFee}` : undefined,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": doctor.thana || "",
          "addressRegion": doctor.district || "",
          "addressCountry": "BD"
        },
        "aggregateRating": doctor.rating ? {
          "@type": "AggregateRating",
          "ratingValue": doctor.rating,
          "reviewCount": "10", // Placeholder if no actual count
          "bestRating": "5",
          "worstRating": "1"
        } : undefined,
        "affiliation": [
          {
            "@type": "Hospital",
            "name": doctor.hospital,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": doctor.thana || "",
              "addressRegion": doctor.district || "",
              "addressCountry": "BD"
            }
          }
        ],
        "openingHoursSpecification": availabilityArray.flatMap(slot =>
          (slot.days || []).map(day => {
            const timeParts = (slot.time || "09:00 - 17:00").split(' - ');
            return {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": day,
              "opens": timeParts[0] || "09:00",
              "closes": timeParts[1] || "17:00"
            };
          })
        )
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${doctorUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": language === 'bn' ? 'হোম' : 'Home',
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": language === 'bn' ? 'বিশেষজ্ঞ ডাক্তার' : 'Doctors',
            "item": `${baseUrl}/doctor`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": getLocalizedValue(doctor.name, doctor.nameBn, language),
            "item": doctorUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${doctorUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How to get appointment with ${doctor.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `You can book an appointment with ${doctor.name} online via Meditime or visit ${doctor.hospital}.`
            }
          },
          {
            "@type": "Question",
            "name": `Where does ${doctor.name} practice?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${doctor.name} practices at ${doctor.hospital}${doctor.thana ? `, ${doctor.thana}` : ''}${doctor.district ? `, ${doctor.district}` : ''}.`
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Breadcrumbs */}
      {/* <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-base md:text-lg font-semibold text-gray-700">
            <Link href="/" className="hover:text-primary transition-colors" >{language === 'bn' ? 'হোম' : 'Home'}</Link>
            <span className="text-gray-400">/</span>
            <Link href="/doctor" className="hover:text-primary transition-colors" >{language === 'bn' ? 'বিশেষজ্ঞ ডাক্তার' : 'Doctors'}</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900" >{getLocalizedValue(doctor.name, doctor.nameBn, language)}</span>
          </div>
        </div>
      </div> */}

      {/* Facebook-style Cover Photo - Fixed Static */}
      <div className="relative mt-20 w-full h-[350px] md:h-[450px] overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary">
        {/* Static Cover Image */}
        <div className="absolute inset-0">
          <Image
            src="/slide.jpg"
            alt="Cover"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      </div>

      {/* Profile Section - Facebook Style */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ... (Profile info same as updated previously) ... */}
          <div className="relative">
            {/* Profile Picture - Positioned over cover */}
            <div className="absolute -top-24 md:-top-32 left-0">
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-6 border-white shadow-2xl bg-white ring-4 ring-white">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    sizes="(max-width: 768px) 160px, 192px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white text-5xl md:text-6xl font-bold">
                    {doctor.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info - Below profile picture */}
            <div className="pt-28 md:pt-36 pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1
                      className="text-3xl md:text-4xl font-bold text-gray-900"

                    >
                      {getLocalizedValue(doctor.name, doctor.nameBn, language)}
                    </h1>
                    {/* Safe rating check to avoid 0 rendering */}
                    {!!doctor.rating && doctor.rating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border-2 border-yellow-200">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl md:text-2xl font-bold text-gray-900">{doctor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Specialty */}
                    <p className="text-primary font-bold text-lg md:text-2xl">
                      {getLocalizedValue(doctor.specialty, doctor.specialtyBn, language)}
                    </p>

                    {/* Degree/Qualification */}
                    <p
                      className="text-lg md:text-xl text-gray-700 font-semibold"

                    >
                      {getLocalizedValue(doctor.qualification, doctor.qualificationBn, language)}
                    </p>

                    {/* Designation */}
                    {getLocalizedValue(doctor.designation, doctor.designationBn, language) && (
                      <p className="text-base md:text-lg text-gray-600 font-medium">
                        {getLocalizedValue(doctor.designation, doctor.designationBn, language)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Building2 className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-base md:text-lg font-bold text-gray-800">
                        {getLocalizedValue(enrichedDoctor.hospital, enrichedDoctor.hospitalBn, language)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Desktop and Tablet */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diseases Treated Section - Show diseases based on department */}
            {departmentDiseases.length > 0 && (
              <Card className="p-8 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"

                >
                  {language === 'bn' ? 'যে সকল রোগের চিকিৎসা করা হয়' : 'Diseases Treated'}
                </h2>
                <div className="bg-white p-6 rounded-xl border-2 border-primary/10 shadow-md">
                  <div className="grid grid-cols-1 gap-6">
                    <ul className="space-y-3">
                      {departmentDiseases.slice(Math.ceil(departmentDiseases.length / 2)).map((disease, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-base md:text-lg font-semibold text-gray-800"

                        >
                          <span className="text-primary mt-1">•</span>
                          <span>{getLocalizedValue(disease.name, disease.bangla, language)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* About Section */}
            {doctor.bio && (
              <Card className="p-8 bg-gradient-to-br from-white to-green-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"

                >
                  {language === 'bn' ? `${getLocalizedValue(doctor.name, doctor.nameBn, language)} সম্পর্কে` : `About ${getLocalizedValue(doctor.name, doctor.nameBn, language)}`}
                </h2>
                <div className="bg-white p-6 rounded-xl border-2 border-primary/10 shadow-md">
                  <p
                    className="text-base md:text-lg text-gray-800 leading-relaxed whitespace-pre-line"

                  >
                    {getLocalizedValue(doctor.bio, doctor.bioBn, language)}
                  </p>
                </div>
              </Card>
            )}

            {/* Related Doctors - Desktop/Tablet */}
            <div className="hidden md:block">
              {relatedDoctors.length > 0 && (
                <Card className="p-8 bg-gradient-to-br from-white to-purple-50 border-2 border-primary/20 shadow-xl">
                  <h2
                    className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"

                  >
                    {language === 'bn' ? 'সংশ্লিষ্ট ডাক্তার' : 'Related Doctors'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {enrichedRelatedDoctors.map((relatedDoctor, index) => (
                      <DoctorCard key={relatedDoctor._id as string} doctor={relatedDoctor as any} index={index} />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Desktop */}
          <div className="hidden lg:block space-y-6">
            {/* Book Appointment */}
            <div >
              {/* <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"
                
              >
                অ্যাপয়েন্টমেন্ট বুক করুন
              </h2> */}
              <div className="space-y-5">
                <Link href={`/doctor/${doctorId}/book`}>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all"

                  >
                    {language === 'bn' ? 'বুক অ্যাপয়েন্টমেন্ট' : 'Book Appointment'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Fees Section */}
            <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
              <div className="bg-primary p-4 flex items-center justify-center gap-3">

                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {language === 'bn' ? 'ডাক্তারের পরামর্শ ফি' : 'Consultation Fee'}
                </h2>
              </div>

              <div className="p-6 bg-white">
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-0 max-w-2xl mx-auto">
                  {/* New Patient Fee */}
                  <div className="flex-1 text-center md:border-r border-primary/10 py-2">
                    <p className="text-sm text-gray-500 font-bold mb-1">
                      {language === 'bn' ? 'নতুন রোগী:' : 'New Patient:'}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {language === 'bn' ? (doctor.newPatientFeeBn !== undefined && doctor.newPatientFeeBn !== null ? doctor.newPatientFeeBn : '0') : (doctor.newPatientFee !== undefined && doctor.newPatientFee !== null ? doctor.newPatientFee : '0')} ৳
                    </p>
                  </div>

                  {/* Report Show Fee */}
                  <div className="flex-1 text-center py-2">
                    <p className="text-sm text-gray-500 font-bold mb-1">
                      {language === 'bn' ? 'রিপোর্ট দেখানো:' : 'Report Show:'}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {language === 'bn' ? (doctor.reportShowFeeBn !== undefined && doctor.reportShowFeeBn !== null ? doctor.reportShowFeeBn : '0') : (doctor.reportShowFee !== undefined && doctor.reportShowFee !== null ? doctor.reportShowFee : '0')} ৳
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hospital Schedule */}
            <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"

              >
                {language === 'bn' ? 'চেম্বার সময়সূচি' : 'Chamber Schedule'}
              </h2>
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border-2 border-primary/10 shadow-md">
                  {doctor.hospital && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <p
                          className="text-base md:text-lg font-bold text-gray-800"

                        >
                          {getLocalizedValue(enrichedDoctor.hospital, enrichedDoctor.hospitalBn, language)}
                        </p>
                      </div>
                      {doctor.district && (
                        <p className="text-sm text-gray-500 mt-1 ml-7" >
                          {language === 'bn' 
                            ? `${doctor.thanaBn || doctor.thana ? (doctor.thanaBn || doctor.thana) + ', ' : ''}${doctor.districtBn || doctor.district}` 
                            : `${doctor.thana ? doctor.thana + ', ' : ''}${doctor.district}`}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    {availabilityArray.map((slot, index) => {
                      const sortedDays = (slot.days || []).sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
                      const time = (language === 'bn' && slot.timeBn) ? slot.timeBn : (slot.time || "");
                      const isOnCall = time === "On Call" || time === "অন কল";

                      let dayRange = "";
                      if (!isOnCall && sortedDays.length > 0) {
                        if (language === 'bn') {
                          dayRange = sortedDays.length === 1
                            ? getBengaliDay(sortedDays[0])
                            : `${getBengaliDay(sortedDays[0])} থেকে ${getBengaliDay(sortedDays[sortedDays.length - 1])}`;
                        } else {
                          dayRange = sortedDays.length === 1
                            ? sortedDays[0]
                            : `${sortedDays[0]} to ${sortedDays[sortedDays.length - 1]}`;
                        }
                      }

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-gray-50 rounded-2xl"
                        >
                          <Clock className="h-4 w-4 text-primary shrink-0 mt-1" />
                          <span
                            className="text-sm md:text-base font-semibold text-gray-700"
                          >
                            {dayRange} {time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Doctor Rating */}
            {/* {doctor.rating && doctor.rating > 0 && (
              <Card className="p-6 bg-white border-2 border-primary/10 shadow-lg">
                <h2
                  className="text-xl font-bold text-gray-900 mb-4"
                  
                >
                  ডাক্তার রেটিং
                </h2>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 ${
                          star <= Math.round(doctor.rating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className="text-2xl font-bold text-gray-900 mb-1"
                    
                  >
                    {doctor.rating.toFixed(2)}
                  </p>
                  <p
                    className="text-sm text-gray-600"
                    
                  >
                    ৫ এর ভেতর {doctor.rating.toFixed(2)}
                  </p>
                  <Button
                    className="mt-4 w-full"
                    
                  >
                    রেট ডাক্তার
                  </Button>
                </div>
              </Card>
            )} */}
          </div>

          {/* Mobile Layout - Reordered */}
          <div className="lg:hidden space-y-6">
            {/* Fees Section - Mobile */}
            <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
              <div className="bg-primary p-4 flex items-center justify-center gap-3">
          
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {language === 'bn' ? 'ডাক্তারের পরামর্শ ফি' : 'Consultation Fee'}
                </h2>
              </div>

              <div className="p-6 bg-white">
                <div className="flex items-center justify-between gap-2">
                  {/* New Patient */}
                  <div className="flex-1 text-center border-r border-primary/10">
                    <p className="text-[10px] text-gray-500 font-bold mb-1 h-8 flex items-center justify-center">
                      {language === 'bn' ? 'নতুন রোগী' : 'New Patient'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {language === 'bn' ? (doctor.newPatientFeeBn !== undefined && doctor.newPatientFeeBn !== null ? doctor.newPatientFeeBn : '0') : (doctor.newPatientFee !== undefined && doctor.newPatientFee !== null ? doctor.newPatientFee : '0')} ৳
                    </p>
                  </div>

                  {/* Report Show */}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-gray-500 font-bold mb-1 h-8 flex items-center justify-center">
                      {language === 'bn' ? 'রিপোর্ট দেখানো' : 'Report Show'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {language === 'bn' ? (doctor.reportShowFeeBn !== undefined && doctor.reportShowFeeBn !== null ? doctor.reportShowFeeBn : '0') : (doctor.reportShowFee !== undefined && doctor.reportShowFee !== null ? doctor.reportShowFee : '0')} ৳                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hospital Schedule - Mobile */}
            <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"

              >
                {language === 'bn' ? 'চেম্বার সময়সূচি' : 'Chamber Schedule'}
              </h2>
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border-2 border-primary/10 shadow-md">
                  {doctor.hospital && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <p
                          className="text-base md:text-lg font-bold text-gray-800"

                        >
                          {getLocalizedValue(enrichedDoctor.hospital, enrichedDoctor.hospitalBn, language)}
                        </p>
                      </div>

                       <p className="text-sm text-gray-500 mt-1 ml-7" >
                          {language === 'bn' 
                            ? `${doctor.thanaBn || doctor.thana ? (doctor.thanaBn || doctor.thana) + ', ' : ''}${doctor.districtBn || doctor.district}` 
                            : `${doctor.thana ? doctor.thana + ', ' : ''}${doctor.district}`}
                        </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {Array.from(new Set(availabilityArray.map(slot =>
                      (language === 'bn' && slot.timeBn) ? slot.timeBn : (slot.time || "")
                    ).filter(Boolean))).map((time, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-full flex-nowrap"
                      >
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span
                          className="text-sm md:text-base font-semibold text-gray-700 whitespace-nowrap"

                        >
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Book Appointment - Mobile */}
            <Card className="p-6 bg-gradient-to-br from-white to-emerald-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-xl md:text-2xl font-bold text-gray-900 mb-5"

              >
                {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book Appointment'}
              </h2>
              <div className="space-y-5">
                <Link href={`/doctor/${doctorId}/book`}>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"

                  >
                    {language === 'bn' ? 'বুক অ্যাপয়েন্টমেন্ট' : 'Book Appointment'}
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Related Doctors - Mobile (shown after Book Appointment) */}
            {relatedDoctors.length > 0 && (
              <Card className="p-8 bg-gradient-to-br from-white to-purple-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 mb-6"

                >
                  {language === 'bn' ? 'সংশ্লিষ্ট ডাক্তার' : 'Related Doctors'}
                </h2>
                <div className="grid grid-cols-1 gap-5">
                  {enrichedRelatedDoctors.map((relatedDoctor, index) => (
                    <DoctorCard key={relatedDoctor._id as string} doctor={relatedDoctor as any} index={index} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

