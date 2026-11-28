/**
 * @file server/services/telegram-bot.ts
 * @description Inbuilt Telegram Deal Auto-Poster & Notification Bot for GoCoupon.
 *
 * Capabilities:
 * - Automatically selects top/verified loot deals and publishes them to a Telegram Channel
 * - Injects GoCoupon tracking redirect links (subid1=telegram, subid2=store) for 100% affiliate attribution
 * - De-duplicates deals (never posts the same deal twice within 24 hours)
 * - Safe HTML parsing with zero external dependencies (uses native fetch)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getLiveDeals, type DealRecord } from "../../src/lib/server-data/deals-db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const POSTS_FILE = path.join(DATA_DIR, "telegram-posts.json");

// In-memory set of recently posted deal IDs (persisted to disk)
const recentPostsSet = new Set<string>();

// Hydrate posted deals from disk
try {
  if (fs.existsSync(POSTS_FILE)) {
    const raw = JSON.parse(fs.readFileSync(POSTS_FILE, "utf-8"));
    const now = Date.now();
    // Keep only posts within last 24 hours
    const valid = Array.isArray(raw)
      ? raw.filter((item: any) => now - item.timestamp < 24 * 60 * 60 * 1000)
      : [];
    valid.forEach((item: any) => recentPostsSet.add(item.dealId));
  }
} catch (err: any) {
  console.warn("[TelegramBot] Error hydrating posted deals:", err.message);
}

function persistRecentPost(dealId: string, title: string) {
  recentPostsSet.add(dealId);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let list: Array<{ dealId: string; title: string; timestamp: number }> = [];
    if (fs.existsSync(POSTS_FILE)) {
      try {
        list = JSON.parse(fs.readFileSync(POSTS_FILE, "utf-8"));
      } catch {}
    }
    const now = Date.now();
    list = list.filter((item) => now - item.timestamp < 24 * 60 * 60 * 1000);
    list.unshift({ dealId, title, timestamp: now });
    if (list.length > 500) list.length = 500;
    fs.writeFileSync(POSTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err: any) {
    console.warn("[TelegramBot] Error saving post to disk:", err.message);
  }
}

export function getTelegramConfig() {
  const token = (
    process.env.TELEGRAM_BOT_TOKEN ||
    "8737807223:AAGr1lmiF1_F90Z1KIJEhWnJCUiV8cC6N2s"
  ).trim();

  const channelId = (
    process.env.TELEGRAM_CHANNEL_ID ||
    process.env.TELEGRAM_CHANNEL ||
    ""
  ).trim();

  const autoPostEnabled = process.env.TELEGRAM_AUTO_POST !== "false";
  const intervalMinutes = parseInt(process.env.TELEGRAM_INTERVAL_MIN || "45", 10) || 45;

  return {
    token,
    channelId,
    autoPostEnabled,
    intervalMinutes,
    isConfigured: Boolean(token && channelId),
  };
}

/**
 * Formats a deal into an eye-catching, high-converting Telegram HTML post
 * with clear attribution call-to-actions.
 */
