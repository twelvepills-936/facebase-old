# Backend Dockerfile для Timeweb
# Репозиторий old-back - это корень, код в папке facebase-back

FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package files
COPY facebase-back/package.json facebase-back/yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем исходники
COPY facebase-back/src ./src
COPY facebase-back/tsconfig.json ./
COPY facebase-back/public ./public

# Собираем приложение
RUN yarn build

# Production стадия
FROM node:20-alpine

WORKDIR /app

# Копируем package files
COPY facebase-back/package.json facebase-back/yarn.lock ./

# Устанавливаем только production зависимости
RUN yarn install --production

# Копируем собранное приложение и публичные файлы
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose порт
EXPOSE 5001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["node", "dist/index.js"]

