import { Router } from "express";
import { approveStepHandler, rejectStepHandler } from "../controllers/adminController.js";

const router = Router();

// Admin routes for step moderation
router.post("/submissions/:submissionId/steps/:stepNumber/approve", approveStepHandler);
router.post("/submissions/:submissionId/steps/:stepNumber/reject", rejectStepHandler);

export default router;

