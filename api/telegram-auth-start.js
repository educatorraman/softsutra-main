/* ============================================================
   POST /api/telegram-auth-start — begins a central AppTray OTP login.
   Returns @AppTrayBot, a fresh sessionId, and the t.me deep link.
   The token is prefixed with apptray_ so the central webhook can
   identify the source while still sharing one browser session ID.
   ============================================================ */
import crypto from "node:crypto";
import { getBotInfo, store, json, ipOf, rateLimit, STORE_TTL_S, OTP_TTL_MS } from "./_tg.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "POST only" });
  if (!process.env.TELEGRAM_BOT_TOKEN) return json(res, 503, { ok: false, error: "Telegram login is not configured" });
  if (!store.isShared) return json(res, 503, { ok: false, error: "Telegram login storage is not configured" });
  if (!rateLimit("start:" + ipOf(req), 12, 10 * 60 * 1000)) return json(res, 429, { ok: false, error: "Too many attempts — try again later" });
  try {
    const bot = await getBotInfo();
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const phone = String(body.phoneNumber || "").replace(/[^\d+]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return json(res, 400, { ok: false, error: "Enter a valid mobile number with country code" });
    /* 24 bytes random = 48 hex chars, unguessable, carries no PII */
    const sessionId = crypto.randomBytes(24).toString("hex");
    const saved = await store.put("tg_start:" + sessionId, String(Date.now()), STORE_TTL_S);
    const savedPhone = await store.put("tg_phone_session:" + sessionId, JSON.stringify({ phoneNumber: phone, expiresAt: Date.now() + OTP_TTL_MS }), STORE_TTL_S);
    if (!saved || !savedPhone) return json(res, 503, { ok: false, error: "Telegram login storage is temporarily unavailable" });
    const botUsername = String(process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "").trim() || bot.u || "AppTrayBot";
    return json(res, 200, {
      ok: true,
      botUsername,
      sessionId,
      deepLink: `https://t.me/${botUsername}?start=apptray_${sessionId}`,
      expiresIn: OTP_TTL_MS
    });
  } catch (e) {
    return json(res, 502, { ok: false, error: "Telegram is unreachable — try again shortly" });
  }
}
