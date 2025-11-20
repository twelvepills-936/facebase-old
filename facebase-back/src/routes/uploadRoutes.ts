import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file to S3
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 10MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of uploaded file
 *                   example: "https://s3.amazonaws.com/bucket/upload/filename.jpg"
 *                 name:
 *                   type: string
 *                   description: Original filename
 *                   example: "filename.jpg"
 *                 key:
 *                   type: string
 *                   description: S3 key
 *                   example: "upload/filename.jpg"
 *       400:
 *         description: Validation error or file too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: S3 upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// @ts-ignore
router.post("/", upload.single("file"), uploadFile);

export default router;
