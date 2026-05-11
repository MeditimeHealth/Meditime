import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const departmentName = decodeURIComponent(params.name);
  
  // District is currently set to Dhaka for general context as per standard user preference
  const district = "Dhaka"; 
  const districtBn = "ঢাকা";

  const title = `Best ${departmentName} in ${district} | Top Rated Doctors | Meditime`;
  const description = `${districtBn}-এর সেরা ${departmentName} বিশেষজ্ঞ ডাক্তারদের প্রোফাইল দেখুন। ভিজিট ফি ও চেম্বারের সময় জেনে সহজেই অনলাইনে অ্যাপয়েন্টমেন্ট বুক করুন Meditime-এ।`;

  return {
    title,
    description: description.substring(0, 155),
    alternates: {
      canonical: `https://meditime.com.bd/departments/${params.name}`,
    },
    openGraph: {
      title,
      description,
      images: ["/logo.png"],
    }
  };
}

export default function DepartmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
