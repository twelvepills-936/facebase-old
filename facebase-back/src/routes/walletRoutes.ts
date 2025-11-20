import express from "express";
import {
  getUserWallet,
  addWithdrawMethodController,
  createWithdrawalController,
  receiveWalletController,
} from "../controllers/walletController.js";

const router = express.Router();

/**
 * @swagger
 * /api/wallet/{userId}:
 *   get:
 *     summary: Get wallet by user ID
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Wallet details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId", getUserWallet);

/**
 * @swagger
 * /api/wallet/{userId}/withdraw-method:
 *   post:
 *     summary: Add withdrawal method to wallet
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - details
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["crypto_wallet", "bank_account"]
 *                 example: "crypto_wallet"
 *               details:
 *                 type: string
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Withdrawal method added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
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
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:userId/withdraw-method", addWithdrawMethodController);

/**
 * @swagger
 * /api/wallet/{userId}/withdraw:
 *   post:
 *     summary: Create withdrawal request
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *                 description: Amount to withdraw
 *               description:
 *                 type: string
 *                 example: "Withdrawal to crypto wallet"
 *               details:
 *                 type: string
 *                 example: "Additional withdrawal details"
 *     responses:
 *       200:
 *         description: Withdrawal request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Validation error or insufficient balance
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
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:userId/withdraw", createWithdrawalController);

/**
 * @swagger
 * /api/wallet/{userId}/receive:
 *   post:
 *     summary: Receive payment to wallet
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *                 description: Amount to receive
 *               description:
 *                 type: string
 *                 example: "Payment for project completion"
 *               details:
 *                 type: string
 *                 example: "Additional payment details"
 *     responses:
 *       200:
 *         description: Payment received successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
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
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:userId/receive", receiveWalletController);

export default router;
