import crypto from "crypto";
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Сервис для работы с вебхуками от Тильды
 * Документация: https://help-ru.tilda.cc/forms/webhook
 */
class TildaService {
  private webhookSecret: string;
  private apiKey: string | null;

  constructor() {
    this.webhookSecret = process.env.TILDA_WEBHOOK_SECRET || "";
    this.apiKey = process.env.TILDA_API_KEY || null;
  }

  /**
   * Верификация вебхука от Тильды
   * Тильда может отправлять данные с токеном или без него
   * @param payload Тело запроса
   * @param headers Заголовки запроса
   */
  verifyWebhook(
    payload: any,
    headers: Record<string, string | string[] | undefined>
  ): boolean {
    // Если установлен секретный ключ, проверяем подпись
    if (this.webhookSecret) {
      // Тильда может отправлять токен в заголовке или в теле запроса
      const tokenFromHeader = headers["x-tilda-token"] as string;
      const tokenFromBody = payload.token || payload._token;

      if (tokenFromHeader) {
        return tokenFromHeader === this.webhookSecret;
      }

      if (tokenFromBody) {
        return tokenFromBody === this.webhookSecret;
      }

      // Если токен не найден, но секрет установлен - отклоняем
      return false;
    }

    // Если секрет не установлен, разрешаем все запросы (для разработки)
    // В production рекомендуется установить секрет
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ TILDA_WEBHOOK_SECRET not set in production!");
      return false;
    }

    return true;
  }

  /**
   * Парсинг данных формы от Тильды
   * Тильда отправляет данные в разных форматах в зависимости от настроек
   */
  parseFormData(payload: any): {
    formId: string;
    formName: string;
    fields: Record<string, any>;
    pageUrl: string;
    timestamp: Date;
  } {
    // Тильда может отправлять данные в разных форматах
    // Формат 1: Прямые поля формы
    // Формат 2: Вложенные объекты
    // Формат 3: Массив полей

    const formId = payload.formid || payload.form_id || payload.id || "";
    const formName = payload.formname || payload.form_name || payload.name || "";
    const pageUrl = payload.pageurl || payload.page_url || payload.url || "";

    // Извлекаем поля формы
    const fields: Record<string, any> = {};
    
    // Игнорируем служебные поля
    const ignoreFields = [
      "formid",
      "form_id",
      "id",
      "formname",
      "form_name",
      "name",
      "pageurl",
      "page_url",
      "url",
      "token",
      "_token",
      "t",
      "form-sent",
    ];

    // Собираем все поля формы
    for (const key in payload) {
      if (!ignoreFields.includes(key.toLowerCase())) {
        fields[key] = payload[key];
      }
    }

    return {
      formId,
      formName,
      fields,
      pageUrl,
      timestamp: new Date(),
    };
  }

  /**
   * Валидация данных формы
   */
  validateFormData(data: {
    formId: string;
    formName: string;
    fields: Record<string, any>;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.formId) {
      errors.push("Form ID is required");
    }

    if (Object.keys(data.fields).length === 0) {
      errors.push("Form fields are empty");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Логирование данных формы (для отладки)
   */
  logFormSubmission(data: {
    formId: string;
    formName: string;
    fields: Record<string, any>;
    pageUrl: string;
  }): void {
    console.log("📝 Tilda form submission received:");
    console.log(`  Form ID: ${data.formId}`);
    console.log(`  Form Name: ${data.formName}`);
    console.log(`  Page URL: ${data.pageUrl}`);
    console.log(`  Fields:`, data.fields);
  }
}

export default new TildaService();

