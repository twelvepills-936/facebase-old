import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";

export const uploadFileToS3 = async (
  file: Express.Multer.File
): Promise<string> => {
  const key = `upload/${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || "",
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return `https://storage.yandexcloud.net/${process.env.S3_BUCKET_NAME}/${key}`;
};
