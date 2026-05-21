export interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    nameBn?: string;
    specialty?: string;
    specialtyBn?: string;
    qualification?: string;
    qualificationBn?: string;
    department?: string;
    departmentBn?: string;
    hospital?: string;
    hospitalBn?: string;
    image?: string;
    slug?: string;
    slugBn?: string;
  };
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'old' | 'new' | 'report';
  hospitalName: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}
