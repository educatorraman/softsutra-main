/* ============================================================
   POST /api/telegram-webhook — central AppTray Labs bot handler
   • verified via the setWebhook secret_token header
   • /start                    → welcome message
   • /start <token>            → OTP for the browser session
   • /start apptray_<token>    → same, root portal prefix
   • /start music_<token>      → same, Music prefix
   • /start calc_<token>       → same, Calculator prefix
   • Always answers 200 so Telegram never retry-storms
   OTP records use the same shared Firebase RTDB layout as Music.
   ============================================================ */
import { store, checkWebhookSecret, genOtp, hashOtp, sendMessage, json, OTP_TTL_MS, STORE_TTL_S } from "./_tg.js";

function extractBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

/** Returns null for non-/start, "" for plain /start, or a normalized token. */
function startToken(text) {
  const parts = String(text || "").trim().split(/\s+/);
  if (parts[0] !== "/start") return null;
  const raw = parts[1] || "";
  if (!raw) return "";
  const prefixed = raw.match(/^(?:apptray|music|calc)_([a-f0-9]{40,64})$/i);
  if (prefixed) return prefixed[1];
  return /^[a-f0-9]{40,64}$/i.test(raw) ? raw : "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "POST only" });
  if (!checkWebhookSecret(req)) return json(res, 401, { ok: false, error: "bad secret token" });
  try {
    const update = extractBody(req);
    const msg = update.message || update.edited_message;
    const chatId = msg && msg.chat && msg.chat.id;
    const text = String((msg && msg.text) || "").trim();
    if (!chatId || !chatId.toString().match(/^\d+$/)) {
      return json(res, 200, { ok: true }); /* photos, stickers, other commands → ignored */
    }
    /* A first-time user may tap request_contact after opening the deep link.
       Persist that verified Telegram phone mapping without creating another
       OTP or invalidating the active one. */
    if (msg.contact && msg.contact.phone_number) {
      const phone = String(msg.contact.phone_number).replace(/[^\d+]/g, "");
      await store.put("tg_phone:" + phone, JSON.stringify({ chatId: chatId.toString(), phoneNumber: phone, updatedAt: Date.now() }), STORE_TTL_S * 30);
      return json(res, 200, { ok: true });
    }
    const sid = startToken(text);
    if (sid === null) return json(res, 200, { ok: true });
    if (!sid) {
      await sendMessage(chatId, "👋 <b>Welcome to AppTray Labs!</b>\n\nOpen the login link from the AppTray portal, Music or Calculator and press <b>Start</b> to receive your 6-digit OTP.\n\n@apptray.in");
      return json(res, 200, { ok: true });
    }
    const from = msg.from || {};
    const contactPhone = String((msg.contact && msg.contact.phone_number) || "").replace(/[^\d+]/g, "");
    const issuedAt = await store.get("tg_start:" + sid);
    if (!issuedAt && store.isShared) {
      await sendMessage(chatId, "⌛ This login link has expired or is unknown. Go back to the AppTray app and tap <b>Send Telegram OTP</b> again.");
      return json(res, 200, { ok: true });
    }
    let phoneNumber = contactPhone;
    try { const p = JSON.parse((await store.get("tg_phone_session:" + sid)) || "{}"); if (!phoneNumber) phoneNumber = p.phoneNumber || ""; } catch (e) {}
    /* issue the code: stored HASHED, keyed by the browser's sessionId */
    const code = genOtp();
    const rec = {
      chatId: chatId.toString(),
      phoneNumber,
      firstName: String(from.first_name || "").slice(0, 64),
      username: String(from.username || "").slice(0, 64),
      otpHash: hashOtp(sid, code),
      otpExp: Date.now() + OTP_TTL_MS,
      issued: Date.now(),
      attempts: 0
    };
    await store.put("tg_otp:" + sid, JSON.stringify(rec), STORE_TTL_S);
    if (phoneNumber) await store.put("tg_phone:" + phoneNumber, JSON.stringify({ chatId: chatId.toString(), phoneNumber, updatedAt: Date.now() }), STORE_TTL_S * 30);
    await store.put("tg_chat:" + chatId.toString(), JSON.stringify({ phoneNumber, username: from.username || "", updatedAt: Date.now() }), STORE_TTL_S * 30);
    await sendMessage(chatId,
      "🔐 <b>AppTray Labs</b> — verification code\n\n" +
      `<code>${code}</code>\n\n` +
      "Enter this code on the website to finish signing in.\n" +
      "⏱ Expires in 5 minutes · never share it with anyone.\n\n" +
      "@apptray.in #" + code
    );
    return json(res, 200, { ok: true });
  } catch (e) {
    return json(res, 200, { ok: true }); /* swallow — Telegram retries on 5xx */
  }
}
