import mongoose from "mongoose";

export enum BrandPlatform {
  TELEGRAM = "Telegram",
  INSTAGRAM = "Instagram",
  YOUTUBE = "YouTube",
  X = "X",
  VK = "VK",
  TIKTOK = "TikTok",
}

export interface IBrand extends mongoose.Document {
  title: string;
  description: string;
  long_description?: string;
  location: string;
  theme: string;
  image: string;
  platform: BrandPlatform;
  status: string;
  promoted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new mongoose.Schema<IBrand>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    long_description: { type: String },
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
    platform: {
      type: String,
      required: true,
      enum: Object.values(BrandPlatform),
    },
    promoted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model<IBrand>("Brand", brandSchema);

export default Brand;

