import mongoose from "mongoose";
import { IProposal } from "./proposalModel.js";

export interface IRule {
  text: string;
}

export interface IProject extends mongoose.Document {
  title: string;
  description: string;
  location: string;
  theme: string;
  image: string;
  briefing: string;
  platform: string;
  subscribers: number;
  reward: number;
  deadline: Date;
  rules: IRule[];
  proposals: IProposal[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  promoted: boolean;
}

const ruleSchema = new mongoose.Schema<IRule>({
  text: { type: String, required: true },
});

const projectSchema = new mongoose.Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: String,
      required: true,
      enum: [
        "international",
        "moscow",
        "sankt_peterburg",
        "ekaterinburg",
        "novosibirsk",
        "kazan",
        "krasnoyarsk",
        "nizhny_novgorod",
        "chelyabinsk",
        "ufa",
        "samara",
        "rostov_na_donu",
        "krasnodar",
        "omsk",
        "voronezh",
        "perm",
        "volgograd",
      ],
    },
    theme: {
      type: String,
      required: true,
      enum: [
        "automobiles",
        "gadgets",
        "food_drinks",
        "health_medical",
        "games",
        "cafes_restaurants",
        "real_estate",
        "education",
        "clothing_accessories",
        "travel",
        "home_goods",
        "finance",
      ],
    },
    image: { type: String },
    briefing: { type: String },
    platform: {
      type: String,
      required: true,
      enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"],
    },
    subscribers: { type: Number },
    reward: { type: Number, required: true },
    deadline: { type: Date, required: true },
    rules: [ruleSchema],
    promoted: { type: Boolean, default: false },
    proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Proposal" }],
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
