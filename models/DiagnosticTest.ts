import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagnosticTest extends Document {
  name: string;
  category: string; // Blood Tests, Cardiology, Imaging, Pathology
  description?: string;
  price: number;
  originalPrice?: number; // For showing discounts
  duration?: string; // How long test takes
  preparation?: string; // Preparation instructions
  fastingRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiagnosticTestSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Blood Tests', 'Cardiology', 'Imaging', 'Pathology'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Price must be positive'],
    },
    duration: {
      type: String,
      trim: true,
    },
    preparation: {
      type: String,
      trim: true,
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const DiagnosticTest = mongoose.models.DiagnosticTest || mongoose.model<IDiagnosticTest>('DiagnosticTest', DiagnosticTestSchema);

export default DiagnosticTest;

