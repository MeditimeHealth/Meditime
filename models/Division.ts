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
      required: [true, 'Division name is required'],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Division = mongoose.models.Division || mongoose.model<IDivision>('Division', DivisionSchema);

export default Division;

