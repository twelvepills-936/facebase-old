import { Router } from "express";
import {
  getBrands,
  getBrand,
  saveBrand,
  unsaveBrand,
} from "../controllers/brandController.js";

const router = Router();

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     parameters:
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [Telegram, Instagram, YouTube, X, VK, TikTok]
 *         description: Filter by platform
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: theme
 *         schema:
 *           type: string
 *         description: Filter by theme
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get("/", getBrands);

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
 *       404:
 *         description: Brand not found
 */
router.get("/:id", getBrand);

/**
 * @swagger
 * /api/brands/{id}/save:
 *   post:
 *     summary: Save brand to user favorites
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand saved successfully
 */
router.post("/:id/save", saveBrand);

/**
 * @swagger
 * /api/brands/{id}/unsave:
 *   post:
 *     summary: Remove brand from user favorites
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand unsaved successfully
 */
router.post("/:id/unsave", unsaveBrand);

export default router;

