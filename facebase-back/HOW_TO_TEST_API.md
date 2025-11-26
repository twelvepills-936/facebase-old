# 📖 КАК ПРАВИЛЬНО ТЕСТИРОВАТЬ API

## ❗ ГЛАВНОЕ ПРАВИЛО

**ВСЕГДА используйте ОДИНАКОВЫЙ `userId` во ВСЕХ запросах для одного пользователя!**

---

## ✅ ПРАВИЛЬНО

### Сценарий: Пользователь проходит задачу

```bash
# 1. POST - submit step 1
curl -X POST "http://localhost:5001/api/tasks/6923685486f8def4fe9dc29d/steps/1?userId=123456789" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "email": "john@example.com"}'

# 2. GET - проверить статус задачи
curl "http://localhost:5001/api/tasks/6923685486f8def4fe9dc29d?userId=123456789"

# 3. GET - получить список задач пользователя
curl "http://localhost:5001/api/tasks/user/list?userId=123456789"
```

**userId = `123456789` во ВСЕХ запросах! ✅**

---

## ❌ НЕПРАВИЛЬНО

### Ошибка: Разные userId

```bash
# 1. POST с userId=123456789
curl -X POST "http://localhost:5001/api/tasks/.../steps/1?userId=123456789" ...
# ✅ Ответ: { "_id": "abc123", "profile": "profile1", ... }

# 2. GET с userId=999999999 (ДРУГОЙ!)
curl "http://localhost:5001/api/tasks/...?userId=999999999"
# ❌ Ответ: { "task": {...}, "submission": null }

# ПОЧЕМУ: Это РАЗНЫЕ пользователи!
```

**Результат:** submission = null, потому что пользователь `999999999` не делал этот запрос!

---

### Ошибка: Забыли userId в GET

```bash
# 1. POST с userId=123456789
curl -X POST "http://localhost:5001/api/tasks/.../steps/1?userId=123456789" ...
# ✅ Ответ: submission создан

# 2. GET БЕЗ userId
curl "http://localhost:5001/api/tasks/..."
# ❌ Ответ: { "task": {...}, "submission": null }

# ПОЧЕМУ: Без userId система не знает, чей submission показывать!
```

---

## 🔍 КАК ПРОВЕРИТЬ ЧТО ПРОБЛЕМА В userId

### Шаг 1: Запустите тест

```bash
cd C:\roma\face\old-back\facebase-back
node test-consistency-issue.js
```

**Ожидаемый результат:**
```
✅ POST /steps → submission: ✅ OK
✅ GET /tasks (с userId) → submission: ✅ EXISTS
✅ GET /user/list (с userId) → задач: ✅ 1
```

Если тест показывает ✅ - **код работает правильно!**

---

### Шаг 2: Проверьте ваши запросы

Откройте Postman/Insomnia/curl и убедитесь:

1. **POST запрос:**
   ```
   POST http://localhost:5001/api/tasks/TASK_ID/steps/1?userId=YOUR_USER_ID
   ```
   
2. **GET запрос (тот же userId!):**
   ```
   GET http://localhost:5001/api/tasks/TASK_ID?userId=YOUR_USER_ID
   ```
   
3. **GET user list (тот же userId!):**
   ```
   GET http://localhost:5001/api/tasks/user/list?userId=YOUR_USER_ID
   ```

**`YOUR_USER_ID` должен быть ОДИНАКОВЫМ!**

---

### Шаг 3: Проверьте логи сервера

Откройте терминал где запущен `npm run dev` и найдите:

```
POST запрос:
📝 Submitting step 1 for task ..., user YOUR_USER_ID
✅ Profile found: 69270da799886bee4c60f154

GET запрос:
📖 GET /api/tasks/... - userId: YOUR_USER_ID
✅ Profile found: 69270da799886bee4c60f154
```

**Проверьте:**
- ✅ `user` в POST = `userId` в GET?
- ✅ `Profile found` - одинаковый ID?

Если **Profile ID разные** → вы используете **разные userId**!

---

## 📊 ПРИМЕРЫ ИЗ РЕАЛЬНЫХ ЛОГОВ

### ✅ ПРАВИЛЬНО (Profile ID одинаковый)

```
POST /api/tasks/.../steps/1?userId=test_1764167079695
✅ Profile found: 69270da799886bee4c60f154
✅ Submission created: 69270da799886bee4c60f15f

GET /api/tasks/...?userId=test_1764167079695
✅ Profile found: 69270da799886bee4c60f154
✅ Submission found: 69270da799886bee4c60f15f
```

