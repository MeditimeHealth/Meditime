import mongoose, { Schema, Document } from 'mongoose';

export interface IDivision extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const DivisionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: false,
    },
    nameBn: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Division = mongoose.models.Division || mongoose.model<IDivision>('Division', DivisionSchema);

export default Division;

