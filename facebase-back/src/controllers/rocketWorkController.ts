import { Request, Response } from "express";
import rocketWorkService from "../services/rocketWorkService.js";
import { updateTransactionFromRocketWork } from "../services/walletService.js";

/**
 * Webhook endpoint для обработки уведомлений от Rocket Work
 */
export const handleRocketWorkWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Проверка подписи (если требуется)
    const signature = req.headers["x-rocketwork-signature"] as string;
    const payload = JSON.stringify(req.body);

    if (signature) {
      const isValid = rocketWorkService.verifyWebhookSignature(
        payload,
        signature
      );
      if (!isValid) {
        res.status(401).json({ error: "Invalid signature" });
        return;
      }
    }

    const { event, data } = req.body;

    switch (event) {
      case "payout.completed":
      case "payout.failed":
      case "payout.cancelled":
      case "payout.processing":
        // Обновляем статус транзакции
        await updateTransactionFromRocketWork(
          data.payout_id,
          data.status
        );
        break;

      default:
        console.log(`Unhandled Rocket Work event: ${event}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    const { message } = err as { message: string };
    console.error("Rocket Work webhook error:", message);
    res.status(500).json({ error: message });
  }
};

/**
 * Получить статус выплаты через Rocket Work
 */
export const getPayoutStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { payoutId } = req.params;
    const status = await rocketWorkService.getPayoutStatus(payoutId);
    res.json(status);
  } catch (err) {
    const { message } = err as { message: string };
    res.status(500).json({ error: message });
  }
};

