import mongoose, { Schema, Document, mongo } from "mongoose";

export interface IReferral {
  profile: string;
  referral_stats: {
    completed_tasks_count: number;
    earnings: number;
  };
}
export interface IProfile extends Document {
  name: string;
  telegram_id: string;
  avatar: string;
  location: string;
  role: string;
  description: string;
  channels: mongoose.Types.ObjectId[];
  telegramInitData: string;
  username: string;
  referrals: IReferral[];
  verified: boolean;
  saved_projects: mongoose.Types.ObjectId[];
  saved_brands: mongoose.Types.ObjectId[];
}

const ProfileSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    telegram_id: { type: String, required: true, unique: true },
    avatar: { type: String },
    location: { type: String },
    role: { type: String },
    description: { type: String },
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
    telegramInitData: { type: String },
    username: { type: String, unique: true },
    verified: { type: Boolean, default: false },
    referrals: [
      {
        profile: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile",
          required: true,
        },
        referral_stats: {
          completed_tasks_count: { type: Number, default: 0 },
          earnings: { type: Number, default: 0 },
        },
      },
    ],
    saved_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    saved_brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true }
);

const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);

export default Profile;
