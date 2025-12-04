# Настройка интеграции с Rocket Work

## Шаг 1: Создание файла .env

Создайте файл `.env` в корне проекта `facebase-back/` на основе примера:

```bash
cp .env.example .env
```

## Шаг 2: Получение API ключей от Rocket Work

1. Зарегистрируйтесь на [https://b2b.rocketwork.ru](https://b2b.rocketwork.ru)
2. Войдите в личный кабинет
3. Перейдите в раздел "Настройки" → "API"
4. Создайте API ключ и скопируйте его

## Шаг 3: Настройка переменных окружения

Откройте файл `.env` и добавьте/обновите следующие переменные:

```env
# Включить интеграцию с Rocket Work
USE_ROCKETWORK=true

# API ключ от Rocket Work (получите в личном кабинете)
ROCKETWORK_API_KEY=ваш_api_ключ_здесь

# URL API (обычно не нужно менять)
ROCKETWORK_API_URL=https://api.rocketwork.ru/v1

# Секретный ключ для webhook (настройте в личном кабинете Rocket Work)
ROCKETWORK_WEBHOOK_SECRET=ваш_webhook_секрет_здесь
```

## Шаг 4: Настройка Webhook в Rocket Work

1. В личном кабинете Rocket Work перейдите в "Настройки" → "Webhooks"
2. Добавьте новый webhook с URL:
   ```
   https://ваш-домен.com/api/rocketwork/webhook
   ```
3. Скопируйте секретный ключ webhook и добавьте его в `.env` как `ROCKETWORK_WEBHOOK_SECRET`

## Шаг 5: Для Docker (опционально)

Если используете Docker, переменные окружения можно также настроить в `docker-compose.yml` или через файл `.env` (Docker автоматически загружает его).

## Проверка работы

После настройки:

1. Перезапустите сервер:
   ```bash
   npm run dev
   # или
   docker-compose up -d
   ```

2. Проверьте логи при создании выплаты - должны появиться сообщения о работе с Rocket Work

3. Проверьте webhook - создайте тестовую выплату и убедитесь, что статусы обновляются

## Отключение интеграции

Чтобы временно отключить интеграцию, установите:
```env
USE_ROCKETWORK=false
```

В этом случае выплаты будут создаваться только локально, без отправки в Rocket Work.

