import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  phoneNumber: string;
  username?: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  age: number;
  password: string;
  role?: 'admin' | 'user' | 'doctor' | 'bloodDonor' | 'ambulance';
  userType?: 'user' | 'bloodDonor' | 'ambulance';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [1, 'Age must be greater than 0'],
      max: [150, 'Age must be less than 150'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'doctor', 'bloodDonor', 'ambulance'],
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['user', 'bloodDonor', 'ambulance'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Delete existing model to force recompilation with updated schema
if (mongoose.models.User) {
  mongoose.deleteModel('User');
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
