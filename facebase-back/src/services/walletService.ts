import WalletModel, { IWallet } from "../models/walletModel.js";
import ProfileModel from "../models/profileModel.js";
import rocketWorkService from "./rocketWorkService.js";

export const getWallet = async (userId: string): Promise<IWallet | null> => {
  return WalletModel.findOne({ user: userId }).populate("user", "name");
};

export const addWithdrawMethod = async (
  userId: string,
  type: "crypto_wallet" | "bank_account",
  details: string
): Promise<IWallet | null> => {
  const wallet = await WalletModel.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");

  wallet.withdrawMethods.push({ type, details });
  return wallet.save();
};

export const createWithdrawalRequest = async (
  userId: string,
  amount: number,
  methodType: string,
  details: string
): Promise<IWallet | null> => {
  const wallet = await WalletModel.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");

  if (wallet.balance < amount) throw new Error("Insufficient balance");

  const withdrawMethod = wallet.withdrawMethods.find(
    (method) => method.type.toString() === methodType
  );

  if (!withdrawMethod && !details) throw new Error("Withdraw method not found");

  // Получаем профиль пользователя для регистрации в Rocket Work
  const profile = await ProfileModel.findById(userId);
  if (!profile) throw new Error("Profile not found");

  let rocketWorkRecipientId: string | undefined;
  let rocketWorkPayoutId: string | undefined;

  // Интеграция с Rocket Work (если включена)
  const useRocketWork = process.env.USE_ROCKETWORK === "true";
  
  if (useRocketWork) {
    try {
      // Регистрируем или получаем ID получателя в Rocket Work
      rocketWorkRecipientId = await rocketWorkService.registerOrGetRecipient(
        userId,
        {
          name: profile.name,
          phone: profile.telegram_id, // Используем telegram_id как телефон, если нет другого
          bankAccount: methodType === "bank_account" ? details : undefined,
        }
      );

      // Создаем выплату в Rocket Work
      const payout = await rocketWorkService.createPayout(
        amount,
        rocketWorkRecipientId,
        `Выплата пользователю ${profile.name}`,
        {
          wallet_id: (wallet._id as any).toString(),
          profile_id: userId,
          method_type: methodType,
        }
      );

      rocketWorkPayoutId = payout.payoutId;
    } catch (error: any) {
      console.error("Rocket Work integration error:", error);
      // Не блокируем создание транзакции, если Rocket Work недоступен
      // Но логируем ошибку для отладки
    }
  }

  wallet.transactions.push({
    date: new Date(),
    type: "withdrawal",
    amount,
    status: "pending",
    details,
    rocketWorkPayoutId,
    rocketWorkRecipientId,
  });

  wallet.balance -= amount;
  wallet.balance_available -= amount;

  return wallet.save();
};

export const creditWallet = async (
  userId: string,
  amount: number,
  description: string
): Promise<IWallet | null> => {
  const wallet = await WalletModel.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");

  wallet.balance += amount;
  wallet.total_earned += amount;
  wallet.transactions.push({
    date: new Date(),
    type: "receive",
    amount,
    status: "completed",
    description,
  });

  return wallet.save();
};

/**
 * Обновить статус транзакции на основе webhook от Rocket Work
 */
export const updateTransactionFromRocketWork = async (
  payoutId: string,
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
): Promise<IWallet | null> => {
  // Находим транзакцию по payoutId
  const wallet = await WalletModel.findOne({
    "transactions.rocketWorkPayoutId": payoutId,
  });

  if (!wallet) {
    throw new Error(`Transaction with payoutId ${payoutId} not found`);
  }

  const transaction = wallet.transactions.find(
    (t) => t.rocketWorkPayoutId === payoutId
  );

  if (!transaction) {
    throw new Error(`Transaction with payoutId ${payoutId} not found`);
  }

  // Маппинг статусов Rocket Work на наши статусы
  let newStatus: "pending" | "approved" | "rejected" | "completed";
  
  switch (status) {
    case "completed":
      newStatus = "completed";
      break;
    case "failed":
    case "cancelled":
      newStatus = "rejected";
      // Возвращаем средства на баланс
      wallet.balance += transaction.amount;
      wallet.balance_available += transaction.amount;
      break;
    case "processing":
      newStatus = "approved";
      break;
    default:
      newStatus = "pending";
  }

  transaction.status = newStatus;
  return wallet.save();
};
