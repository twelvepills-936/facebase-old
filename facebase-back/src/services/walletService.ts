import WalletModel, { IWallet } from "../models/walletModel.js";

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

  wallet.transactions.push({
    date: new Date(),
    type: "withdrawal",
    amount,
    status: "pending",
    details,
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
