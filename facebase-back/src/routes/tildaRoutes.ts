import express from "express";
import {
  handleTildaWebhook,
  tildaWebhookHealth,
} from "../controllers/tildaController.js";

const router = express.Router();

/**
 * @swagger
 * /api/tilda/webhook:
 *   post:
 *     summary: Webhook endpoint for Tilda form submissions
 *     tags: [Tilda]
 *     description: |
 *       Принимает данные форм от Тильды и автоматически верифицирует их.
 *       Настройте этот URL в настройках формы в Тильде.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               formid:
 *                 type: string
 *               formname:
 *                 type: string
 *               pageurl:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formid:
 *                 type: string
 *               formname:
 *                 type: string
 *               pageurl:
 *                 type: string
 *               fields:
 *                 type: object
 *     responses:
 *       200:
 *         description: Form data received and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 formId:
 *                   type: string
 *       401:
 *         description: Invalid webhook signature
 *       400:
 *         description: Invalid form data
 */
router.post("/webhook", handleTildaWebhook);

/**
 * @swagger
 * /api/tilda/health:
 *   get:
 *     summary: Health check for Tilda webhook service
 *     tags: [Tilda]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/health", tildaWebhookHealth);

export default router;

