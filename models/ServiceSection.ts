import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceSection extends Document {
  title: string;
  description: string;
  slug: string; // URL-friendly identifier (e.g., 'ambulance', 'blood-donor')
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSectionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
    },
    order: {
      type: Number,
      default: 0,
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

// Index for ordering and slug lookup
ServiceSectionSchema.index({ order: 1, createdAt: 1 });
ServiceSectionSchema.index({ slug: 1 });

const ServiceSection = mongoose.models.ServiceSection || mongoose.model<IServiceSection>('ServiceSection', ServiceSectionSchema);

export default ServiceSection;

