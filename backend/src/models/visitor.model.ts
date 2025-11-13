import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
  name: string;
  reason: string;
  department?: string;  // ✅ added
  description?: string;
  hostEmail?: string;
  photo: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const visitorSchema = new Schema<IVisitor>(
  {
    name: { type: String, required: true },
    reason: { type: String, required: true },
    department: { type: String, required: false }, // ✅ added
    description: { type: String, required: false },
    hostEmail: { type: String, required: false },
    photo: { type: String, required: true },
    qrCode: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IVisitor>("Visitor", visitorSchema);
