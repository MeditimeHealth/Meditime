import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoneVerification extends Document {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

const PhoneVerificationSchema: Schema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create a TTL index that automatically deletes documents after expiresAt
PhoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PhoneVerificationSchema.index({ phoneNumber: 1 });

export default mongoose.models.PhoneVerification ||
  mongoose.model<IPhoneVerification>('PhoneVerification', PhoneVerificationSchema);
