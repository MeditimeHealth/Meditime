import mongoose, { Schema, Document } from 'mongoose';

export interface IDistrict extends Document {
  name: string;
  division: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DistrictSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    nameBn: {
      type: String,
      trim: true,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: 'Division',
      required: [true, 'Division is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique district names within a division
DistrictSchema.index({ name: 1, division: 1 }, { unique: true });

const District = mongoose.models.District || mongoose.model<IDistrict>('District', DistrictSchema);

export default District;

