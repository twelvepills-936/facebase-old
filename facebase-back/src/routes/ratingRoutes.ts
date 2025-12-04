import { Router } from "express";
import {
  getMyRating,
  getTopRatings,
  getUserRating,
  getMyRank,
} from "../controllers/ratingController.js";

const router = Router();

/**
 * @swagger
 * /api/rating/me:
 *   get:
 *     summary: Get current user's rating
 *     tags: [Rating]
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
router.get("/me", getMyRating);

/**
 * @swagger
 * /api/rating/top:
 *   get:
 *     summary: Get top users by rating
 *     tags: [Rating]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of top users to return
 *     responses:
 *       200:
 *         description: List of top users by rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   completedTasks:
 *                     type: number
 *                   approvedProposals:
 *                     type: number
 *                   totalEarned:
 *                     type: number
 *                   referralsCount:
 *                     type: number
 *                   rating:
 *                     type: number
 *                   rank:
 *                     type: number
 *                   profile:
 *                     type: object
 */
router.get("/top", getTopRatings);

/**
 * @swagger
 * /api/rating/user/{telegramId}:
 *   get:
 *     summary: Get user rating by telegram ID
 *     tags: [Rating]
 *     parameters:
 *       - in: path
 *         name: telegramId
 *         required: true
 *         schema:
 *           type: string
 *         description: User Telegram ID
 *     responses:
 *       200:
 *         description: User rating information
 *       404:
 *         description: Profile not found
 */
router.get("/user/:telegramId", getUserRating);

/**
 * @swagger
 * /api/rating/rank:
 *   get:
 *     summary: Get current user's rank in rating
 *     tags: [Rating]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User rank information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rank:
 *                   type: number
 *                 totalUsers:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found in rating
 */
router.get("/rank", getMyRank);

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard (top users by rating) - alias for /api/rating/top
 *     tags: [Rating]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of top users to return
 *     responses:
 *       200:
 *         description: List of top users by rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   completedTasks:
 *                     type: number
 *                     example: 5
 *                   approvedProposals:
 *                     type: number
 *                     example: 10
 *                   totalEarned:
 *                     type: number
 *                     example: 5000.50
 *                   referralsCount:
 *                     type: number
 *                     example: 3
 *                   rating:
 *                     type: number
 *                     example: 105
 *                   rank:
 *                     type: number
 *                     example: 1
 *                   profile:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       name:
 *                         type: string
 *                         example: "Иван Иванов"
 *                       avatar:
 *                         type: string
 *                         example: "https://example.com/avatar.jpg"
 *                       username:
 *                         type: string
 *                         example: "ivan_ivanov"
 *                       telegram_id:
 *                         type: string
 *                         example: "123456789"
 */
router.get("/leaderboard", getTopRatings);

export default router;

