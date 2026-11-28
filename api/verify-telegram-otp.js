/* ============================================================
   POST /api/verify-telegram-otp — completes the central OTP login
   { sessionId, code } → validates the 6-digit code (5-minute
   expiry, max 5 attempts, single use), then mints a signed
   7-day session token for the browser.
   ============================================================ */
import { store, hashOtp, signSession, json, MAX_ATTEMPTS, STORE_TTL_S, SESSION_TTL_S } from "./_tg.js";

function extractBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "POST only" });
  try {
    const body = extractBody(req);
    const sessionId = String(body.sessionId || "");
    const code = String(body.code || "").trim();
    if (!/^[a-f0-9]{40,64}$/i.test(sessionId) || !/^\d{6}$/.test(code)) {
      return json(res, 400, { ok: false, error: "Enter the 6-digit code from Telegram" });
    }
    const key = "tg_otp:" + sessionId;
    const raw = await store.get(key);
    if (!raw) return json(res, 410, { ok: false, error: "Code expired — tap Resend and check Telegram", expired: true });
    let rec;
    try { rec = JSON.parse(raw); } catch (e) { return json(res, 410, { ok: false, error: "Session lost — tap Resend", expired: true }); }
    if (Date.now() > (rec.otpExp || 0)) {
      await store.del(key);
      return json(res, 410, { ok: false, error: "Code expired (5 min) — tap Resend", expired: true });
    }
    if ((rec.attempts || 0) >= MAX_ATTEMPTS) {
      await store.del(key);
      return json(res, 429, { ok: false, error: "Too many wrong attempts — request a new code", attempts: true });
    }
    if (hashOtp(sessionId, code) !== rec.otpHash) {
      rec.attempts = (rec.attempts || 0) + 1;
      await store.put(key, JSON.stringify(rec), STORE_TTL_S);
      const left = MAX_ATTEMPTS - rec.attempts;
      return json(res, 401, { ok: false, error: `Wrong code — ${left} attempt${left === 1 ? "" : "s"} left`, attemptsLeft: left });
    }
    await store.del(key); /* single use — invalidate */
    const token = signSession({
      uid: "tg_" + rec.chatId,
      chatId: rec.chatId,
      phoneNumber: rec.phoneNumber || "",
      firstName: rec.firstName,
      username: rec.username,
      provider: "telegram"
    }, SESSION_TTL_S);
    return json(res, 200, {
      ok: true,
      token,
      user: {
        uid: "tg_" + rec.chatId,
        chatId: rec.chatId,
        phoneNumber: rec.phoneNumber || "",
        firstName: rec.firstName,
        username: rec.username,
        provider: "telegram"
      }
    });
  } catch (e) {
    return json(res, 500, { ok: false, error: "Verification failed — try again" });
  }
}
