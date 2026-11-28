/* ============================================================
   AppTray Labs — central Telegram / Google auth shared helpers
   Server-side ONLY (Vercel serverless). Secrets never reach the
   browser: TELEGRAM_BOT_TOKEN + TELEGRAM_WEBHOOK_SECRET live in
   env and are used only by /api/* functions.

   This is the same shared Firebase RTDB instance and key layout
   used by Music and Calculator, so an OTP issued here can be
   verified by any AppTray project.
   ============================================================ */
import crypto from "node:crypto";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";
/* JWT signing key derived from the bot token — no extra secret needed */
const JWT_SECRET = crypto.createHmac("sha256", BOT_TOKEN || "ss-unconfigured").update("ss-tg-session-v47").digest();

export const OTP_TTL_MS = 5 * 60 * 1000;      /* 6-digit code expires in 5 minutes */
export const STORE_TTL_S = 10 * 60;           /* server record outlives code a little */
export const MAX_ATTEMPTS = 5;                /* brute-force guard per code */
export const SESSION_TTL_S = 7 * 24 * 3600;   /* authenticated session: 7 days */

/* ---------------- session store (KV REST → Firebase RTDB fallback) ---------------- */
const KV_REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

const FIREBASE_DB_URL = String(process.env.FIREBASE_DATABASE_URL || "https://dhunsutra-default-rtdb.asia-southeast1.firebasedatabase.app").replace(/\/$/, "");
const FIREBASE_DB_SECRET = String(process.env.FIREBASE_DATABASE_SECRET || process.env.FIREBASE_DB_SECRET || process.env.FIREBASE_SECRET || "");

function firebaseRecordKey(key) {
  /* Hex key avoids Firebase path separator (`/`) and special-character issues. */
  return Buffer.from(String(key), "utf8").toString("hex");
}

function firebaseUrl(key) {
  const url = new URL(FIREBASE_DB_URL + "/softsutra/telegram_auth/" + firebaseRecordKey(key) + ".json");
  if (FIREBASE_DB_SECRET) url.searchParams.set("auth", FIREBASE_DB_SECRET);
  return url.toString();
}

async function firebasePut(key, val, ttlS) {
  try {
    const r = await fetch(firebaseUrl(key), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: val, expiresAt: Date.now() + (ttlS * 1000) })
    });
    return r.ok;
  } catch (e) { return false; }
}

async function firebaseGet(key) {
  try {
    const r = await fetch(firebaseUrl(key), { method: "GET", cache: "no-store" });
    if (!r.ok) return null;
    const record = await r.json();
    if (!record || typeof record !== "object") return null;
    if (typeof record.expiresAt === "number" && record.expiresAt <= Date.now()) {
      await firebaseDel(key);
      return null;
    }
    return record.value === undefined ? null : record.value;
  } catch (e) { return null; }
}

async function firebaseDel(key) {
  try {
    await fetch(firebaseUrl(key), { method: "DELETE" });
  } catch (e) {}
  return true;
}

export const store = {
  /* Shared store is configured when either KV REST or Firebase RTDB is available. */
  isShared: Boolean(KV_REST_URL || FIREBASE_DB_URL),
  async put(key, val, ttlS) {
    if (KV_REST_URL) {
      try {
        const r = await fetch(`${KV_REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}?EX=${ttlS}`, { headers: { Authorization: `Bearer ${KV_REST_TOKEN}` } });
        return r.ok;
      } catch (e) { /* fall through to Firebase */ }
    }
    if (FIREBASE_DB_URL) return firebasePut(key, val, ttlS);
    return false;
  },
  async get(key) {
    if (KV_REST_URL) {
      try {
        const r = await fetch(`${KV_REST_URL}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${KV_REST_TOKEN}` } });
        const j = await r.json();
        if (j && j.result !== undefined) return j.result;
      } catch (e) { /* fall through to Firebase */ }
    }
    if (FIREBASE_DB_URL) return firebaseGet(key);
    return null;
  },
  async del(key) {
    if (KV_REST_URL) {
      try { await fetch(`${KV_REST_URL}/del/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${KV_REST_TOKEN}` } }); } catch (e) {}
    }
    if (FIREBASE_DB_URL) return firebaseDel(key);
    return true;
  }
};

/* ---------------- Telegram Bot API ---------------- */
let botCache = { u: "", t: 0, id: 0 };
export async function getBotInfo() {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not configured");
  if (botCache.u && Date.now() - botCache.t < 3600 * 1000) return botCache;
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const j = await r.json();
  if (!j || !j.ok || !j.result || !j.result.username) throw new Error("Telegram getMe failed");
  botCache = { u: j.result.username, id: j.result.id, t: Date.now() };
  return botCache;
}

export async function sendMessage(chatId, text) {
  if (!BOT_TOKEN) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: { keyboard: [[{ text: "📱 Share mobile number", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } })
    });
    const j = await r.json();
    return Boolean(j && j.ok);
  } catch (e) { return false; }
}

/* ---------------- OTP ---------------- */
export function genOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}
/* HMAC-bound hash: knowing the stored hash alone is useless without the bot token */
export function hashOtp(sessionId, code) {
  const key = crypto.createHash("sha256").update("ss-otp:" + (BOT_TOKEN || "ss-unconfigured")).digest();
  return crypto.createHmac("sha256", key).update(String(sessionId) + ":" + String(code)).digest("hex");
}

/* ---------------- webhook secret (Telegram setWebhook secret_token) ---------------- */
export function checkWebhookSecret(req) {
  if (!WEBHOOK_SECRET) return true; /* not configured → don't lock the bot out */
  const got = String(req.headers["x-telegram-bot-api-secret-token"] || "");
  if (got.length !== WEBHOOK_SECRET.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(WEBHOOK_SECRET)); }
  catch (e) { return false; }
}

/* ---------------- HS256 session JWT ---------------- */
const b64u = (buf) => Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
export function signSession(payload, ttlS) {
  const now = Math.floor(Date.now() / 1000);
  const data = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" })) + "." +
    b64u(JSON.stringify(Object.assign({}, payload, { iat: now, exp: now + (ttlS || SESSION_TTL_S) })));
  return data + "." + b64u(crypto.createHmac("sha256", JWT_SECRET).update(data).digest());
}
export function verifySession(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;
    const expect = b64u(crypto.createHmac("sha256", JWT_SECRET).update(parts[0] + "." + parts[1]).digest());
    if (parts[2].length !== expect.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expect))) return null;
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) { return null; }
}

/* ---------------- misc ---------------- */
export function json(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}
export function ipOf(req) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "local";
}
/* light per-IP limiter (per instance; KV-backed deployments are rate-limited upstream too) */
const buckets = new Map();
export function rateLimit(ip, max, windowMs) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.start > windowMs) { buckets.set(ip, { start: now, n: 1 }); return true; }
  b.n++;
  return b.n <= max;
}
