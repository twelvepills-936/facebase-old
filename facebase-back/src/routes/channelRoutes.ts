import express from "express";
import {
  createChannel,
  getChannels,
  updateChannel,
  deleteChannel,
} from "../controllers/channelController.js";

const router = express.Router();

/**
 * @swagger
 * /api/channels:
 *   post:
 *     summary: Create a new channel
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - url
 *               - platform
 *               - interests
 *               - ownerId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Tech Channel"
 *               type:
 *                 type: string
 *                 example: "tech"
 *               url:
 *                 type: string
 *                 example: "https://t.me/mytechch"
 *               platform:
 *                 type: string
 *                 enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"]
 *                 example: "Telegram"
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["technology", "gadgets"]
 *               location:
 *                 type: string
 *                 example: "International"
 *               language:
 *                 type: string
 *                 example: "English"
 *               ownerId:
 *                 type: string
 *                 example: "123456789"
 *     responses:
 *       201:
 *         description: Channel created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       400:
 *         description: Validation error
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
 */
router.post("/", createChannel);

/**
 * @swagger
 * /api/channels:
 *   get:
 *     summary: Get all channels for the authenticated user
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of channels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Channel'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getChannels);

/**
 * @swagger
 * /api/channels/{id}:
 *   put:
 *     summary: Update channel by ID
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               url:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"]
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Channel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Channel'
 *       400:
 *         description: Validation error
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
 *       404:
 *         description: Channel not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", updateChannel);

/**
 * @swagger
 * /api/channels/{id}:
 *   delete:
 *     summary: Delete channel by ID
 *     tags: [Channels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Channel MongoDB _id
 *     responses:
 *       200:
 *         description: Channel deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Channel deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Channel not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deleteChannel);

export default router;
