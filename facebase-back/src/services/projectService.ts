import Project, { IProject, IRule } from "../models/projectModel.js";
import ProfileModel from "../models/profileModel.js";
import { FilterQuery, SortOrder, Types } from "mongoose";

export const getAllProjects = async (
  filters: FilterQuery<IProject> = {},
  sortOptions: Record<string, SortOrder> = {}
): Promise<IProject[]> => {
  return await Project.find(filters).select("-proposals").sort(sortOptions);
};

export const getProjectById = async (id: string): Promise<IProject | null> => {
  return await Project.findById(id).select("-proposals");
};

export const createProject = async (data: IProject): Promise<IProject> => {
  const newProject = new Project(data);
  return await newProject.save();
};

export const updateProject = async (
  id: string,
  data: Partial<IProject>
): Promise<IProject | null> => {
  return await Project.findByIdAndUpdate(id, data, { new: true }).populate(
    "proposals"
  );
};

export const deleteProject = async (id: string): Promise<IProject | null> => {
  return await Project.findByIdAndDelete(id);
};

export const addRuleToProject = async (
  projectId: string,
  rule: IRule
): Promise<IProject | null> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  project.rules.push(rule);
  return await project.save();
};

export const removeRuleFromProject = async (
  projectId: string,
  ruleText: string
): Promise<IProject | null> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  project.rules = project.rules.filter((rule) => rule.text !== ruleText);
  return await project.save();
};

export const updateRuleInProject = async (
  projectId: string,
  ruleText: string,
  updatedRule: Partial<IRule>
): Promise<IProject | null> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const ruleIndex = project.rules.findIndex((rule) => rule.text === ruleText);

  if (ruleIndex === -1) {
    throw new Error("Rule not found");
  }

  project.rules[ruleIndex] = { ...project.rules[ruleIndex], ...updatedRule };

  return await project.save();
};

export const saveProjectToProfile = async (
  userId: string,
  projectId: string
) => {
  const currentProfile = await ProfileModel.findOne({
    telegram_id: userId,
  });

  if (!currentProfile) {
    throw new Error("Profile not found");
  }

  const existedSavedProject = currentProfile.saved_projects.some(
    (savedProjectId: any) =>
      savedProjectId.equals(new Types.ObjectId(projectId))
  );

  if (existedSavedProject) {
    throw new Error("Project already saved");
  }

  currentProfile.saved_projects.push(projectId as any);

  return await currentProfile.save();
};

export const unsaveProjectFromProfile = async (
  userId: string,
  projectId: string
) => {
  const currentProfile = await ProfileModel.findOne({ telegram_id: userId });

  if (!currentProfile) {
    throw new Error("Profile not found");
  }

  const existedSavedProject = currentProfile.saved_projects.some(
    (savedProjectId: any) =>
      savedProjectId.equals(new Types.ObjectId(projectId))
  );

  if (!existedSavedProject) {
    throw new Error("Project is not in saved list");
  }

  currentProfile.saved_projects = currentProfile.saved_projects.filter(
    (savedProjectId: any) =>
      !savedProjectId.equals(new Types.ObjectId(projectId))
  );

  return await currentProfile.save();
};
