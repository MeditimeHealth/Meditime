import mongoose, { Schema, Document } from 'mongoose';

export interface IDiagnosticTest extends Document {
  name: string;
  description?: string;
  price: number;
  image?: string; // URL to image
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
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
      trim: true,
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
