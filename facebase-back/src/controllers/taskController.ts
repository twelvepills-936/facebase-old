import { Request, Response } from "express";
import {
  getTasksByBrand,
  getTaskById,
  getUserTasks,
  startTask,
  submitStepData,
  getTaskSubmission,
} from "../services/taskService.js";

export const getBrandTasks = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.params;
    const tasks = await getTasksByBrand(brandId);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching brand tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    // В dev mode может не быть user (если endpoints публичные)
    // Приоритет: req.user.id > body.userId > query.userId (ОДИНАКОВЫЙ ПРИОРИТЕТ ВО ВСЕХ ENDPOINTS!)
    const userId = (req as any).user?.id || req.body?.userId || req.query.userId as string;
    const userIdSource = (req as any).user?.id ? 'user.id' : (req.body?.userId ? 'body' : (req.query.userId ? 'query' : 'none'));

    console.log(`📖 GET /api/tasks/${taskId} - userId: ${userId || 'NOT PROVIDED'} (from: ${userIdSource})`);

    const task = await getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Получаем или создаем submission юзера
    let submission = null;
    if (userId) {
      submission = await getTaskSubmission(taskId, userId);
      
      // Если submission не найден - создаем автоматически
      if (!submission) {
        console.log(`📝 Submission not found, auto-creating for user ${userId}...`);
        submission = await startTask(taskId, userId);
        console.log(`✅ Submission auto-created: ${submission._id}`);
      }
      
      console.log(`📦 Submission for user ${userId}:`, {
        submissionId: submission._id,
        status: submission.status,
        activeStep: submission.activeStep,
        stepsCount: submission.steps_data?.length
      });
    } else {
      console.log(`⚠️ No userId provided, cannot fetch/create submission`);
    }

    res.status(200).json({
      task,
      submission,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getUserTasksList = async (req: Request, res: Response) => {
  try {
    // В dev mode может не быть user (если endpoints публичные)
    // Приоритет: req.user.id > body.userId > query.userId (ОДИНАКОВЫЙ ПРИОРИТЕТ ВО ВСЕХ ENDPOINTS!)
    const userId = (req as any).user?.id || req.body?.userId || req.query.userId as string;
    const userIdSource = (req as any).user?.id ? 'user.id' : (req.body?.userId ? 'body' : (req.query.userId ? 'query' : 'none'));
    const { status } = req.query;

    if (!userId) {
      // Если нет userId - возвращаем пустой массив (для dev mode)
      console.log("⚠️ No userId provided, returning empty array (dev mode)");
      return res.status(200).json([]);
    }
    
    console.log(`📋 GET /api/tasks/user/list - userId: ${userId} (from: ${userIdSource}), status filter: ${status || 'none'}`);

    const filters: any = {};
    if (status) {
      filters.status = status;
    }

    const tasks = await getUserTasks(userId, filters);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    res.status(500).json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// startTaskSubmission removed - submission is now created automatically

export const submitStep = async (req: Request, res: Response) => {
  try {
    const { taskId, stepNumber } = req.params;
    
    // Приоритет: req.user.id (из Telegram initData) > body.userId > query.userId
    // В dev mode endpoints публичные, поэтому req.user может быть undefined даже с Authorization header
    const userId = (req as any).user?.id || req.body.userId || req.query.userId as string;

    if (!userId) {
      // В dev mode все endpoints публичные, поэтому просто просим userId
      // В production mode authMiddleware установит req.user, и userId будет из initData
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "In production: provide Authorization header with Telegram initData (userId will be extracted automatically). In dev mode: provide userId in query (?userId=...) or body"
      });
    }

    const userIdSource = (req as any).user?.id ? 'initData (Authorization header)' : 'dev mode (query/body)';
    console.log(`📝 Submitting step ${stepNumber} for task ${taskId}, user ${userId} (from ${userIdSource})`);

    // Исключаем userId из данных шага
    const { userId: _unused, ...stepData } = req.body;
    console.log(`📦 Step data:`, stepData);

    const submission = await submitStepData(
      taskId,
      userId,
      parseInt(stepNumber),
      stepData
    );

    console.log(`✅ Step ${stepNumber} submitted successfully:`, {
      submissionId: submission._id,
      status: submission.status,
      activeStep: submission.activeStep,
      completedSteps: submission.steps_data.filter(s => s.status === 'completed').length,
      totalSteps: submission.steps_data.length
    });

    res.status(200).json(submission);
  } catch (error) {
    const { message } = error as { message: string };
    console.error("Error submitting step:", error);
    res.status(400).json({ 
      error: message || "Failed to submit step",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

