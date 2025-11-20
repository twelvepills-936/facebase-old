import express from "express";
import {
  checkUserRegistration,
  getUser,
} from "../controllers/generalController.js";

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running!"
 */

/**
 * @swagger
 * /api/general:
 *   get:
 *     summary: Check user registration status
 *     tags: [General]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User registration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registered:
 *                   type: boolean
 *                   description: Whether user is registered
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", checkUserRegistration);

/**
 * @swagger
 * /api/general/checkUserRegistration:
 *   get:
 *     summary: Check user registration status (alternative endpoint)
 *     tags: [General]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User registration status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registered:
 *                   type: boolean
 *                   description: Whether user is registered
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/checkUserRegistration", checkUserRegistration);

/**
 * @swagger
 * /api/general/user:
 *   get:
 *     summary: Get authenticated user information
 *     tags: [General]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   description: Authenticated user data from token
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/user", getUser);

export default router;
