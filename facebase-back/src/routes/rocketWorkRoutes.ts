import express from "express";
import {
  handleRocketWorkWebhook,
  getPayoutStatus,
} from "../controllers/rocketWorkController.js";

const router = express.Router();

/**
 * @swagger
 * /api/rocketwork/webhook:
 *   post:
 *     summary: Webhook endpoint for Rocket Work notifications
 *     tags: [RocketWork]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "payout.completed"
 *               data:
 *                 type: object
 *                 properties:
 *                   payout_id:
 *                     type: string
 *                   status:
 *                     type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Server error
 */
router.post("/webhook", handleRocketWorkWebhook);

/**
 * @swagger
 * /api/rocketwork/payout/{payoutId}:
 *   get:
 *     summary: Get payout status from Rocket Work
 *     tags: [RocketWork]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payoutId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rocket Work payout ID
 *     responses:
 *       200:
 *         description: Payout status
 *       500:
 *         description: Server error
 */
router.get("/payout/:payoutId", getPayoutStatus);

export default router;

