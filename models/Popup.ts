import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPopup extends Document {
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  imageUrl: string;
  buttonText: string;
  buttonTextBn?: string;
  buttonLink: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const popupSchema: Schema<IPopup> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    titleBn: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    descriptionBn: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    buttonText: {
      type: String,
      default: 'Learn More',
    },
    buttonTextBn: {
      type: String,
      trim: true,
    },
    buttonLink: {
      type: String,
      default: '#',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Popup: Model<IPopup> = mongoose.models.Popup || mongoose.model<IPopup>('Popup', popupSchema);

export default Popup;
