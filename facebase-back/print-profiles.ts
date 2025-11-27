import mongoose from "mongoose";
import dotenv from "dotenv";
import Profile from "./src/models/profileModel.js";

dotenv.config();

const printProfiles = async () => {
  try {
    // В dev mode заменяем хост 'mongodb' на 'localhost' для локальной разработки
    let mongoUri = process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/facebase?authSource=admin";
    
    if (mongoUri?.includes('@mongodb:')) {
      mongoUri = mongoUri.replace('@mongodb:', '@localhost:');
      console.log('🔧 Using localhost for MongoDB connection');
    }

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    const profiles = await Profile.find().select("name username telegram_id").lean();
    
    if (profiles.length === 0) {
      console.log("⚠️  No profiles found in database");
    } else {
      console.log(`📋 Found ${profiles.length} profile(s):\n`);
      profiles.forEach((p, index) => {
        console.log(`${index + 1}. name: ${p.name || 'N/A'}`);
        console.log(`   username: ${p.username || 'N/A'}`);
        console.log(`   telegram_id: ${p.telegram_id}`);
        console.log("");
      });
      
      console.log("💡 Use one of these telegram_id values as userId in your API tests");
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

printProfiles();

