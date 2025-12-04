import { Request, Response } from "express";
import * as ratingService from "../services/ratingService.js";

/**
 * Получить рейтинг текущего пользователя
 */
export const getMyRating = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const rating = await ratingService.getUserRating(userId);
    if (!rating) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.json(rating);
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ message });
  }
};

/**
 * Получить топ пользователей по рейтингу
 */
export const getTopRatings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const ratings = await ratingService.getTopRatings(limit);
    res.json(ratings);
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ message });
  }
};

/**
 * Получить рейтинг конкретного пользователя по telegram_id
 */
export const getUserRating = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const telegramId = req.params.telegramId;
    const rating = await ratingService.getUserRating(telegramId);
    if (!rating) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.json(rating);
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ message });
  }
};

/**
 * Получить позицию пользователя в рейтинге
 */
export const getMyRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const rank = await ratingService.getUserRank(userId);
    if (!rank) {
      res.status(404).json({ message: "User not found in rating" });
      return;
    }

    res.json(rank);
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ message });
  }
};

