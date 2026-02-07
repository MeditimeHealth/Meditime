import mongoose, { Schema, Document } from 'mongoose';

export interface IThana extends Document {
  name: string;
  district: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ThanaSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    nameBn: {
      type: String,
      trim: true,
    },
    district: {
      type: Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique thana names within a district
ThanaSchema.index({ name: 1, district: 1 }, { unique: true });

const Thana = mongoose.models.Thana || mongoose.model<IThana>('Thana', ThanaSchema);

export default Thana;

