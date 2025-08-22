import { validateEnv, parseTelegramChatIds } from './schema.js';

export const config = validateEnv(process.env);

export const telegramChatIds = parseTelegramChatIds(config.TELEGRAM_CHAT_IDS);

export * from './schema.js';