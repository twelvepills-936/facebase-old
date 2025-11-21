import Task, { ITask } from "../models/taskModel.js";
import TaskSubmission, {
  ITaskSubmission,
} from "../models/taskSubmissionModel.js";
import ProfileModel from "../models/profileModel.js";
import { FilterQuery } from "mongoose";
import { 
  emitSubmissionCreated, 
  emitSubmissionUpdated, 
  emitStepCompleted,
  emitTaskListUpdated 
} from "./socketService.js";

export const getTasksByBrand = async (brandId: string): Promise<ITask[]> => {
  return await Task.find({ brand: brandId, status: "active" }).sort({
    createdAt: -1,
  });
};

export const getTaskById = async (taskId: string): Promise<ITask | null> => {
  return await Task.findById(taskId).populate("brand");
};

export const getUserTasks = async (
  userId: string,
  filters: FilterQuery<ITaskSubmission> = {}
): Promise<ITaskSubmission[]> => {
  console.log(`📋 getUserTasks called: userId=${userId}, filters:`, filters);
  
  let profile = await ProfileModel.findOne({ telegram_id: userId });

  if (!profile) {
    console.log(`⚠️ Profile not found for userId: ${userId}, creating automatically...`);
    // Создаем профиль автоматически
    profile = new ProfileModel({
      name: `User ${userId}`,
      telegram_id: userId,
      username: `user_${userId}`,
    });
    await profile.save();
    console.log(`✅ Profile created automatically: ${profile._id}`);
  } else {
    console.log(`✅ Profile found: ${profile._id} (telegram_id: ${profile.telegram_id})`);
  }

  const submissions = await TaskSubmission.find({
    profile: profile._id,
    ...filters,
  })
    .populate({
      path: "task",
      populate: { path: "brand" },
    })
    .sort({ updatedAt: -1 });

  console.log(`📊 Found ${submissions.length} submissions for profile ${profile._id}`);
  if (submissions.length > 0) {
    submissions.forEach((sub, idx) => {
      console.log(`  ${idx + 1}. Task: ${sub.task?._id || sub.task}, Status: ${sub.status}, ActiveStep: ${sub.activeStep}`);
    });
  }

  return submissions;
};

export const getTaskSubmission = async (
  taskId: string,
  userId: string
): Promise<ITaskSubmission | null> => {
  console.log(`🔍 getTaskSubmission called: taskId=${taskId}, userId=${userId}`);
  
  let profile = await ProfileModel.findOne({ telegram_id: userId });

  if (!profile) {
    console.log(`⚠️ Profile not found for userId: ${userId}, creating automatically...`);
    // Создаем профиль автоматически
    profile = new ProfileModel({
      name: `User ${userId}`,
      telegram_id: userId,
      username: `user_${userId}`,
    });
    await profile.save();
    console.log(`✅ Profile created automatically: ${profile._id}`);
  } else {
    console.log(`✅ Profile found: ${profile._id} (telegram_id: ${profile.telegram_id})`);
  }

  const submission = await TaskSubmission.findOne({
    task: taskId,
    profile: profile._id,
  });
  
  if (submission) {
    console.log(`✅ Submission found: ${submission._id} (task: ${submission.task}, profile: ${submission.profile})`);
  } else {
    console.log(`⚠️ Submission NOT found for task=${taskId}, profile=${profile._id}`);
    
    // Проверим сколько всего submission'ов у этого пользователя
    const allUserSubmissions = await TaskSubmission.find({ profile: profile._id });
    console.log(`📊 Total submissions for this profile: ${allUserSubmissions.length}`);
    if (allUserSubmissions.length > 0) {
      console.log(`📋 User's submissions:`, allUserSubmissions.map(s => ({ 
        id: s._id, 
        task: s.task,
        status: s.status 
      })));
    }
  }

  return submission;
};

