import express from "express";
import {
  getProjects,
  getProject,
  createNewProject,
  updateExistingProject,
  removeProject,
  addRule,
  removeRule,
  updateRule,
  saveProject,
  unsaveProject,
} from "../controllers/projectController.js";

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: theme
 *         schema:
 *           type: string
 *         description: Filter by theme
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getProject);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - theme
 *               - platform
 *               - reward
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Product Launch Campaign"
 *               description:
 *                 type: string
 *                 example: "Promote our new product to tech audience"
 *               location:
 *                 type: string
 *                 enum: ["international", "moscow", "sankt_peterburg", "ekaterinburg", "novosibirsk", "kazan", "krasnoyarsk", "nizhny_novgorod", "chelyabinsk", "ufa", "samara", "rostov_na_donu", "krasnodar", "omsk", "voronezh", "perm", "volgograd"]
 *                 example: "international"
 *               theme:
 *                 type: string
 *                 enum: ["automobiles", "gadgets", "food_drinks", "health_medical", "games", "cafes_restaurants", "real_estate", "education", "clothing_accessories", "travel", "home_goods", "finance"]
 *                 example: "gadgets"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               briefing:
 *                 type: string
 *                 example: "Detailed project briefing"
 *               platform:
 *                 type: string
 *                 enum: ["Telegram", "Instagram", "YouTube", "X", "VK", "TikTok"]
 *                 example: "Telegram"
 *               subscribers:
 *                 type: number
 *                 example: 1000
 *               reward:
 *                 type: number
 *                 example: 5000
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *               promoted:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
router.post("/", createNewProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project by ID
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               theme:
 *                 type: string
 *               image:
 *                 type: string
 *               briefing:
 *                 type: string
 *               platform:
 *                 type: string
 *               subscribers:
 *                 type: number
 *               reward:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *               promoted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", updateExistingProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete project by ID
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", removeProject);

/**
 * @swagger
 * /api/projects/{id}/rules:
 *   post:
 *     summary: Add a rule to project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Must include product link in post"
 *     responses:
 *       200:
 *         description: Rule added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/rules", addRule);

/**
 * @swagger
 * /api/projects/{id}/rules:
 *   delete:
 *     summary: Remove a rule from project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ruleId
 *             properties:
 *               ruleId:
 *                 type: string
 *                 description: Rule _id to remove
 *     responses:
 *       200:
 *         description: Rule removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *         description: Project or rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id/rules", removeRule);

/**
 * @swagger
 * /api/projects/{id}/rules:
 *   put:
 *     summary: Update a rule in project
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ruleId
 *               - text
 *             properties:
 *               ruleId:
 *                 type: string
 *                 description: Rule _id to update
 *               text:
 *                 type: string
 *                 example: "Updated rule text"
 *     responses:
 *       200:
 *         description: Rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
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
 *         description: Project or rule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id/rules", updateRule);

/**
 * @swagger
 * /api/projects/{id}/save:
 *   post:
 *     summary: Save project to user's saved projects
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     responses:
 *       200:
 *         description: Project saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project saved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/save", saveProject);

/**
 * @swagger
 * /api/projects/{id}/unsave:
 *   post:
 *     summary: Remove project from user's saved projects
 *     tags: [Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     responses:
 *       200:
 *         description: Project unsaved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project unsaved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/unsave", unsaveProject);

export default router;
