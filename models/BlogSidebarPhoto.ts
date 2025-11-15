import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogSidebarPhoto extends Document {
  imageUrl: string;
  linkUrl: string;
  title?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSidebarPhotoSchema: Schema = new Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    linkUrl: {
      type: String,
      required: [true, 'Link URL is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
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

// Index for ordering
BlogSidebarPhotoSchema.index({ order: 1, createdAt: 1 });

const BlogSidebarPhoto = mongoose.models.BlogSidebarPhoto || mongoose.model<IBlogSidebarPhoto>('BlogSidebarPhoto', BlogSidebarPhotoSchema);

export default BlogSidebarPhoto;

