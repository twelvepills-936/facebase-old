import { Router } from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getProfiles,
} from "../controllers/profileController.js";

const router = Router();

/**
 * @swagger
 * /api/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
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
 *               - telegram_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               telegram_id:
 *                 type: string
 *                 example: "123456789"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *               location:
 *                 type: string
 *                 example: "New York"
 *               role:
 *                 type: string
 *                 example: "influencer"
 *               description:
 *                 type: string
 *                 example: "Content creator"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
router.post("/", createProfile);

/**
 * @swagger
 * /api/profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profiles not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getProfiles);

/**
 * @swagger
 * /api/profiles/{id}:
 *   get:
 *     summary: Get profile by ID
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Profile details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getProfile);

/**
 * @swagger
 * /api/profiles/{id}:
 *   put:
 *     summary: Update profile by ID
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               location:
 *                 type: string
 *               role:
 *                 type: string
 *               description:
 *                 type: string
 *           example:
 *             description: "Updated bio"
 *             location: "San Francisco"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
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
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", updateProfile);

/**
 * @swagger
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete profile by ID
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile MongoDB _id
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deleteProfile);

export default router;
