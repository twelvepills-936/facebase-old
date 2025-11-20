import mongoose, { Schema, Document } from "mongoose";

export interface IChannel extends Document {
  name: string;
  type: string;
  interests: string[];
  location?: string;
  language?: string;
  ownerId: mongoose.Types.ObjectId;
}

const ChannelSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  platform: { type: String, required: true },
  interests: [{ type: String, required: true }],
  location: { type: String },
  language: { type: String },
  // ownerId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Profile",
  //   required: true,
  // },
  ownerId: { type: String, required: true },
});

const Channel = mongoose.model<IChannel>("Channel", ChannelSchema);

export default Channel;
