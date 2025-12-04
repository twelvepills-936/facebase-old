import { Request, Response } from "express";
import ProfileModel from "../models/profileModel.js";
import WalletModel from "../models/walletModel.js";
import { parseAuthToken } from "../utils/parseAuthToken.js";
import * as ratingService from "../services/ratingService.js";

export const checkUserRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Authorization header missing or invalid" });

      return;
    }

    const token = authHeader.split(" ")[1];
    
    // DEV MODE: Support test tokens
    const isTestToken = token.startsWith("test-") || token.startsWith("dev-");
    let decodedUser: any;
    let startParam: string | null = null;
    let initDataRaw: string = token;
    
    if (isTestToken) {
      // Mock user for test tokens
      const userId = token.split("-")[1] || "123456789";
      decodedUser = {
        id: userId,
        first_name: "Test User",
        last_name: "Dev",
        username: `test_user_${userId}`,
        photo_url: "",
        language_code: "en"
      };
      console.log(`🔧 DEV MODE: Using mock user from test token - ${userId}`);
    } else {
      // Parse real Telegram token
      const parsed = parseAuthToken(authHeader);
      decodedUser = parsed.user;
      startParam = parsed.startParam;
      initDataRaw = parsed.initDataRaw;
    }

    const existedProfile = await ProfileModel.findOne({
      telegram_id: decodedUser.id,
    });

    if (existedProfile) {
      res.status(400).json({ message: "Profile already registered" });

      return;
    }

    const newProfile = new ProfileModel({
      name: decodedUser.first_name,
      telegram_id: decodedUser.id,
      avatar: decodedUser.photo_url,
      location: decodedUser.language_code,
      role: "",
      desciption: "",
      channels: [],
      telegramInitData: initDataRaw,
      username: decodedUser.username,
      referalls: [],
    });

    const savedProfile = await newProfile.save();

    const newWallet = new WalletModel({
      user: savedProfile._id,
      balance: 0,
      transactions: [],
      withdrawMethods: [],
    });
    await newWallet.save();

    if (startParam) {
      const referrerProfile = await ProfileModel.findOne({
        telegram_id: startParam,
      });

      if (referrerProfile) {
        referrerProfile.referrals.push({
          profile: savedProfile._id as string,
          referral_stats: {
            completed_tasks_count: 0,
            earnings: 0,
          },
        });

        await referrerProfile.save();

        console.log(
          `User ${savedProfile._id} added as a referral to ${referrerProfile._id}`
        );
      } else {
        console.log(
          `Referrer profile with telegram_id ${startParam} not found.`
        );
      }
    }

    res.status(200).json({ message: "Profile successfully registered!" });
  } catch (err) {
    res.status(500).json({ message: JSON.stringify(err) });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Authorization header missing or invalid" });

      return;
    }

    const token = authHeader.split(" ")[1];
    
    // DEV MODE: Support test tokens
    const isTestToken = token.startsWith("test-") || token.startsWith("dev-");
    let decodedUser: any;
    
    if (isTestToken) {
      // Mock user for test tokens
      const userId = token.split("-")[1] || "123456789";
      decodedUser = {
        id: userId,
        first_name: "Test User",
        last_name: "Dev",
        username: `test_user_${userId}`,
        photo_url: "",
        language_code: "en"
      };
      console.log(`🔧 DEV MODE: Using mock user from test token - ${userId}`);
    } else {
      // Parse real Telegram token
      const decodedInitDataRaw = atob(token);
      const initDataParams = new URLSearchParams(decodedInitDataRaw);
      const encodedUser = initDataParams.get("user");
      decodedUser = JSON.parse(decodeURIComponent(encodedUser as string));
    }

    const existedProfile = await ProfileModel.findOne({
      telegram_id: decodedUser.id,
    })
      .populate("channels")
      .populate("referrals.profile")
      .populate("saved_projects");

    if (!existedProfile) {
      res.status(400).json({ message: "Profile already registered" });

      return;
    }

    res.status(200).json({
      ...existedProfile.toObject(),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
};

/**
 * Получить рейтинг текущего пользователя
 */
export const getRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Authorization header missing or invalid" });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    // DEV MODE: Support test tokens
    const isTestToken = token.startsWith("test-") || token.startsWith("dev-");
    let decodedUser: any;
    
    if (isTestToken) {
      // Mock user for test tokens
      const userId = token.split("-")[1] || "123456789";
      decodedUser = {
        id: userId,
        first_name: "Test User",
        last_name: "Dev",
        username: `test_user_${userId}`,
        photo_url: "",
        language_code: "en"
      };
      console.log(`🔧 DEV MODE: Using mock user from test token - ${userId}`);
    } else {
      // Parse real Telegram token
      const decodedInitDataRaw = atob(token);
      const initDataParams = new URLSearchParams(decodedInitDataRaw);
      const encodedUser = initDataParams.get("user");
      decodedUser = JSON.parse(decodeURIComponent(encodedUser as string));
    }

    const rating = await ratingService.getUserRating(decodedUser.id);
    if (!rating) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    // Получаем реальную позицию пользователя в рейтинге
    const userRank = await ratingService.getUserRank(decodedUser.id);
    if (userRank) {
      rating.rank = userRank.rank;
    }

    res.json(rating);
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ message });
  }
};

/**
 * Получить топ пользователей по рейтингу (leaderboard)
 * Включает позицию текущего пользователя, если он авторизован
 */
export const getLeaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const ratings = await ratingService.getTopRatings(limit);
    
    // Пытаемся получить информацию о текущем пользователе (если авторизован)
    let currentUserRank: { rank: number; totalUsers: number; rating: number } | null = null;
    
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        
        // DEV MODE: Support test tokens
        const isTestToken = token.startsWith("test-") || token.startsWith("dev-");
        let decodedUser: any;
        
        if (isTestToken) {
          // Mock user for test tokens
          const userId = token.split("-")[1] || "123456789";
          decodedUser = {
            id: userId,
            first_name: "Test User",
            last_name: "Dev",
            username: `test_user_${userId}`,
            photo_url: "",
            language_code: "en"
          };
        } else {
          // Parse real Telegram token
          const decodedInitDataRaw = atob(token);
          const initDataParams = new URLSearchParams(decodedInitDataRaw);
          const encodedUser = initDataParams.get("user");
          if (encodedUser) {
            decodedUser = JSON.parse(decodeURIComponent(encodedUser as string));
          }
        }
        
        if (decodedUser?.id) {
          const userRank = await ratingService.getUserRank(decodedUser.id);
          const userRating = await ratingService.getUserRating(decodedUser.id);
          
          if (userRank && userRating) {
            currentUserRank = {
              rank: userRank.rank,
              totalUsers: userRank.totalUsers,
              rating: userRating.rating,
            };
          }
        }
      }
    } catch (authError) {
      // Игнорируем ошибки авторизации - leaderboard доступен и без авторизации
      console.log("Auth check failed for leaderboard (optional):", authError);
    }
    
    // Возвращаем объект с leaderboard и информацией о текущем пользователе
    res.json({
      leaderboard: ratings,
      currentUser: currentUserRank,
    });
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ message });
  }
};