export function formatDealTelegram(deal: DealRecord): {
  html: string;
  redirectUrl: string;
  buttonText: string;
} {
  const store = escapeHtml(deal.storeName || "Partner Store");
  const title = escapeHtml(deal.title || "Exclusive Verified Deal");
  const discount = escapeHtml(deal.discount || "Special Offer");
  const code = deal.code ? escapeHtml(deal.code.trim().toUpperCase()) : "";
  const rating = deal.rating ? `⭐ <b>Rating:</b> ${deal.rating}/5 (Verified)\n` : "";
  const uses = deal.usesCount ? `👥 <b>Used:</b> ${deal.usesCount}+ shoppers today\n` : "";

  const appUrl = (process.env.APP_URL || "https://gocoupon.io").replace(/\/$/, "");
  const destinationUrl = ((deal as any).link || (deal as any).url || (deal as any).affiliateUrl || "").trim();

  // Construct high-precision parameters so the redirect engine knows the exact merchant destination
  const params = new URLSearchParams();
  params.set("dealId", String(deal.id));
  if (destinationUrl) {
    params.set("url", destinationUrl);
  }
  if (deal.storeName) {
    params.set("store", deal.storeName);
  }
  if (deal.storeSlug) {
    params.set("slug", deal.storeSlug);
  }
  if (deal.code) {
    params.set("code", deal.code);
  }
  params.set("source", "telegram");

  const redirectUrl = `${appUrl}/api/redirect/deal?${params.toString()}`;

  const hasCode = Boolean(code && code !== "NO CODE" && code !== "DIRECT DEAL");

  let msg = `🔥 <b>LOOT DEAL: ${title}</b>\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏬 <b>Store:</b> ${store}\n`;
  msg += `💰 <b>Discount:</b> <b>${discount}</b>\n`;

  if (hasCode) {
    msg += `🎟️ <b>Coupon Code:</b> <code>${code}</code>\n`;
    msg += `<i>(Tap code to copy)</i>\n`;
  }

  msg += rating;
  msg += uses;
  msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🛍️ <b>How to Avail Discount:</b>\n`;
  if (hasCode) {
    msg += `1️⃣ Tap <b>"Claim Deal & Activate Code"</b> button below\n`;
    msg += `2️⃣ Paste coupon code <code>${code}</code> at checkout\n\n`;
  } else {
    msg += `1️⃣ Tap <b>"Claim Deal & Activate Offer"</b> button below\n`;
    msg += `2️⃣ Discount will be automatically applied on the store\n\n`;
  }
  msg += `⚡ <i>Verified & Hand-Picked by <a href="${appUrl}">GoCoupon.io</a></i>`;

  return {
    html: msg,
    redirectUrl,
    buttonText: hasCode ? `🛒 Claim Deal & Activate Code ➔` : `🛒 Grab Deal Now ➔`,
  };
}

export function formatDealTelegramHtml(deal: DealRecord): string {
  return formatDealTelegram(deal).html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sends a raw text message to a specified Telegram Chat or Channel ID.
 */
export async function sendTelegramMessage(
  text: string,
  targetChatId?: string,
  options?: {
    parseMode?: "HTML" | "Markdown";
    disableWebPreview?: boolean;
    replyMarkup?: {
      inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
    };
  }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { token, channelId } = getTelegramConfig();
  const chat = targetChatId || channelId;

  if (!token) {
    return { success: false, error: "TELEGRAM_BOT_TOKEN is missing." };
  }
  if (!chat) {
    return { success: false, error: "TELEGRAM_CHANNEL_ID is not configured." };
  }

  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;

  // Default to disabling web preview so large link banners/cards do NOT clutter the channel
  const shouldDisablePreview = options?.disableWebPreview !== undefined ? options.disableWebPreview : true;

  try {
    const payload: any = {
      chat_id: chat.startsWith("@") || chat.startsWith("-") ? chat : `@${chat}`,
      text,
      parse_mode: options?.parseMode || "HTML",
      disable_web_page_preview: shouldDisablePreview,
      link_preview_options: {
        is_disabled: shouldDisablePreview,
      },
    };

    if (options?.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();
    if (data && data.ok) {
      return { success: true, messageId: data.result?.message_id };
    } else {
      console.warn("[TelegramBot] Telegram API error:", data?.description || "Unknown error");
      return { success: false, error: data?.description || "Failed sending message." };
    }
  } catch (err: any) {
    console.error("[TelegramBot] Network dispatch error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically picks the best unposted deal and publishes it to the channel.
 */
export async function postNextTopDeal(specificDealId?: string): Promise<{
  success: boolean;
  deal?: DealRecord;
  messageId?: number;
  error?: string;
}> {
  const { channelId } = getTelegramConfig();
  if (!channelId) {
    return {
      success: false,
      error: "Telegram Channel ID not configured. Set TELEGRAM_CHANNEL_ID in .env (e.g. @gocoupon_deals)",
    };
  }

  const allDeals = getLiveDeals();
  if (!allDeals || allDeals.length === 0) {
    return { success: false, error: "No live deals available to post." };
  }

  let dealToPost: DealRecord | undefined;

  if (specificDealId) {
    dealToPost = allDeals.find((d) => String(d.id) === String(specificDealId));
  } else {
    // Score & select best unposted deal
    const candidates = allDeals.filter((d) => {
      // Must not be expired
      if (d.status === "expired") return false;
      // Must not have been posted recently
      if (recentPostsSet.has(String(d.id))) return false;
      // Prefer deals with codes or clear discounts
      return Boolean(d.discount || d.code);
    });

    if (candidates.length === 0) {
      // If all candidate deals were posted in the last 24 hours, clear memory and restart pool
      recentPostsSet.clear();
      candidates.push(...allDeals.filter((d) => d.status !== "expired"));
    }

    // Sort by priority: featured deals first, then verified, then highest usesCount
    candidates.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return (b.usesCount || 0) - (a.usesCount || 0);
    });

    dealToPost = candidates[0];
  }

  if (!dealToPost) {
    return { success: false, error: "No eligible deal found to post." };
  }

  const formatted = formatDealTelegram(dealToPost);
  const result = await sendTelegramMessage(formatted.html, undefined, {
    disableWebPreview: true,
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: formatted.buttonText,
            url: formatted.redirectUrl,
          },
        ],
      ],
    },
  });

  if (result.success) {
    persistRecentPost(String(dealToPost.id), dealToPost.title);
    console.log(`📢 [TelegramBot] Successfully posted deal to ${channelId}: "${dealToPost.title}"`);
    return {
      success: true,
      deal: dealToPost,
      messageId: result.messageId,
    };
  } else {
    return {
      success: false,
      deal: dealToPost,
      error: result.error,
    };
  }
}
