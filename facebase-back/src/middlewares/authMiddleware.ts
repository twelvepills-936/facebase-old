import nacl from "tweetnacl";
import { Buffer } from "buffer";
import { Request, Response, NextFunction } from "express";

const TELEGRAM_PUBLIC_KEY = Buffer.from(
  process.env.TELEGRAM_PUBLIC_KEY ||
    "e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d",
  "hex"
);

const verifyTelegramSignature = (
  dataCheckString: string,
  signature: string
): boolean => {
  // Декодируем подпись из base64
  const signatureBuffer = Buffer.from(signature, "base64");

  // Проверяем подпись с помощью публичного ключа Telegram
  return nacl.sign.detached.verify(
    Buffer.from(dataCheckString),
    signatureBuffer,
    TELEGRAM_PUBLIC_KEY
  );
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ Auth failed: No authorization header");
    return res
      .status(401)
      .json({ error: "Authorization header missing or invalid" });
  }

  const initDataRaw = authHeader.split(" ")[1];

  if (initDataRaw === process.env.ADMIN_TOKEN) {
    console.log("✅ ADMIN AUTH TOKEN");
    return next();
  }

  try {
    const data = Object.fromEntries(new URLSearchParams(atob(initDataRaw)));

    const { signature, hash, ...fields } = data;
    if (!signature) {
      console.error("❌ Auth failed: Missing signature");
      return res.status(403).json({ error: "Missing signature" });
    }

    const botId = process.env.TELEGRAM_BOT_ID;
    console.log(`🔍 Checking auth with BOT_ID: ${botId}`);

    const dataCheckString =
      `${botId}:WebAppData\n` + // bot_id + "WebAppData"
      Object.keys(fields)
        .sort()
        .map((key) => `${key}=${fields[key]}`)
        .join("\n");

    if (!verifyTelegramSignature(dataCheckString, signature)) {
      console.error(`❌ Auth failed: Invalid Telegram signature for BOT_ID: ${botId}`);
      console.error(`Fields received:`, Object.keys(fields));
      return res.status(403).json({ 
        error: "Invalid Telegram signature",
        hint: "Check TELEGRAM_BOT_ID in environment variables"
      });
    }

    const now = Date.now();
    const authDate = parseInt(data.auth_date) * 1000;
    const MAX_AUTH_AGE = 250 * 60 * 1000;

    if (now - authDate > MAX_AUTH_AGE) {
      console.error("❌ Auth failed: Telegram data is outdated");
      return res.status(403).json({ error: "Telegram data is outdated" });
    }

    (req as any).user = { ...fields, ...JSON.parse(fields.user) };
    console.log("✅ Auth successful for user:", (req as any).user.id);
    next();
  } catch (error) {
    console.error("❌ Auth failed with error:", error);
    return res.status(403).json({ 
      error: "Authentication failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
