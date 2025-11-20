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
    // Приоритет: req.user.id > query.userId > body.userId (для совместимости)
    const userId = (req as any).user?.id || req.query.userId as string || req.body?.userId;

    const task = await getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Получаем submission юзера, если есть
    let submission = null;
    if (userId) {
      submission = await getTaskSubmission(taskId, userId);
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
    // Приоритет: req.user.id > query.userId > body.userId (для совместимости)
    const userId = (req as any).user?.id || req.query.userId as string || req.body?.userId;
    const { status } = req.query;

    if (!userId) {
      // Если нет userId - возвращаем пустой массив (для dev mode)
      console.log("⚠️ No userId provided, returning empty array (dev mode)");
      return res.status(200).json([]);
    }

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

export const startTaskSubmission = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
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
    console.log(`Starting task ${taskId} for user ${userId} (from ${userIdSource})`);

    const submission = await startTask(taskId, userId);

    res.status(201).json(submission);
  } catch (error) {
    const { message } = error as { message: string };
    console.error("Error starting task submission:", error);
    res.status(400).json({ 
      error: message || "Failed to start task",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

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
    console.log(`Submitting step ${stepNumber} for task ${taskId}, user ${userId} (from ${userIdSource})`);

    // Исключаем userId из данных шага
    const { userId: _unused, ...stepData } = req.body;

    const submission = await submitStepData(
      taskId,
      userId,
      parseInt(stepNumber),
      stepData
    );

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

