export interface BookedTest {
  _id: string;
  name: string;
  nameBn?: string;
  price?: number;
  serialNumber?: number;
  recommendations?: string[];
}

export interface Division {
  _id: string;
  name: string;
}

export interface District {
  _id: string;
  name: string;
  division: Division;
}

export interface Thana {
  _id: string;
  name: string;
  district: District;
}

export interface Hospital {
  _id: string;
  name: string;
  nameBn?: string;
  address?: string;
  thana?: Thana;
}

// Additional type for the Checkout process
export interface CheckoutData {
  patientName: string;
  mobileNumber: string;
  gender: string;
  age: string;
  patientType: "old" | "new" | "report";
  affiliateCode?: string;
  appointmentDate: string;
}

// Booking object from DB/Local Storage
export interface DiagnosticBookingRecord {
  _id?: string;
  patientName: string;
  mobileNumber: string;
  appointmentDate: string;
  status?: string;
  totalPrice?: number;
  bookingRef?: string;
  venueId?: Hospital | any;
  tests?: BookedTest[];
}
