import mongoose, { Schema, Document } from "mongoose";

export interface IProposal extends Document {
  status: {
    value:
      | "waiting_approval"
      | "waiting_channel_approval"
      | "waiting_attachments_approval"
      | "approved"
      | "rejected"
      | "channel_approved"
      | "channel_rejected"
      | "attachments_rejected"
      | "attachments_approved";
    details: string[];
  };
  channelId: { type: Schema.Types.ObjectId; ref: "Channel"; required: true };
  submitAt: Date;
  initiatorId: mongoose.Schema.Types.ObjectId;
  projectId: mongoose.Schema.Types.ObjectId;
  erid?: string;
  attachments?: {
    text: string;
    files: Array<{
      name: string;
      url: string;
    }>;
  };
  deadline?: Date;
}

const ProposalSchema: Schema = new Schema({
  status: {
    value: {
      type: String,
      default: "waiting_channel_approval",
      enum: [
        "waiting_approval",
        "waiting_channel_approval",
        "waiting_attachments_approval",
        "approved",
        "rejected",
        "channel_approved",
        "channel_rejected",
        "attachments_rejected",
        "attachments_approved",
      ],
    },
    details: { type: [String], default: [] },
  },
  channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
  submitAt: { type: Date, default: Date.now },
  initiatorId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  erid: { type: String },
  attachments: {
    text: { type: String },
    files: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  deadline: { type: Date },
});

export default mongoose.model<IProposal>("Proposal", ProposalSchema);
