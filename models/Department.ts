import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  bangla: string;
  emoji: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
    },
    bangla: {
      type: String,
      required: [true, 'Bengali name is required'],
      trim: true,
    },
    emoji: {
      type: String,
      required: [true, 'Emoji is required'],
      trim: true,
    },
    icon: {
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

