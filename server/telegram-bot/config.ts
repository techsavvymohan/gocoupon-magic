/**
 * @file server/telegram-bot/config.ts
 * @description Central configuration for GoCoupon Telegram Deal Broadcaster Bot.
 */

export interface TelegramBotConfig {
  token: string;
  channelId: string;
  autoPostEnabled: boolean;
  intervalMinutes: number;
  isConfigured: boolean;
}

export function getTelegramConfig(): TelegramBotConfig {
  const token = (
    process.env.TELEGRAM_BOT_TOKEN ||
    "8737807223:AAGr1lmiF1_F90Z1KIJEhWnJCUiV8cC6N2s"
  ).trim();

  const channelId = (
    process.env.TELEGRAM_CHANNEL_ID ||
    process.env.TELEGRAM_CHANNEL ||
    "-1005624779664"
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
