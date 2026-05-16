import mongoose, { Schema, Document } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  imageUrl: string;
  linkUrl: string;
  buttonText?: string;
  buttonTextBn?: string;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isPopup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    titleBn: { type: String, required: true },
    description: { type: String, required: true },
    descriptionBn: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: '#' },
    buttonText: { type: String, default: 'Learn More' },
    buttonTextBn: { type: String, default: 'আরও জানুন' },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isPopup: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Offer = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
export default Offer;
