import mongoose, { Schema, Document } from 'mongoose';

export interface IAppImageSetting extends Document {
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppImageSettingSchema: Schema = new Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
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

const AppImageSetting = mongoose.models.AppImageSetting || mongoose.model<IAppImageSetting>('AppImageSetting', AppImageSettingSchema);

export default AppImageSetting;
