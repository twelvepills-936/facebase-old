import Task, { ITask } from "../models/taskModel.js";
import TaskSubmission, {
  ITaskSubmission,
} from "../models/taskSubmissionModel.js";
import ProfileModel from "../models/profileModel.js";
import { FilterQuery } from "mongoose";

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
  const profile = await ProfileModel.findOne({ telegram_id: userId });

  if (!profile) {
    throw new Error("Profile not found");
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

  return submissions;
};

export const getTaskSubmission = async (
  taskId: string,
  userId: string
): Promise<ITaskSubmission | null> => {
  const profile = await ProfileModel.findOne({ telegram_id: userId });

  if (!profile) {
    return null;
  }

  return await TaskSubmission.findOne({
    task: taskId,
    profile: profile._id,
  });
};

export const startTask = async (
  taskId: string,
  userId: string
): Promise<ITaskSubmission> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error("Task not found");
  }

  const profile = await ProfileModel.findOne({ telegram_id: userId });
  if (!profile) {
    throw new Error("Profile not found");
  }

  // Проверяем, нет ли уже начатой заявки
  const existingSubmission = await TaskSubmission.findOne({
    task: taskId,
    profile: profile._id,
  });

  if (existingSubmission) {
    // Если activeStep не установлен (старая запись), устанавливаем его
    if (!existingSubmission.activeStep) {
      const firstPendingStep = existingSubmission.steps_data.find(
        (step) => step.status === "pending"
      );
      existingSubmission.activeStep = firstPendingStep?.step_number || 1;
      await existingSubmission.save();
    }
    return existingSubmission;
  }

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

  return await submission.save();
};

export const submitStepData = async (
  taskId: string,
  userId: string,
  stepNumber: number,
  stepData: any
): Promise<ITaskSubmission> => {
  const profile = await ProfileModel.findOne({ telegram_id: userId });
  if (!profile) {
    throw new Error("Profile not found");
  }

  const submission = await TaskSubmission.findOne({
    task: taskId,
    profile: profile._id,
  });

  if (!submission) {
    throw new Error("Task submission not found. Please start the task first.");
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
  if (stepDefinition?.required && isDataEmpty) {
    throw new Error("This step requires data to be submitted");
  }

  // Обновляем данные шага (даже если пустые для необязательных шагов)
  submission.steps_data[stepIndex].data = stepData || null;
  submission.steps_data[stepIndex].status = "completed";
  submission.steps_data[stepIndex].submitted_at = new Date();

  // Проверяем, все ли шаги выполнены
  const allStepsCompleted = submission.steps_data.every(
    (step) => step.status === "completed"
  );

  if (allStepsCompleted) {
    submission.status = "pending_review";
    // Оставляем activeStep на последнем завершенном шаге
    submission.activeStep = stepNumber;
  } else {
    // Находим следующий незавершенный шаг и устанавливаем его как активный
    const nextPendingStep = submission.steps_data.find(
      (step) => step.status === "pending"
    );
    if (nextPendingStep) {
      submission.activeStep = nextPendingStep.step_number;
    }
  }

  return await submission.save();
};

