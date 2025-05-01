# Этап сборки
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./
RUN npm ci

# Копируем остальные файлы проекта
COPY . .

# Устанавливаем переменные окружения для этапа сборки
ENV NEXT_PUBLIC_API_URL=http://84.201.129.122:8000/api
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Запускаем сборку с флагом --no-lint чтобы пропустить проверки
RUN npm run build

# Этап запуска
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Копируем package.json для установки production зависимостей
COPY --from=builder /app/package*.json ./
# Устанавливаем только production зависимости
RUN npm ci --omit=dev

# Копируем необходимые файлы из этапа сборки
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Устанавливаем правильный URL для API в продакшне
ENV NEXT_PUBLIC_API_URL=http://84.201.129.122:8000

# Экспонируем порт 3000
EXPOSE 3000

# Команда запуска приложения
CMD ["npm", "run", "start"]