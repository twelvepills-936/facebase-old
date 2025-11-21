import { Request, Response } from "express";
import { approveStep, rejectStep } from "../services/taskService.js";

/**
 * @swagger
 * /api/admin/submissions/{submissionId}/steps/{stepNumber}/approve:
 *   post:
 *     summary: Approve a step (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Step number to approve
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewedBy:
 *                 type: string
 *                 description: Username or ID of the reviewer (optional)
 *     responses:
 *       200:
 *         description: Step approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Step approved successfully"
 *                 submission:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [in_progress, pending_review, completed, rejected]
 *                     activeStep:
 *                       type: integer
 *                     steps_data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           step_number:
 *                             type: integer
 *                           status:
 *                             type: string
 *                             enum: [pending, in_review, approved, rejected]
 *                           reviewed_at:
 *                             type: string
 *                             format: date-time
 *                           reviewed_by:
 *                             type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Submission or step not found
 *       500:
 *         description: Server error
 */
export const approveStepHandler = async (req: Request, res: Response) => {
  try {
    const { submissionId, stepNumber } = req.params;
    const { reviewedBy } = req.body;

    console.log(
      `📝 Admin approving step: submission=${submissionId}, step=${stepNumber}, reviewer=${reviewedBy || "admin"}`
    );

    const submission = await approveStep(
      submissionId,
      parseInt(stepNumber),
      reviewedBy || "admin"
    );

    res.json({
      message: "Step approved successfully",
      submission,
    });
  } catch (error: any) {
    console.error("Error approving step:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/admin/submissions/{submissionId}/steps/{stepNumber}/reject:
 *   post:
 *     summary: Reject a step (Admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *       - in: path
 *         name: stepNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: Step number to reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection (REQUIRED)
 *                 example: "The screenshot is not clear enough"
 *               reviewedBy:
 *                 type: string
 *                 description: Username or ID of the reviewer (optional)
 *     responses:
 *       200:
 *         description: Step rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Step rejected successfully"
 *                 submission:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [in_progress, pending_review, completed, rejected]
 *                     activeStep:
 *                       type: integer
 *                     steps_data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           step_number:
 *                             type: integer
 *                           status:
 *                             type: string
 *                             enum: [pending, in_review, approved, rejected]
 *                           reviewed_at:
 *                             type: string
 *                             format: date-time
 *                           reviewed_by:
 *                             type: string
 *                           rejection_reason:
 *                             type: string
 *       400:
 *         description: Bad request (missing reason or invalid status)
 *       404:
 *         description: Submission or step not found
 *       500:
 *         description: Server error
 */
export const rejectStepHandler = async (req: Request, res: Response) => {
  try {
    const { submissionId, stepNumber } = req.params;
    const { reason, reviewedBy } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    console.log(
      `📝 Admin rejecting step: submission=${submissionId}, step=${stepNumber}, reviewer=${reviewedBy || "admin"}, reason=${reason}`
    );

    const submission = await rejectStep(
      submissionId,
      parseInt(stepNumber),
      reviewedBy || "admin",
      reason
    );

    res.json({
      message: "Step rejected successfully",
      submission,
    });
  } catch (error: any) {
    console.error("Error rejecting step:", error);
    res.status(400).json({ error: error.message });
  }
};

