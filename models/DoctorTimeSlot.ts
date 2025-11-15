import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorTimeSlot extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
  isBooked: boolean;
  consultationId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorTimeSlotSchema: Schema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    slotDuration: {
      type: Number,
      required: [true, 'Slot duration is required'],
      min: [15, 'Slot duration must be at least 15 minutes'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    consultationId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
DoctorTimeSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 });
DoctorTimeSlotSchema.index({ doctorId: 1, date: 1, isAvailable: 1, isBooked: 1 });

const DoctorTimeSlot = mongoose.models.DoctorTimeSlot || mongoose.model<IDoctorTimeSlot>('DoctorTimeSlot', DoctorTimeSlotSchema);

export default DoctorTimeSlot;

