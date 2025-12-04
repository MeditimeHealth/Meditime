import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    cardPackage: {
      type: String,
      required: true,
      enum: ["silver", "gold", "platinum", "corporate"],
    },
    membersCovered: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    companyIdNumber: {
      type: String,
      trim: true,
    },
    membershipPrice: {
      type: Number,
      default: 0,
    },
    cardFee: {
      type: Number,
      default: 500,
    },
    deliveryCharge: {
      type: Number,
      default: 150,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Membership =
  mongoose.models.Membership || mongoose.model("Membership", membershipSchema);

export default Membership;
