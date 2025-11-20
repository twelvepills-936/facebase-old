import { Router } from "express";
import {
  getBrandTasks,
  getTask,
  getUserTasksList,
  startTaskSubmission,
  submitStep,
} from "../controllers/taskController.js";

const router = Router();

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

/**
 * @swagger
 * /api/tasks/{taskId}/start:
 *   post:
 *     summary: Start a task (create submission)
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Creates a new task submission with initial activeStep set to 1.
 *       
 *       **Important for dev mode**: After starting a task, when fetching the task with GET /api/tasks/{taskId}, 
 *       you must include userId in the query parameter (?userId=...) to see the submission.
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
 *         description: User ID (optional, for dev mode only. In production, userId is extracted from Authorization header)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (optional, for dev mode only. In production, userId is extracted from Authorization header)
 *     responses:
 *       201:
 *         description: Task submission created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Submission ID
 *                 task:
 *                   type: string
 *                   description: Task ID
 *                 profile:
 *                   type: string
 *                   description: Profile ID
 *                 status:
 *                   type: string
 *                   enum: [in_progress, pending_review, completed, rejected]
 *                   description: Submission status
 *                 steps_data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       step_number:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, rejected]
 *                       data:
 *                         type: object
 *                       submitted_at:
 *                         type: string
 *                         format: date-time
 *                 activeStep:
 *                   type: integer
 *                   description: Current active step number
 *                   example: 1
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (task not found)
 *       401:
 *         description: Unauthorized (missing or invalid Authorization header in production mode)
 */
router.post("/:taskId/start", startTaskSubmission);

/**
 * @swagger
 * /api/tasks/{taskId}/steps/{stepNumber}:
 *   post:
 *     summary: Submit data for a specific step
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     description: |
 *       Submit step data. All fields in request body (except userId) will be saved as step data.
 *       
 *       **Prerequisites**: You must first call POST /api/tasks/{taskId}/start to create a submission before submitting step data.
 *       
 *       **Optional steps**: If a step has `required: false` in task definition, you can submit with empty body (only userId).
 *       This allows skipping informational or optional steps.
 *       
 *       **Important for dev mode**: After submitting a step, when fetching the task with GET /api/tasks/{taskId}, 
 *       you must include userId in the query parameter (?userId=...) to see the updated submission.
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
 *         description: User ID (optional, for dev mode only. In production, userId is extracted from Authorization header via Telegram initData)
 *     requestBody:
 *       required: false
 *       description: Required only if step has `required: true`. For optional steps, can be empty (only userId needed).
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (optional, for dev mode only. In production, userId is extracted from Authorization header)
 *             additionalProperties: true
 *             description: |
 *               All fields (except userId) will be saved as step data. Structure is flexible based on step type.
 *               
 *               Common body structures by step type:
 *               
 *               - link: { link: "url", comment: "text" }
 *               - file_upload: { screenshot: "url", video: "url" }
 *               - form: { field1: value1, field2: value2, ... }
 *               - report: { views: number, likes: number, report_link: "url" }
 *           examples:
 *             link_step:
 *               summary: Link step (e.g. Instagram post)
 *               value:
 *                 userId: "987654321"
 *                 link: "https://instagram.com/p/ABC123"
 *                 comment: "Posted story with brand mention"
 *             file_step:
 *               summary: File upload step (e.g. screenshots)
 *               value:
 *                 userId: "987654321"
 *                 screenshot: "https://s3.amazonaws.com/bucket/screenshot.jpg"
 *                 description: "Screenshot of posted content"
 *             form_step:
 *               summary: Form step (e.g. channel info)
 *               value:
 *                 userId: "987654321"
 *                 followers: 5000
 *                 engagement_rate: 3.5
 *                 niche: "lifestyle"
 *             report_step:
 *               summary: Report step (e.g. campaign results)
 *               value:
 *                 userId: "987654321"
 *                 views: 10000
 *                 likes: 500
 *                 comments: 50
 *                 report_link: "https://example.com/report.pdf"
 *             optional_step:
 *               summary: Optional step (skip with empty body)
 *               value:
 *                 userId: "987654321"
 *     responses:
 *       200:
 *         description: Step data submitted successfully. Returns updated submission with activeStep pointing to the next pending step
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
 *                 steps_data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 activeStep:
 *                   type: integer
 *                   description: Current active step number (automatically updated to next pending step)
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing userId, task submission not found - call /start first, step not found, or invalid data)
 *       401:
 *         description: Unauthorized (missing or invalid Authorization header in production mode)
 */
router.post("/:taskId/steps/:stepNumber", submitStep);

export default router;

