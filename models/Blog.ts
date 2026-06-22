import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    titleBn: { type: String, required: true },
    description: { type: String, required: true },
    descriptionBn: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
