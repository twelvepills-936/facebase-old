import express, { Application } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { initTelegramBot, stopTelegramBot } from "./telegramBot/index.js";
import { connectDB } from "@config/db.js";
import { admin, authenticate } from "./admin/admin.config.js";
import AdminJSExpress from "@adminjs/express";
import swaggerSpec from "./config/swagger.js";
import { initializeSocketIO } from "./services/socketService.js";

import profileRoutes from "@routes/profileRoutes.js";
import projectRoutes from "@routes/projectRoutes.js";
import proposalRoutes from "@routes/proposalRoutes.js";
import channelRoutes from "@routes/channelRoutes.js";
import generalRoutes from "@routes/generalRoutes.js";
import walletRoutes from "@routes/walletRoutes.js";
import uploadRoutes from "@routes/uploadRoutes.js";
import brandRoutes from "@routes/brandRoutes.js";
import taskRoutes from "@routes/taskRoutes.js";
import adminRoutes from "@routes/adminRoutes.js";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "./middlewares/authMiddleware.js";

dotenv.config();

const app: Application = express();

// Определяем режим работы
const isDevMode = process.env.NODE_ENV !== "production";

// Скрываем информацию о Express из заголовков (безопасность)
app.disable("x-powered-by");

app.set("trust proxy", "loopback");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
});

connectDB();

app.use(express.json());
app.use(express.static("public"));

const corsOrigins = [
  "https://facebase-front.vercel.app",
  "http://localhost:3000",
  "http://localhost:5001",
  "https://facebase.host",
  "https://facebasemain-frontend-8f7c.twc1.net",  // Timeweb frontend
];

const ngrokRegex = /\.ngrok\.app$/;
const timewebRegex = /\.twc1\.net$/;  // Разрешаем все Timeweb домены

app.use((req, res, next) => {
  if (req.path.startsWith("/admin")) {
    next();
  } else {
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          corsOrigins.includes(origin) ||
          ngrokRegex.test(origin) ||
          timewebRegex.test(origin)
        ) {
          callback(null, true);
        } else {
          console.error(`CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })(req, res, next);
  }
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
  })
);

app.use(morgan("dev"));
app.use(limiter);

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate,
  cookiePassword: process.env.ADMIN_COOKIE_SECRET || "some-secret-password",
  cookieName: "adminjs",
});
app.use(admin.options.rootPath, adminRouter);

// Swagger documentation
// JSON spec endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Swagger UI
// @ts-ignore
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Facebase API Documentation",
  swaggerOptions: {
    url: '/api-docs.json'
  }
}));

// Health check endpoints (no auth required)
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Server is running!",
  });
});

app.get("/health", (req, res) => {
  return res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res, next) => {
  // Skip auth for admin panel
  if (req.path.startsWith(admin.options.rootPath)) {
    return next();
  }
  
  // Skip auth for health check endpoints
  if (req.path === "/" || req.path === "/health") {
    return next();
  }
  
  // ⚠️ DEVELOPMENT MODE: ВСЕ API endpoints публичные для разработки
  // В production mode требуется авторизация через Telegram initData
  if (isDevMode && req.path.startsWith('/api/')) {
    console.log(`🔓 Public access (dev mode): ${req.method} ${req.path}`);
    return next();
  }
  
  // PRODUCTION MODE: Для всех API endpoints требуется авторизация
  if (req.path.startsWith('/api/')) {
    authMiddleware(req, res, next);
    return;
  }
  
  // Для всех остальных путей требуется авторизация
  authMiddleware(req, res, next);
});

app.use("/api/profiles", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes); // Admin-only routes

const PORT = process.env.PORT || 5001;

// Создаем HTTP сервер
const httpServer = http.createServer(app);

// Инициализируем Socket.IO для real-time обновлений
initializeSocketIO(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`AdminJS is running on http://localhost:${PORT}/admin`);
  console.log(`API Documentation is running on http://localhost:${PORT}/api-docs`);
  console.log(`🔌 WebSocket is running on ws://localhost:${PORT}`);
  
  // Запускаем Telegram бота
  initTelegramBot();
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  await stopTelegramBot();
  
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