**Результат:** submission найден! ✅

---

### ❌ НЕПРАВИЛЬНО (Profile ID разные)

```
POST /api/tasks/.../steps/1?userId=user_123
✅ Profile created: 69270da799886bee4c60f154
✅ Submission created: 69270da799886bee4c60f15f

GET /api/tasks/...?userId=user_456
✅ Profile created: 69270da799886bee4c60f999  ← ДРУГОЙ!
📍 DEBUG INFO: Total submissions for userId=user_456: 0
⚠️  Submission NOT found
```

**Результат:** submission = null, потому что это ДРУГОЙ пользователь! ❌

---

## 🎯 CHECKLIST ДЛЯ ОТЛАДКИ

Если у вас `submission = null` после POST:

- [ ] 1. Запустил `node test-consistency-issue.js`?
  - Если тест ✅ - проблема в ваших запросах
  - Если тест ❌ - проблема в коде (но тест показал ✅!)

- [ ] 2. Проверил что `userId` ОДИНАКОВЫЙ во всех запросах?
  - POST: `?userId=___`
  - GET: `?userId=___`
  - User list: `?userId=___`

- [ ] 3. Проверил логи сервера?
  - Найти POST запрос → какой `user`?
  - Найти GET запрос → какой `userId`?
  - Profile ID одинаковый?

- [ ] 4. Использую правильный taskId?
  - `6923685486f8def4fe9dc29d` (из теста)
  - Или создал свой Task в Admin Panel?

---

## 💡 ЧАСТЫЕ ОШИБКИ

### 1. Опечатка в userId

```bash
# POST
curl "...?userId=123456789"  # ✅

# GET
curl "...?userId=12345678"   # ❌ Не хватает одной цифры!
```

---

### 2. userId в разных местах

```bash
# POST - userId в query
curl -X POST "...?userId=123" -d '{...}'  # ✅

# GET - userId в body (НЕПРАВИЛЬНО!)
curl -X GET "..." -d '{"userId": "123"}'  # ❌

# Правильно - userId в query
curl "...?userId=123"  # ✅
```

---

### 3. Пробелы в userId

```bash
# С пробелами
curl "...?userId= 123456789"   # ❌
curl "...?userId=123456789 "   # ❌

# Без пробелов
curl "...?userId=123456789"    # ✅
```

---

## 🚀 БЫСТРЫЙ ТЕСТ

Скопируйте и выполните (замените `YOUR_USER_ID`):

```bash
# Задайте переменные
export BASE_URL="http://localhost:5001"
export TASK_ID="6923685486f8def4fe9dc29d"
export USER_ID="test_$(date +%s)"

echo "Testing with userId: $USER_ID"

# 1. POST
curl -X POST "$BASE_URL/api/tasks/$TASK_ID/steps/1?userId=$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"test@example.com"}' \
  | jq '._id'

# 2. GET
curl "$BASE_URL/api/tasks/$TASK_ID?userId=$USER_ID" \
  | jq '.submission._id'

# 3. User list
curl "$BASE_URL/api/tasks/user/list?userId=$USER_ID" \
  | jq 'length'

echo "If all 3 commands return non-null values - SUCCESS!"
```

---

## 📞 ВСЕ ЕЩЕ НЕ РАБОТАЕТ?

1. **Запустите тест еще раз:**
   ```bash
   node test-consistency-issue.js
   ```

2. **Проверьте логи сервера:**
   - Найдите блок с вашим userId
   - Проверьте Profile ID
   - Есть ли 🚨 WARNING?

3. **Покажите мне:**
   - Ваш POST запрос (curl/Postman)
   - Ваш GET запрос (curl/Postman)
   - Логи сервера для этих запросов

---

## ✅ ИТОГ

### Проблема НЕ в коде (тест прошел ✅)

### Проблема в том, КАК вы делаете запросы:

1. ❌ Разные userId в POST и GET
2. ❌ Забыли userId в GET
3. ❌ Опечатка в userId
4. ❌ userId в неправильном месте (body вместо query)

### Решение:

**ВСЕГДА используйте ОДИНАКОВЫЙ userId во ВСЕХ запросах!**

```bash
# Один пользователь = один userId ВЕЗДЕ
POST ...?userId=123456789
GET  ...?userId=123456789
LIST ...?userId=123456789
```

**Это КРИТИЧЕСКИ ВАЖНО!** 🎯

