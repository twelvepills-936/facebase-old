import mongoose from "mongoose";

export interface IStepData {
  step_number: number;
  status: "pending" | "in_review" | "approved" | "rejected";
  data: any;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: string; // Admin username/id who reviewed
  rejection_reason?: string;
}

export interface ITaskSubmission extends mongoose.Document {
  task: mongoose.Types.ObjectId;
  profile: mongoose.Types.ObjectId;
  status: "in_progress" | "pending_review" | "completed" | "rejected";
  steps_data: IStepData[];
  activeStep?: number;
  started_at: Date;
  completed_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stepDataSchema = new mongoose.Schema<IStepData>({
  step_number: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in_review", "approved", "rejected"],
    default: "pending",
  },
  data: { type: mongoose.Schema.Types.Mixed },
  submitted_at: { type: Date },
  reviewed_at: { type: Date },
  reviewed_by: { type: String },
  rejection_reason: { type: String },
});

const taskSubmissionSchema = new mongoose.Schema<ITaskSubmission>(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "pending_review", "completed", "rejected"],
      default: "in_progress",
    },
    steps_data: [stepDataSchema],
    activeStep: { type: Number, default: 1 },
    started_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
  },
  { timestamps: true }
);

// Индекс для быстрого поиска заявок юзера
taskSubmissionSchema.index({ profile: 1, task: 1 });
taskSubmissionSchema.index({ status: 1 });

const TaskSubmission = mongoose.model<ITaskSubmission>(
  "TaskSubmission",
  taskSubmissionSchema
);

export default TaskSubmission;

