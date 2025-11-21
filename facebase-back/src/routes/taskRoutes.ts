import { Router } from "express";
import {
  getBrandTasks,
  getTask,
  getUserTasksList,
  submitStep,
} from "../controllers/taskController.js";

const router = Router();

// 🧪 Test endpoint to verify routing works
router.get("/", (req, res) => {
  res.json({ 
    message: "Tasks API is working", 
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "GET /api/tasks/brand/:brandId",
      "GET /api/tasks/user/list",
      "GET /api/tasks/:taskId",
      "POST /api/tasks/:taskId/steps/:stepNumber"
    ]
  });
});

/**
 * @swagger
 * /api/tasks/brand/{brandId}:
 *   get:
 *     summary: Get all tasks for a specific brand
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/brand/:brandId", getBrandTasks);

/**
 * @swagger
 * /api/tasks/user/list:
 *   get:
 *     summary: Get all tasks user is interacting with
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional, for dev mode. In production, userId is extracted from Authorization header)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_progress, pending_review, completed, rejected]
 *         description: Filter by submission status
 *     responses:
 *       200:
 *         description: List of user task submissions with activeStep field
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   task:
 *                     type: object
 *                     description: Populated task with brand details
 *                   profile:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [in_progress, pending_review, completed, rejected]
 *                   steps_data:
 *                     type: array
 *                     items:
 *                       type: object
 *                   activeStep:
 *                     type: integer
 *                     description: Current active step number
 *                   started_at:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/user/list", getUserTasksList);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (optional, for dev mode to get user's submission. In production, userId is extracted from Authorization header)
 *     responses:
 *       200:
 *         description: Task details with user submission if exists (submission includes activeStep field)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   type: object
 *                   description: Task details
 *                 submission:
 *                   type: object
 *                   nullable: true
 *                   description: User submission if exists (null if no userId provided or user hasn't started the task)
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [in_progress, pending_review, completed, rejected]
 *                     steps_data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     activeStep:
 *                       type: integer
 *                       description: Current active step number
 *                     started_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Task not found
 */
router.get("/:taskId", getTask);

// /start endpoint removed - submission is now created automatically
// when accessing GET /api/tasks/{taskId} or POST /api/tasks/{taskId}/steps/{stepNumber}

/**
 * @swagger
 * /api/tasks/{taskId}/steps/{stepNumber}:
 *   post:
 *     summary: Submit data for a specific step
 *     tags:
 *       - Tasks
 *     security:
 *       - BearerAuth: []
 *     description: Submit step data. All fields in request body (except userId) will be saved as step data. Submission is created automatically if it does not exist.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Step number
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID (for dev mode only)
 *     requestBody:
 *       required: false
 *       description: Step data (flexible structure based on step type)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (for dev mode)
 *               link:
 *                 type: string
 *                 description: Link for link-type steps
 *               comment:
 *                 type: string
 *                 description: Comment or description
 *             additionalProperties: true
 *           example:
 *             userId: "987654321"
 *             link: "https://instagram.com/p/ABC123"
 *             comment: "Posted story"
 *     responses:
 *       200:
 *         description: Step submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 task:
 *                   type: string
 *                 profile:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [in_progress, pending_review, completed, rejected]
 *                 activeStep:
 *                   type: integer
 *                   description: Current active step number
 *                 steps_data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/:taskId/steps/:stepNumber", submitStep);

export default router;

