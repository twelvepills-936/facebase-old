import { Request, Response } from "express";
import {
  getAllBrands,
  getBrandById,
  saveBrandToProfile,
  unsaveBrandFromProfile,
} from "../services/brandService.js";

export const getBrands = async (req: Request, res: Response) => {
  try {
    const { location, platform, theme, sortBy, sortOrder } = req.query;
    const userId = (req as any).user?.id;

    const filters: Record<string, any> = { status: "active" };
    if (location) filters.location = location;
    if (platform) filters.platform = platform;
    if (theme) filters.theme = theme;

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[sortBy as any] = sortOrder === "desc" ? -1 : 1;
    }

    const brands = await getAllBrands(filters, sortOptions, userId);

    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBrand = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const brand = await getBrandById(req.params.id, userId);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const saveBrand = async (req: Request, res: Response) => {
  try {
    // В dev mode может не быть user (если endpoints публичные)
    const userId = (req as any).user?.id || req.body.userId || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Provide userId in query params (?userId=...) or body for dev mode"
      });
    }

    await saveBrandToProfile(userId, req.params.id);

    res.status(200).json({ message: "Brand successfully saved!" });
  } catch (error) {
    const { message } = error as { message: string };
    console.error("Error saving brand:", error);
    res.status(400).json({ 
      error: message || "Failed to save brand",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const unsaveBrand = async (req: Request, res: Response) => {
  try {
    // В dev mode может не быть user (если endpoints публичные)
    const userId = (req as any).user?.id || req.body.userId || req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        hint: "Provide userId in query params (?userId=...) or body for dev mode"
      });
    }

    await unsaveBrandFromProfile(userId, req.params.id);

    res.status(200).json({ message: "Brand successfully unsaved!" });
  } catch (error) {
    const { message } = error as { message: string };
    console.error("Error unsaving brand:", error);
    res.status(400).json({ 
      error: message || "Failed to unsave brand",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

