/**
 * @file server/routes/telegram.ts
 * @description API router for managing Telegram Deal Auto-Poster Bot.
 */

import { Router, type Request, type Response } from "express";
import {
  getTelegramConfig,
  postNextTopDeal,
  sendTelegramMessage,
} from "../services/telegram-bot.js";

export const telegramRouter = Router();

/**
 * GET /api/telegram/status
 * Returns current configuration, bot credentials, and operational state.
 */
telegramRouter.get("/status", async (_req: Request, res: Response) => {
  const config = getTelegramConfig();

  let botInfo: any = null;
  let isTokenValid = false;

  try {
    const apiRes = await fetch(`https://api.telegram.org/bot${config.token}/getMe`);
    const data: any = await apiRes.json();
    if (data && data.ok) {
      isTokenValid = true;
      botInfo = data.result;
    }
  } catch (err: any) {
    botInfo = { error: err.message };
  }

  res.json({
    enabled: config.autoPostEnabled,
    channelConfigured: Boolean(config.channelId),
    channelId: config.channelId || null,
    intervalMinutes: config.intervalMinutes,
    botValid: isTokenValid,
    botUsername: botInfo?.username || null,
    botName: botInfo?.first_name || null,
  });
});

/**
 * POST /api/telegram/test
 * Sends a quick connection test message to the configured channel.
 */
telegramRouter.post("/test", async (req: Request, res: Response) => {
  const channel = (req.body?.channelId || getTelegramConfig().channelId || "").trim();

  if (!channel) {
    res.status(400).json({
      success: false,
      error: "Channel ID required. Provide { channelId: '@your_channel' } in body or set TELEGRAM_CHANNEL_ID in .env",
    });
    return;
  }

  const testMessage = `🚀 <b>GoCoupon Bot Connection Test</b>\n\n✅ <b>@Gocouponsupportbot</b> is successfully connected and authorized to post automated deals to this channel!\n\n🌐 <i>Website: <a href="https://gocoupon.io">GoCoupon.io</a></i>`;

  const result = await sendTelegramMessage(testMessage, channel, {
    disableWebPreview: true,
    replyMarkup: {
      inline_keyboard: [
        [{ text: "🌐 Visit GoCoupon.io ➔", url: "https://gocoupon.io" }],
      ],
    },
  });
  if (result.success) {
    res.json({
      success: true,
      message: `Test message delivered successfully to ${channel}!`,
      messageId: result.messageId,
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error || "Failed delivering test message to channel. Ensure bot is an Admin in the channel.",
    });
  }
});

/**
 * POST /api/telegram/post
 * Triggers an immediate post of the next top deal or a specific deal.
 */
telegramRouter.post("/post", async (req: Request, res: Response) => {
  const dealId = req.body?.dealId;
  const result = await postNextTopDeal(dealId);

  if (result.success) {
    res.json({
      success: true,
      deal: {
        id: result.deal?.id,
        title: result.deal?.title,
        store: result.deal?.storeName,
        discount: result.deal?.discount,
      },
      messageId: result.messageId,
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error,
    });
  }
});
