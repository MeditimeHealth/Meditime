import mongoose, { Schema, Document } from 'mongoose';

export interface IDisease extends Document {
  name: string;
  bangla: string;
  department?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Disease name is required'],
      trim: true,
      unique: true,
    },
    bangla: {
      type: String,
      required: [true, 'Bengali name is required'],
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Delete the model if it exists to avoid schema conflicts
if (mongoose.models.Disease) {
  delete mongoose.models.Disease;
}

const Disease = mongoose.model<IDisease>('Disease', DiseaseSchema);

export default Disease;

