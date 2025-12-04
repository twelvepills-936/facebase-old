import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Сервис для работы с API Rocket Work
 * Документация: https://b2b.rocketwork.ru
 */
class RocketWorkService {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.ROCKETWORK_API_KEY || "";
    this.baseURL = process.env.ROCKETWORK_API_URL || "https://api.rocketwork.ru/v1";

    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 30000,
    });
  }

  /**
   * Создать выплату исполнителю
   * @param amount Сумма выплаты в рублях
   * @param recipientId ID получателя в системе Rocket Work (или данные для регистрации)
   * @param description Описание выплаты
   * @param metadata Дополнительные метаданные
   */
  async createPayout(
    amount: number,
    recipientId: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<{
    payoutId: string;
    status: string;
    amount: number;
    createdAt: string;
  }> {
    try {
      const response = await this.apiClient.post("/payouts", {
        amount,
        recipient_id: recipientId,
        description,
        metadata: {
          ...metadata,
          source: "facebase",
        },
      });

      return {
        payoutId: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
        createdAt: response.data.created_at,
      };
    } catch (error: any) {
      console.error("Rocket Work API Error:", error.response?.data || error.message);
      throw new Error(
        `Failed to create payout: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Получить статус выплаты
   * @param payoutId ID выплаты в системе Rocket Work
   */
  async getPayoutStatus(payoutId: string): Promise<{
    id: string;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    amount: number;
    recipient_id: string;
    created_at: string;
    completed_at?: string;
    error_message?: string;
  }> {
    try {
      const response = await this.apiClient.get(`/payouts/${payoutId}`);
      return response.data;
    } catch (error: any) {
      console.error("Rocket Work API Error:", error.response?.data || error.message);
      throw new Error(
        `Failed to get payout status: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Регистрация или получение ID исполнителя в Rocket Work
   * @param profileId ID профиля в нашей системе
   * @param userData Данные пользователя для регистрации
   */
  async registerOrGetRecipient(
    profileId: string,
    userData: {
      name: string;
      phone?: string;
      email?: string;
      bankAccount?: string;
      inn?: string;
    }
  ): Promise<string> {
    try {
      // Сначала пытаемся найти существующего получателя
      const searchResponse = await this.apiClient.get("/recipients", {
        params: {
          external_id: profileId,
        },
      });

      if (searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data[0].id;
      }

      // Если не найден, создаем нового
      const createResponse = await this.apiClient.post("/recipients", {
        external_id: profileId,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        bank_account: userData.bankAccount,
        inn: userData.inn,
      });

      return createResponse.data.id;
    } catch (error: any) {
      console.error("Rocket Work API Error:", error.response?.data || error.message);
      throw new Error(
        `Failed to register recipient: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Отменить выплату
   * @param payoutId ID выплаты
   */
  async cancelPayout(payoutId: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/payouts/${payoutId}/cancel`);
      return true;
    } catch (error: any) {
      console.error("Rocket Work API Error:", error.response?.data || error.message);
      throw new Error(
        `Failed to cancel payout: ${error.response?.data?.message || error.message}`
      );
    }
  }

  /**
   * Проверка валидности webhook подписи
   * @param payload Тело запроса
   * @param signature Подпись из заголовка
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.ROCKETWORK_WEBHOOK_SECRET || "";
    // Реализация проверки подписи зависит от формата, который использует Rocket Work
    // Здесь базовая реализация - нужно уточнить у Rocket Work
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");
    return signature === expectedSignature;
  }
}

export default new RocketWorkService();

