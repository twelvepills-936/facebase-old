import mongoose from "mongoose";

export interface IRule {
  text: string;
}

export interface IStep {
  step_number: number;
  title: string;
  description: string;
  type: "form" | "file_upload" | "link" | "report";
  required: boolean;
  fields?: {
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
  }[];
}

export interface ITask extends mongoose.Document {
  brand: mongoose.Types.ObjectId;
  brand_avatar?: string;
  title: string;
  description: string;
  briefing: string;
  subscribers: number;
  reward: number;
  reward_total: number;
  deadline: Date;
  rules: IRule[];
  steps: IStep[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ruleSchema = new mongoose.Schema<IRule>({
  text: { type: String, required: true },
});

const stepSchema = new mongoose.Schema<IStep>({
  step_number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["form", "file_upload", "link", "report"],
  },
  required: { type: Boolean, default: true },
  fields: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
      label: { type: String, required: true },
      required: { type: Boolean, default: false },
      options: [{ type: String }],
    },
  ],
});

const taskSchema = new mongoose.Schema<ITask>(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    brand_avatar: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    briefing: { type: String },
    subscribers: { type: Number },
    reward: { type: Number, required: true },
    reward_total: { type: Number, required: true },
    deadline: { type: Date, required: true },
    rules: [ruleSchema],
    steps: [stepSchema],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;

