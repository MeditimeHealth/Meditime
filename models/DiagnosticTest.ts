import mongoose, { Schema, Document } from 'mongoose';

export type TestDepartment = 'Blood' | 'Cardiology' | 'Imaging' | 'Pathology';
export type TestRecommendation = 
  | 'Fasting Required' 
  | 'Drink plenty of water' 
  | 'No smoking' 
  | 'Morning sample only' 
  | 'Consult doctor before test';

export interface IDiagnosticTest extends Document {
  serialNumber: number;
  name: string;
  nameBn?: string;
  description?: string;
  descriptionBn?: string;
  price: number;
  recommendations: TestRecommendation[];
  departments: TestDepartment[];
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticTestSchema: Schema = new Schema(
  {
    serialNumber: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      trim: true,
    },
    nameBn: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    descriptionBn: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    recommendations: {
      type: [String],
      enum: [
        'Fasting Required',
        'Drink plenty of water',
        'No smoking',
        'Morning sample only',
        'Consult doctor before test'
      ],
      default: [],
    },
    departments: {
      type: [String],
      enum: ['Blood', 'Cardiology', 'Imaging', 'Pathology'],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Delete the cached model to ensure schema changes are applied
if (mongoose.models.DiagnosticTest) {
  delete mongoose.models.DiagnosticTest;
}

const DiagnosticTest = mongoose.model<IDiagnosticTest>('DiagnosticTest', DiagnosticTestSchema);

export default DiagnosticTest;
