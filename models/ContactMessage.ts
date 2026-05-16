import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'resolved'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage;