export const startTask = async (
  taskId: string,
  userId: string
): Promise<ITaskSubmission> => {
  console.log(`🚀 startTask called: taskId=${taskId}, userId=${userId}`);
  
  const task = await Task.findById(taskId);
  if (!task) {
    console.error(`❌ Task not found: ${taskId}`);
    throw new Error("Task not found");
  }
  console.log(`✅ Task found: ${task._id} (${task.title})`);

  let profile = await ProfileModel.findOne({ telegram_id: userId });
  if (!profile) {
    console.log(`⚠️ Profile not found for userId: ${userId}, creating automatically...`);
    // Создаем профиль автоматически при первом запросе
    profile = new ProfileModel({
      name: `User ${userId}`,
      telegram_id: userId,
      username: `user_${userId}`,
    });
    await profile.save();
    console.log(`✅ Profile created automatically: ${profile._id}`);
  } else {
    console.log(`✅ Profile found: ${profile._id} (telegram_id: ${profile.telegram_id})`);
  }

  // Проверяем, нет ли уже начатой заявки
  const existingSubmission = await TaskSubmission.findOne({
    task: taskId,
    profile: profile._id,
  });

  if (existingSubmission) {
    console.log(`♻️ Submission already exists: ${existingSubmission._id}`);
    // Если activeStep не установлен (старая запись), устанавливаем его
    if (!existingSubmission.activeStep) {
      const firstPendingStep = existingSubmission.steps_data.find(
        (step) => step.status === "pending"
      );
      existingSubmission.activeStep = firstPendingStep?.step_number || 1;
      await existingSubmission.save();
      console.log(`✅ Updated existing submission activeStep to: ${existingSubmission.activeStep}`);
    }
    return existingSubmission;
  }

  console.log(`📝 Creating new submission...`);
  
  // Создаем структуру шагов
  const steps_data = task.steps.map((step) => ({
    step_number: step.step_number,
    status: "pending" as const,
    data: null,
  }));

  const submission = new TaskSubmission({
    task: taskId,
    profile: profile._id,
    status: "in_progress",
    steps_data,
    activeStep: 1,
    started_at: new Date(),
  });

  const savedSubmission = await submission.save();
  console.log(`✅ NEW SUBMISSION CREATED:`, {
    submissionId: savedSubmission._id,
    taskId: savedSubmission.task,
    profileId: savedSubmission.profile,
    status: savedSubmission.status,
    activeStep: savedSubmission.activeStep,
    stepsCount: savedSubmission.steps_data.length
  });

  // Эмитим событие создания submission
  try {
    emitSubmissionCreated(userId, savedSubmission);
    emitTaskListUpdated(userId);
  } catch (error) {
    console.error('Failed to emit WebSocket events:', error);
  }

  return savedSubmission;
};

export const submitStepData = async (
  taskId: string,
  userId: string,
  stepNumber: number,
  stepData: any
): Promise<ITaskSubmission> => {
  console.log(`🔍 submitStepData called: task=${taskId}, user=${userId}, step=${stepNumber}`);
  
  let profile = await ProfileModel.findOne({ telegram_id: userId });
  if (!profile) {
    console.log(`⚠️ Profile not found for userId: ${userId}, creating automatically...`);
    // Создаем профиль автоматически
    profile = new ProfileModel({
      name: `User ${userId}`,
      telegram_id: userId,
      username: `user_${userId}`,
    });
    await profile.save();
    console.log(`✅ Profile created automatically: ${profile._id}`);
  } else {
    console.log(`✅ Profile found: ${profile._id}`);
  }

  let submission = await TaskSubmission.findOne({
    task: taskId,
    profile: profile._id,
  });

  // Если submission не найден - создаем автоматически
  if (!submission) {
    console.log(`📝 Submission not found, auto-creating for task=${taskId}, profile=${profile._id}...`);
    submission = await startTask(taskId, userId);
    console.log(`✅ Submission auto-created: ${submission._id}, status=${submission.status}`);
  } else {
    console.log(`✅ Submission found: ${submission._id}, status=${submission.status}`);
  }


  // Получаем информацию о задаче для проверки required
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const stepIndex = submission.steps_data.findIndex(
    (step) => step.step_number === stepNumber
  );

  if (stepIndex === -1) {
    throw new Error("Step not found");
  }

  // Находим определение шага в задаче
  const stepDefinition = task.steps.find(s => s.step_number === stepNumber);
  
  // Проверяем, что если шаг обязательный, то должны быть данные
  const isDataEmpty = !stepData || Object.keys(stepData).length === 0;
  
  // 🔥 ИСКЛЮЧЕНИЕ: Для шагов типа "report" можно пропустить данные даже если required=true
  // Это позволяет отметить шаг выполненным и вернуться к заполнению отчета позже
  const canSkipData = stepDefinition?.type === "report";
  
  if (stepDefinition?.required && isDataEmpty && !canSkipData) {
    throw new Error("This step requires data to be submitted");
  }

  // Обновляем данные шага (даже если пустые для необязательных или report шагов)
  submission.steps_data[stepIndex].data = stepData || null;
  submission.steps_data[stepIndex].status = "in_review"; // Отправлено на модерацию
  submission.steps_data[stepIndex].submitted_at = new Date();
  console.log(`✅ Step ${stepNumber} submitted for review (status: in_review)`);

  // Проверяем, все ли шаги одобрены (approved)
  const allStepsApproved = submission.steps_data.every(
    (step) => step.status === "approved"
  );

  if (allStepsApproved) {
    submission.status = "completed";
    submission.completed_at = new Date();
    // Оставляем activeStep на последнем шаге
    submission.activeStep = stepNumber;
    console.log(`🎉 All steps approved! Task completed!`);
  } else {
    // Находим следующий шаг для выполнения (pending или rejected)
    const nextStep = submission.steps_data.find(
      (step) => step.status === "pending" || step.status === "rejected"
    );
    if (nextStep) {
      submission.activeStep = nextStep.step_number;
      console.log(`➡️ Active step updated to: ${nextStep.step_number}`);
    } else {
      // Все шаги либо in_review, либо approved - ждем модерации
      submission.status = "pending_review";
      console.log(`⏳ All steps submitted, waiting for review (status: pending_review)`);
    }
  }

  const savedSubmission = await submission.save();
  console.log(`💾 Submission saved successfully: ${savedSubmission._id}`);
  
  // Эмитим события обновления submission
  try {
    emitStepCompleted(userId, savedSubmission, stepNumber);
    emitSubmissionUpdated(userId, savedSubmission);
    emitTaskListUpdated(userId);
  } catch (error) {
    console.error('Failed to emit WebSocket events:', error);
  }
  
  return savedSubmission;
};

