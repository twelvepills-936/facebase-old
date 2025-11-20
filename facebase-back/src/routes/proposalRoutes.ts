import { Router } from "express";
import {
  createProposalController,
  getProposalController,
  updateProposalController,
  deleteProposalController,
  uploadAttachmentsController,
  publishProposalController,
  cancelProposalStepController,
  getProposalByProjectIdController,
  getSubmittedProposalsController,
  updateProposalChannelController,
} from "../controllers/proposalController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/proposals:
 *   post:
 *     summary: Create a new proposal
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelId
 *               - initiatorId
 *               - projectId
 *             properties:
 *               channelId:
 *                 type: string
 *                 description: Channel MongoDB _id
 *                 example: "507f1f77bcf86cd799439011"
 *               initiatorId:
 *                 type: string
 *                 description: Profile MongoDB _id
 *                 example: "507f1f77bcf86cd799439012"
 *               projectId:
 *                 type: string
 *                 description: Project MongoDB _id
 *                 example: "507f1f77bcf86cd799439013"
 *               erid:
 *                 type: string
 *                 example: "ERID12345"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Proposal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
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
router.post("/", createProposalController);

/**
 * @swagger
 * /api/proposals/submitted:
 *   get:
 *     summary: Get all submitted proposals for the authenticated user
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of submitted proposals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proposal'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/submitted", getSubmittedProposalsController);

/**
 * @swagger
 * /api/proposals/project/{projectId}:
 *   get:
 *     summary: Get all proposals for a specific project
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project MongoDB _id
 *     responses:
 *       200:
 *         description: List of proposals for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proposal'
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
router.get("/project/:projectId", getProposalByProjectIdController);

/**
 * @swagger
 * /api/proposals/{id}:
 *   get:
 *     summary: Get proposal by ID
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     responses:
 *       200:
 *         description: Proposal details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getProposalController);

/**
 * @swagger
 * /api/proposals/{id}:
 *   put:
 *     summary: Update proposal by ID
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                     enum: ["waiting_approval", "waiting_channel_approval", "waiting_attachments_approval", "approved", "rejected", "channel_approved", "channel_rejected", "attachments_rejected", "attachments_approved"]
 *                   details:
 *                     type: array
 *                     items:
 *                       type: string
 *               erid:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Proposal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
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
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", updateProposalController);

/**
 * @swagger
 * /api/proposals/{id}:
 *   delete:
 *     summary: Delete proposal by ID
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     responses:
 *       200:
 *         description: Proposal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Proposal deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deleteProposalController);

/**
 * @swagger
 * /api/proposals/{id}/attachments:
 *   post:
 *     summary: Upload attachments to proposal
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               text:
 *                 type: string
 *                 description: Description text for attachments
 *     responses:
 *       200:
 *         description: Attachments uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
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
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/:id/attachments",
  upload.array("files") as any,
  uploadAttachmentsController
);

/**
 * @swagger
 * /api/proposals/{id}/publish:
 *   post:
 *     summary: Publish proposal (mark as published)
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     responses:
 *       200:
 *         description: Proposal published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/publish", publishProposalController);

/**
 * @swagger
 * /api/proposals/{id}/cancel-step:
 *   post:
 *     summary: Cancel current step of proposal
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     responses:
 *       200:
 *         description: Proposal step cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Proposal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/cancel-step", cancelProposalStepController);

/**
 * @swagger
 * /api/proposals/{id}/channel:
 *   put:
 *     summary: Update channel for proposal
 *     tags: [Proposals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Proposal MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelId
 *             properties:
 *               channelId:
 *                 type: string
 *                 description: New Channel MongoDB _id
 *     responses:
 *       200:
 *         description: Channel updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposal'
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
 *         description: Proposal or channel not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id/channel", updateProposalChannelController);

export default router;
