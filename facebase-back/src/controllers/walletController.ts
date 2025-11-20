import { Request, Response } from "express";
import {
  getWallet,
  addWithdrawMethod,
  createWithdrawalRequest,
  creditWallet,
} from "../services/walletService.js";

export const getUserWallet = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const wallet = await getWallet(userId);

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json(wallet);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(500).json({ message });
  }
};

export const addWithdrawMethodController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { method_type, details } = req.body;

    const wallet = await addWithdrawMethod(userId, method_type, details);
    res.status(200).json(wallet);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(500).json({ message });
  }
};

export const createWithdrawalController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { amount, method_type, details } = req.body;

    const wallet = await createWithdrawalRequest(
      userId,
      amount,
      method_type,
      details
    );
    res.status(201).json(wallet);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(500).json({ message });
  }
};

export const receiveWalletController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await creditWallet(userId, amount, description);
    res.status(200).json(wallet);
  } catch (error) {
    const { message } = error as { message: string };

    res.status(500).json({ message });
  }
};