// Одобрить шаг (для админа)
export const approveStep = async (
  submissionId: string,
  stepNumber: number,
  reviewedBy: string
): Promise<ITaskSubmission> => {
  console.log(`✅ Approving step ${stepNumber} for submission ${submissionId} by ${reviewedBy}`);

  const submission = await TaskSubmission.findById(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const stepIndex = submission.steps_data.findIndex(
    (step) => step.step_number === stepNumber
  );

  if (stepIndex === -1) {
    throw new Error("Step not found");
  }

  const step = submission.steps_data[stepIndex];

  if (step.status !== "in_review") {
    throw new Error(`Step must be in "in_review" status to approve. Current status: ${step.status}`);
  }

  // Обновляем статус шага
  submission.steps_data[stepIndex].status = "approved";
  submission.steps_data[stepIndex].reviewed_at = new Date();
  submission.steps_data[stepIndex].reviewed_by = reviewedBy;
  submission.steps_data[stepIndex].rejection_reason = undefined; // Очищаем причину отклонения если была

  console.log(`✅ Step ${stepNumber} approved by ${reviewedBy}`);

  // Проверяем, все ли шаги одобрены
  const allStepsApproved = submission.steps_data.every(
    (s) => s.status === "approved"
  );

  if (allStepsApproved) {
    submission.status = "completed";
    submission.completed_at = new Date();
    console.log(`🎉 All steps approved! Task completed!`);
  } else {
    // Находим следующий шаг для выполнения
    const nextStep = submission.steps_data.find(
      (s) => s.status === "pending" || s.status === "rejected"
    );
    if (nextStep) {
      submission.activeStep = nextStep.step_number;
      console.log(`➡️ Active step updated to: ${nextStep.step_number}`);
    }
  }

  const savedSubmission = await submission.save();
  console.log(`💾 Submission saved after approval`);

  // Эмитим события
  try {
    emitSubmissionUpdated(submission.profile.toString(), savedSubmission);
    emitTaskListUpdated(submission.profile.toString());
  } catch (error) {
    console.error('Failed to emit WebSocket events:', error);
  }

  return savedSubmission;
};

// Отклонить шаг (для админа)
export const rejectStep = async (
  submissionId: string,
  stepNumber: number,
  reviewedBy: string,
  rejectionReason: string
): Promise<ITaskSubmission> => {
  console.log(`❌ Rejecting step ${stepNumber} for submission ${submissionId} by ${reviewedBy}`);

  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new Error("Rejection reason is required");
  }

  const submission = await TaskSubmission.findById(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const stepIndex = submission.steps_data.findIndex(
    (step) => step.step_number === stepNumber
  );

  if (stepIndex === -1) {
    throw new Error("Step not found");
  }

  const step = submission.steps_data[stepIndex];

  if (step.status !== "in_review") {
    throw new Error(`Step must be in "in_review" status to reject. Current status: ${step.status}`);
  }

  // Обновляем статус шага
  submission.steps_data[stepIndex].status = "rejected";
  submission.steps_data[stepIndex].reviewed_at = new Date();
  submission.steps_data[stepIndex].reviewed_by = reviewedBy;
  submission.steps_data[stepIndex].rejection_reason = rejectionReason.trim();

  console.log(`❌ Step ${stepNumber} rejected by ${reviewedBy}. Reason: ${rejectionReason}`);

  // Устанавливаем activeStep на отклоненный шаг, чтобы пользователь мог переделать
  submission.activeStep = stepNumber;
  console.log(`➡️ Active step set to rejected step: ${stepNumber}`);

  // Статус submission остается in_progress или меняем на rejected если хотим
  // Оставляем in_progress, чтобы пользователь мог переделать
  if (submission.status === "pending_review") {
    submission.status = "in_progress";
    console.log(`📝 Submission status changed back to in_progress`);
  }

  const savedSubmission = await submission.save();
  console.log(`💾 Submission saved after rejection`);

  // Эмитим события
  try {
    emitSubmissionUpdated(submission.profile.toString(), savedSubmission);
    emitTaskListUpdated(submission.profile.toString());
  } catch (error) {
    console.error('Failed to emit WebSocket events:', error);
  }

  return savedSubmission;
};

