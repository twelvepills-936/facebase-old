import { Request, Response } from "express";
import tildaService from "../services/tildaService.js";
import ProfileModel from "../models/profileModel.js";

/**
 * Webhook endpoint для обработки данных форм от Тильды
 */
export const handleTildaWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Верификация вебхука
    const isValid = tildaService.verifyWebhook(req.body, req.headers);

    if (!isValid) {
      console.error("❌ Tilda webhook verification failed");
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    // Парсинг данных формы
    const formData = tildaService.parseFormData(req.body);

    // Валидация данных
    const validation = tildaService.validateFormData(formData);
    if (!validation.valid) {
      console.error("❌ Tilda form validation failed:", validation.errors);
      res.status(400).json({ 
        error: "Invalid form data",
        errors: validation.errors 
      });
      return;
    }

    // Логирование (для отладки)
    tildaService.logFormSubmission(formData);

    // Обработка данных формы в зависимости от типа формы
    await processFormSubmission(formData);

    // Тильда ожидает ответ в течение 5 секунд
    // Возвращаем успешный ответ
    res.status(200).json({ 
      success: true,
      message: "Form data received and processed",
      formId: formData.formId 
    });
  } catch (err) {
    const { message } = err as { message: string };
    console.error("❌ Tilda webhook error:", message);
    
    // Всегда возвращаем 200, чтобы Тильда не повторяла запрос
    // Но логируем ошибку для отладки
    res.status(200).json({ 
      success: false,
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? message : undefined
    });
  }
};

/**
 * Обработка данных формы в зависимости от типа
 */
async function processFormSubmission(data: {
  formId: string;
  formName: string;
  fields: Record<string, any>;
  pageUrl: string;
}): Promise<void> {
  // Определяем тип формы по formId или formName
  const formId = data.formId.toLowerCase();
  const formName = data.formName.toLowerCase();

  // Пример: Обработка регистрации пользователя
  if (formId.includes("register") || formName.includes("регистрация")) {
    await handleRegistrationForm(data);
    return;
  }

  // Пример: Обработка заявки на задание
  if (formId.includes("application") || formName.includes("заявка")) {
    await handleApplicationForm(data);
    return;
  }

  // Пример: Обработка обратной связи
  if (formId.includes("contact") || formName.includes("контакт")) {
    await handleContactForm(data);
    return;
  }

  // По умолчанию просто логируем
  console.log("📋 Unhandled form type, logging data:", data);
}

/**
 * Обработка формы регистрации
 */
async function handleRegistrationForm(data: {
  formId: string;
  fields: Record<string, any>;
}): Promise<void> {
  const { fields } = data;

  // Извлекаем данные пользователя
  const email = fields.email || fields.mail || fields["e-mail"];
  const phone = fields.phone || fields.tel || fields.telephone;
  const name = fields.name || fields.username || fields.fio;
  const telegramId = fields.telegram || fields.telegram_id || fields.tg;

  if (!email && !phone && !telegramId) {
    console.warn("⚠️ Registration form: No contact information provided");
    return;
  }

  // Здесь можно создать профиль или обновить существующий
  // Например, если есть telegram_id, обновляем профиль
  if (telegramId) {
    const profile = await ProfileModel.findOne({ telegram_id: telegramId });
    if (profile) {
      // Обновляем имя если его нет или если передан новый
      if (name && (!profile.name || profile.name !== name)) {
        profile.name = name;
        await profile.save();
      }
      console.log(`✅ Profile updated from Tilda form: ${telegramId}`);
    }
  }

  console.log("📝 Registration form processed:", { email, phone, name, telegramId });
}

/**
 * Обработка формы заявки
 */
async function handleApplicationForm(data: {
  formId: string;
  fields: Record<string, any>;
}): Promise<void> {
  const { fields } = data;
  
  // Здесь можно обработать заявку на задание
  console.log("📝 Application form processed:", fields);
}

/**
 * Обработка формы обратной связи
 */
async function handleContactForm(data: {
  formId: string;
  fields: Record<string, any>;
}): Promise<void> {
  const { fields } = data;
  
  // Здесь можно отправить уведомление или сохранить в БД
  console.log("📝 Contact form processed:", fields);
}

/**
 * Health check для вебхука Тильды
 */
export const tildaWebhookHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(200).json({ 
    status: "ok",
    service: "tilda-webhook",
    timestamp: new Date().toISOString()
  });
};

