import ProfileModel from "../models/profileModel.js";
import TaskSubmission from "../models/taskSubmissionModel.js";
import ProposalModel from "../models/proposalModel.js";
import WalletModel from "../models/walletModel.js";

export interface IRatingStats {
  completedTasks: number;
  approvedProposals: number;
  totalEarned: number;
  referralsCount: number;
  rating: number;
  rank: number;
}

export interface IUserRating extends IRatingStats {
  profile: {
    _id: string;
    name: string;
    avatar?: string;
    username?: string;
    telegram_id: string;
  };
}

/**
 * Рассчитывает рейтинг пользователя на основе:
 * - Выполненных задач (completed tasks)
 * - Одобренных предложений (approved proposals)
 * - Общего заработка (total earned)
 * - Количества рефералов
 */
export const calculateUserRating = async (
  profileId: string
): Promise<IRatingStats> => {
  // Подсчитываем выполненные задачи
  const completedTasks = await TaskSubmission.countDocuments({
    profile: profileId,
    status: "completed",
  });

  // Подсчитываем одобренные предложения
  const approvedProposals = await ProposalModel.countDocuments({
    initiatorId: profileId,
    "status.value": "approved",
  });

  // Получаем общий заработок из кошелька
  const wallet = await WalletModel.findOne({ user: profileId });
  const totalEarned = wallet?.total_earned || 0;

  // Подсчитываем количество рефералов
  const profile = await ProfileModel.findById(profileId);
  const referralsCount = profile?.referrals?.length || 0;

  // Рассчитываем рейтинг по формуле:
  // Рейтинг = (выполненные задачи * 10) + (одобренные предложения * 5) + (заработок / 100) + (рефералы * 2)
  const rating =
    completedTasks * 10 +
    approvedProposals * 5 +
    Math.floor(totalEarned / 100) +
    referralsCount * 2;

  return {
    completedTasks,
    approvedProposals,
    totalEarned,
    referralsCount,
    rating,
    rank: 0, // Ранг будет установлен при получении топ-листа
  };
};

/**
 * Получает рейтинг конкретного пользователя
 */
export const getUserRating = async (
  telegramId: string
): Promise<IUserRating | null> => {
  const profile = await ProfileModel.findOne({ telegram_id: telegramId });
  if (!profile) {
    return null;
  }

  const profileId = String(profile._id);
  const stats = await calculateUserRating(profileId);

  return {
    ...stats,
    profile: {
      _id: profileId,
      name: profile.name,
      avatar: profile.avatar,
      username: profile.username,
      telegram_id: profile.telegram_id,
    },
  };
};

/**
 * Получает топ пользователей по рейтингу
 */
export const getTopRatings = async (
  limit: number = 100
): Promise<IUserRating[]> => {
  // Получаем все профили
  const profiles = await ProfileModel.find({});

  // Рассчитываем рейтинг для каждого пользователя
  const ratings: IUserRating[] = await Promise.all(
    profiles.map(async (profile) => {
      const profileId = String(profile._id);
      const stats = await calculateUserRating(profileId);
      return {
        ...stats,
        profile: {
          _id: profileId,
          name: profile.name,
          avatar: profile.avatar,
          username: profile.username,
          telegram_id: profile.telegram_id,
        },
      };
    })
  );

  // Сортируем по рейтингу (по убыванию)
  ratings.sort((a, b) => b.rating - a.rating);

  // Устанавливаем ранги
  ratings.forEach((rating, index) => {
    rating.rank = index + 1;
  });

  // Возвращаем топ пользователей
  return ratings.slice(0, limit);
};

/**
 * Получает позицию пользователя в рейтинге
 */
export const getUserRank = async (
  telegramId: string
): Promise<{ rank: number; totalUsers: number } | null> => {
  const topRatings = await getTopRatings(1000); // Получаем большой список для поиска
  const userIndex = topRatings.findIndex(
    (r) => r.profile.telegram_id === telegramId
  );

  if (userIndex === -1) {
    return null;
  }

  return {
    rank: topRatings[userIndex].rank,
    totalUsers: topRatings.length,
  };
};

