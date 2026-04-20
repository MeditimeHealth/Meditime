import mongoose, { Schema, Document } from 'mongoose';

export interface IAbandonedCart extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  email?: string;
  tests: {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    nameBn?: string;
  }[];
  venueId?: mongoose.Types.ObjectId;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const abandonedCartSchema = new Schema<IAbandonedCart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One abandoned cart per user
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    tests: [{
      _id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      nameBn: {
        type: String,
      }
    }],
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index: Delete documents 10 days after the last update
// 10 days = 10 * 24 * 60 * 60 = 864,000 seconds
abandonedCartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 864000 });

const AbandonedCart = mongoose.models.AbandonedCart || mongoose.model<IAbandonedCart>('AbandonedCart', abandonedCartSchema);

export default AbandonedCart;
