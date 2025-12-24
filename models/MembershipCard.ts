import mongoose from "mongoose";

const membershipCardSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    cardType: {
      type: String,
      required: true,
      enum: ["silver", "gold", "platinum", "corporate"],
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique serial number before saving
membershipCardSchema.pre("save", async function (next) {
  if (this.isNew && !this.serialNumber) {
    // Generate a unique serial number: MT + Year + Random 6 digits
    const year = new Date().getFullYear().toString().slice(-2);
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    this.serialNumber = `MT${year}${randomDigits}`;
    
    // Ensure uniqueness
    const MembershipCard = mongoose.model("MembershipCard");
    let exists = await MembershipCard.findOne({ serialNumber: this.serialNumber });
    while (exists) {
      const newRandomDigits = Math.floor(100000 + Math.random() * 900000);
      this.serialNumber = `MT${year}${newRandomDigits}`;
      exists = await MembershipCard.findOne({ serialNumber: this.serialNumber });
    }
  }
  next();
});

const MembershipCard =
  mongoose.models.MembershipCard || mongoose.model("MembershipCard", membershipCardSchema);

export default MembershipCard;
