import { Request, Response } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addRuleToProject,
  removeRuleFromProject,
  updateRuleInProject,
  saveProjectToProfile,
  unsaveProjectFromProfile,
} from "../services/projectService.js";

export const getProjects = async (req: Request, res: Response) => {
  try {
    const {
      location,
      platform,
      theme,
      sortBy,
      sortOrder,
      minReward,
      maxReward,
    } = req.query;

    const filters: Record<string, any> = {};
    if (location) filters.location = location;
    if (platform) filters.platform = platform;
    if (theme) filters.theme = theme;

    if (minReward || maxReward) {
      filters.reward = {};

      if (minReward) filters.reward.$gte = Number(minReward);
      if (maxReward) filters.reward.$lte = Number(maxReward);
    }

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy as any] = sortOrder === "desc" ? -1 : 1;
    }

    const projects = await getAllProjects(filters, sortOptions);

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSubmittedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createNewProject = async (req: Request, res: Response) => {
  try {
    const newProject = await createProject(req.body);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ error: "Invalid data" });
  }
};

export const updateExistingProject = async (req: Request, res: Response) => {
  try {
    const updatedProject = await updateProject(req.params.id, req.body);
    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ error: "Invalid data" });
  }
};

export const removeProject = async (req: Request, res: Response) => {
  try {
    const deletedProject = await deleteProject(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const addRule = async (req: Request, res: Response) => {
  try {
    const updatedProject = await addRuleToProject(req.params.id, req.body);
    res.status(200).json(updatedProject);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(400).json({ error: message });
  }
};

export const removeRule = async (req: Request, res: Response) => {
  try {
    const updatedProject = await removeRuleFromProject(
      req.params.id,
      req.body.ruleName
    );
    res.status(200).json(updatedProject);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(400).json({ error: message });
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const updatedProject = await updateRuleInProject(
      req.params.id,
      req.body.ruleName,
      req.body.updatedRule
    );
    res.status(200).json(updatedProject);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(400).json({ error: message });
  }
};

export const saveProject = async (req: Request, res: Response) => {
  try {
    // В dev mode может не быть user (если endpoints публичные)
    const userId = (req as any).user?.id || req.body.userId || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Provide userId in query params (?userId=...) or body for dev mode"
      });
    }

    await saveProjectToProfile(userId, req.params.id);

    res.status(200).json({ message: "Project successfully saved!" });
  } catch (error) {
    const { message } = error as { message: string };
    console.error("Error saving project:", error);
    res.status(400).json({ 
      error: message || "Failed to save project",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const unsaveProject = async (req: Request, res: Response) => {
  try {
    // В dev mode может не быть user (если endpoints публичные)
    const userId = (req as any).user?.id || req.body.userId || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Provide userId in query params (?userId=...) or body for dev mode"
      });
    }

    console.log("Unsaving project for userId:", userId);

    await unsaveProjectFromProfile(userId, req.params.id);

    res.status(200).json({ message: "Project successfully unsaved!" });
  } catch (error) {
    const { message } = error as { message: string };

    res.status(400).json({ error: message });
  }
};
