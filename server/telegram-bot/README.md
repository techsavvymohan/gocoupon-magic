# GoCoupon Telegram Deal Broadcaster Bot

The GoCoupon Telegram Bot automatically broadcasts verified, high-converting loot deals and promo codes to Telegram channels with full affiliate attribution.

## Folder Structure

```
server/telegram-bot/
├── config.ts       # Environment settings and credentials loader
├── bot.ts          # Core deal selection, formatting, and Telegram API dispatch
├── routes.ts       # Express router for management & webhook endpoints
├── index.ts        # Module public interface
└── README.md       # Operational documentation
```

## Features

1. **Native Telegram Action Buttons:** Attaches Telegram `inline_keyboard` URL buttons (`🛒 Claim Deal & Activate Code ➔`) for direct affiliate cookie activation.
2. **Clean Mobile Formatting:** Disables cluttered web page preview banners (`disable_web_page_preview: true`).
3. **Smart Deal Prioritization:** Prioritizes verified, featured deals with working coupon codes and high shopper ratings.
4. **24-Hour De-duplication:** Automatically tracks posted deals on disk (`server/data/telegram-posts.json`) to prevent duplicate spam.
5. **Affiliate Click Attribution:** Every deal link routes through `/api/redirect/deal` with `source=telegram`, injecting Cuelinks, Admitad, or partner affiliate tags.
6. **Zero External Dependencies:** Built with native Node.js `fetch` running in-process inside the GoCoupon VPS server.

## Configuration

Set the following variables in your `.env` file:

```env
TELEGRAM_BOT_TOKEN=8737807223:AAGr1lmiF1_F90Z1KIJEhWnJCUiV8cC6N2s
TELEGRAM_CHANNEL_ID=-1005624779664
TELEGRAM_AUTO_POST=true
TELEGRAM_INTERVAL_MIN=45
```

## API Endpoints

- `GET /api/telegram/status`: Queries Telegram API for bot credentials and returns current broadcaster status.
- `POST /api/telegram/test`: Sends a connection test message with an action button to the configured channel.
- `POST /api/telegram/post`: On-demand trigger to post the next highest-converting deal, or a specific `dealId`.
