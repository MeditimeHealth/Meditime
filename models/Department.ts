import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    nameBn: {
      type: String,
      trim: true,
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

// Delete the model if it exists to avoid schema conflicts
if (mongoose.models.Department) {
  delete mongoose.models.Department;
}

const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;

