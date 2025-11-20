import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
// Стримы
import monitorWalletChanges from "../streams/walletStream.js";
import monitorProposalChanges from "../streams/proposalStream.js";

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    // В dev mode заменяем хост 'mongodb' на 'localhost' для локальной разработки
    let mongoUri = process.env.MONGO_URI as string;
    const isDevMode = process.env.NODE_ENV !== 'production';
    
    if (isDevMode && mongoUri?.includes('@mongodb:')) {
      mongoUri = mongoUri.replace('@mongodb:', '@localhost:');
      console.log('🔧 Dev mode: Using localhost for MongoDB connection');
    }
    
    const conn = await mongoose
      .connect(
        mongoUri,
        {
          serverSelectionTimeoutMS: 5000, // Timeout после 5 секунд
          socketTimeoutMS: 45000,
        }
      )
      .then((res) => {
        monitorWalletChanges();
        monitorProposalChanges();

        return res;
      });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    const { message } = err as { message: string };

    console.log("DB URI: ", process.env.MONGO_URI);
    console.error(`DB Error: ${message}`);
    console.error(`⚠️  Server starting without database connection`);
    console.error(`⚠️  Please check MONGO_URI and database availability`);
    
    // НЕ завершаем процесс, позволяем серверу запуститься
    // process.exit(1);
  }
};
