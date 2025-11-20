import mongoose from "mongoose";

export interface IFile extends mongoose.Document {
  filename: string;
  key: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

const fileSchema = new mongoose.Schema<IFile>({
  filename: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model<IFile>("File", fileSchema);

export default File;
