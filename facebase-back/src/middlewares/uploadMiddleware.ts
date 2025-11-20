import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import s3Client from "../config/s3.js";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const { S3_BUCKET_NAME } = process.env;

if (!S3_BUCKET_NAME) {
  throw new Error("Переменная окружения S3_BUCKET_NAME не определена");
}

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `upload/${file.originalname}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // Лимит размера файла (10MB)
  },
});

export default upload;
