import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const { S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  process.env;

// Проверка на наличие необходимых переменных окружения
if (!S3_REGION || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
  throw new Error("Отсутствуют обязательные переменные окружения для S3");
}

// Инициализация S3 клиента с дополнительными настройками для решения ошибки 405
const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Необходимо для некоторых S3-совместимых сервисов
  // Отключаем автоматическое определение действий SSL
  useAccelerateEndpoint: false,
  // Устанавливаем макс. число повторов при ошибке
  maxAttempts: 3,
});

export default s3Client;
