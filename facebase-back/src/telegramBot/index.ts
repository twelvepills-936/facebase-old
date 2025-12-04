import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import * as ratingService from "../services/ratingService.js";

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN as string;

let bot: TelegramBot | null = null;

const initTelegramBot = () => {
  // В dev режиме отключаем Telegram bot если токен не настроен
  if (process.env.NODE_ENV !== "production" && !token) {
    console.log("⚠️ Telegram bot disabled in development mode (no token configured)");
    return;
  }

  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not defined - bot will not start");
    return;
  }

  if (bot) {
    console.log("Telegram bot already initialized");
    return;
  }

  try {
    bot = new TelegramBot(token, { 
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.chat.first_name || "пользователь";
      bot!.sendMessage(
      chatId,
      `Добро пожаловать в Facebase, ${name}💚
      – Получайте рекламные задания на выполнение интеграций во всех социальных сетях
      – Приглашайте блогеров для заработка по реферальной программе
      – Развивайте канал и будьте в курсе последних новостей в мире блогинга`
    );
  });

  bot.onText(/\/rating/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id?.toString();

    if (!telegramId) {
      bot!.sendMessage(chatId, "❌ Не удалось определить ваш ID пользователя");
      return;
    }

    try {
      const rating = await ratingService.getUserRating(telegramId);
      
      if (!rating) {
        bot!.sendMessage(
          chatId,
          "❌ Профиль не найден. Пожалуйста, зарегистрируйтесь в приложении."
        );
        return;
      }

      const rankInfo = await ratingService.getUserRank(telegramId);
      const rankText = rankInfo 
        ? `🏆 Ваше место в рейтинге: ${rankInfo.rank} из ${rankInfo.totalUsers}`
        : "🏆 Ваше место в рейтинге: рассчитывается...";

      const message = `📊 Ваш рейтинг в Facebase

⭐ Рейтинг: ${rating.rating} баллов
${rankText}

📈 Статистика:
✅ Выполнено заданий: ${rating.completedTasks}
✅ Одобрено предложений: ${rating.approvedProposals}
💰 Общий заработок: ${rating.totalEarned.toFixed(2)} ₽
👥 Рефералов: ${rating.referralsCount}

💡 Как повысить рейтинг:
• Выполняйте задания (+10 баллов за задание)
• Получайте одобрение предложений (+5 баллов за предложение)
• Приглашайте друзей (+2 балла за реферала)
• Зарабатывайте больше (+1 балл за каждые 100 ₽)`;

      bot!.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error getting rating:", error);
      bot!.sendMessage(
        chatId,
        "❌ Произошла ошибка при получении рейтинга. Попробуйте позже."
      );
    }
  });

  bot.onText(/\/top/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const topRatings = await ratingService.getTopRatings(10);
      
      if (topRatings.length === 0) {
        bot!.sendMessage(chatId, "📊 Рейтинг пока пуст. Будьте первым!");
        return;
      }

      let message = "🏆 Топ-10 пользователей Facebase\n\n";
      
      topRatings.forEach((user, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "▫️";
        const name = user.profile.username 
          ? `@${user.profile.username}` 
          : user.profile.name;
        message += `${medal} ${index + 1}. ${name}\n`;
        message += `   ⭐ ${user.rating} баллов | ✅ ${user.completedTasks} заданий | 💰 ${user.totalEarned.toFixed(2)} ₽\n\n`;
      });

      bot!.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error getting top ratings:", error);
      bot!.sendMessage(
        chatId,
        "❌ Произошла ошибка при получении рейтинга. Попробуйте позже."
      );
    }
  });

  // Обработка ошибок polling с ограничением спама
  let lastErrorTime = 0;
  const ERROR_THROTTLE_MS = 60000; // Показывать ошибку не чаще раза в минуту
  
    bot.on("polling_error", (error) => {
    const now = Date.now();
    if (now - lastErrorTime > ERROR_THROTTLE_MS) {
      console.error("Telegram polling error:", error.message);
      console.log("(Further polling errors will be throttled for 1 minute)");
      lastErrorTime = now;
    }
    });

    console.log("Telegram bot started successfully");
  } catch (error) {
    console.error("Failed to start Telegram bot:", error);
  }
};

const sendTelegramNotification = async (
  telegramId: string,
  message: string,
  buttons?: [
    {
      text: string;
      url: string;
    }
  ]
) => {
  if (!bot) {
    console.warn("Telegram bot not initialized, skipping notification");
    return;
  }

  try {
    await bot.sendMessage(
      telegramId,
      message,
      buttons
        ? {
            reply_markup: {
              inline_keyboard: [buttons],
            },
          }
        : undefined
    );
  } catch (error) {
    console.error(
      `Ошибка при отправке сообщения пользователю ${telegramId}:`,
      error
    );
  }
};

const stopTelegramBot = async () => {
  if (bot) {
    try {
      await bot.stopPolling();
      console.log("Telegram bot stopped");
    } catch (error) {
      console.error("Error stopping Telegram bot:", error);
    }
  }
};

export { initTelegramBot, sendTelegramNotification, stopTelegramBot };
