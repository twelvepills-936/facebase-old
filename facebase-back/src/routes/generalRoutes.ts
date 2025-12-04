import express from "express";
import {
  checkUserRegistration,
  getUser,
  getRating,
  getLeaderboard,
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

/**
 * @swagger
 * /api/general/rating:
 *   get:
 *     summary: Get current user's rating
 *     tags: [General]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User rating information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedTasks:
 *                   type: number
 *                 approvedProposals:
 *                   type: number
 *                 totalEarned:
 *                   type: number
 *                 referralsCount:
 *                   type: number
 *                 rating:
 *                   type: number
 *                 rank:
 *                   type: number
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/rating", getRating);

/**
 * @swagger
 * /api/general/leaderboard:
 *   get:
 *     summary: Get leaderboard (top users by rating)
 *     tags: [General]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of top users to return
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *         description: Bearer token (optional - if provided, includes current user's rank)
 *     responses:
 *       200:
 *         description: Leaderboard with optional current user rank
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       completedTasks:
 *                         type: number
 *                       approvedProposals:
 *                         type: number
 *                       totalEarned:
 *                         type: number
 *                       referralsCount:
 *                         type: number
 *                       rating:
 *                         type: number
 *                       rank:
 *                         type: number
 *                       profile:
 *                         type: object
 *                 currentUser:
 *                   type: object
 *                   nullable: true
 *                   description: Current user's rank (only if authenticated)
 *                   properties:
 *                     rank:
 *                       type: number
 *                       description: User's position in rating
 *                     totalUsers:
 *                       type: number
 *                       description: Total number of users in rating
 *                     rating:
 *                       type: number
 *                       description: User's rating score
 */
router.get("/leaderboard", getLeaderboard);

export default router;
