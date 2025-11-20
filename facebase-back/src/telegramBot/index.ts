import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN as string;

let bot: TelegramBot | null = null;

const initTelegramBot = () => {
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not defined - bot will not start");
    return;
  }

  if (bot) {
    console.log("Telegram bot already initialized");
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });

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

  // test
    bot.on("polling_error", (error) => {
      console.error("Telegram polling error:", error.message);
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
