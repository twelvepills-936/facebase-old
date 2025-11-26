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
        
        // КРИТИЧЕСКАЯ ПРОВЕРКА: submission должен быть создан!
        if (!submission) {
          console.error(`❌ CRITICAL: Failed to create submission for user ${userId}`);
          console.error(`   - taskId: ${taskId}`);
          console.error(`   - userId (telegram_id): ${userId}`);
          console.error(`   - Possible reasons: Task not found, Database error, Invalid data`);
          
          return res.status(500).json({ 
            error: "Failed to create submission",
            details: "Could not create or retrieve submission for this task. Please try again.",
            debug: {
              taskId,
              userId,
              hint: "No submission exists for this userId and this task. Auto-creation failed."
            }
          });
        }
        
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
      console.log(`ℹ️  To get submission, add ?userId=TELEGRAM_ID to request`);
    }

    // ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ ОТВЕТА
    if (userId && submission === null) {
      console.error(`🚨 CRITICAL: GET request is about to return submission = null despite userId provided!`);
      console.error(`   - taskId: ${taskId}`);
      console.error(`   - userId: ${userId}`);
      console.error(`   - This should NOT happen after auto-creation logic!`);
      console.error(`   - Converting this to HTTP 500 to make the problem explicit for the client.`);

      return res.status(500).json({
        error: "Submission is null",
        details: "Submission for this task and userId should exist, but was not found.",
        debug: {
          taskId,
          userId,
          hint: "Check that the same userId is used for POST /steps and GET /tasks, and inspect server logs for auto-creation errors."
        }
      });
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

    const submissions = await getUserTasks(userId, filters);

    // Преобразуем в формат {task, submission} для консистентности с GET /api/tasks/{taskId}
    const tasksWithSubmissions = submissions.map(submission => ({
      task: submission.task,
      submission: {
        _id: submission._id,
        profile: submission.profile,
        status: submission.status,
        steps_data: submission.steps_data,
        activeStep: submission.activeStep,
        started_at: submission.started_at,
        completed_at: submission.completed_at,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      }
    }));

    // ПРОВЕРКА: если какой-то submission = null (не должно быть!)
    const nullSubmissions = tasksWithSubmissions.filter(item => !item.submission);
    if (nullSubmissions.length > 0) {
      console.error(`🚨 WARNING: Found ${nullSubmissions.length} tasks with null submission in user list!`);
      console.error(`   - userId: ${userId}`);
      console.error(`   - This should NOT happen!`);
    }

    res.status(200).json(tasksWithSubmissions);
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
      approvedSteps: submission.steps_data.filter(s => s.status === 'approved').length,
      totalSteps: submission.steps_data.length
    });

    // ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ ОТВЕТА
    if (!submission) {
      console.error(`🚨 CRITICAL: POST request returning null submission despite userId provided!`);
      console.error(`   - taskId: ${taskId}`);
      console.error(`   - stepNumber: ${stepNumber}`);
      console.error(`   - userId: ${userId}`);
      console.error(`   - This should NEVER happen!`);
      throw new Error("Submission is null after submitStepData");
    }

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

