import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'Telegram bot token is required'),
  TELEGRAM_CHAT_IDS: z.string().min(1, 'Telegram chat IDs are required (comma-separated)'),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof configSchema>;

export const validateEnv = (env: Record<string, string | undefined>): Config => {
  try {
    return configSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
};

export const parseTelegramChatIds = (chatIds: string): number[] => {
  return chatIds
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .map(id => {
      const parsed = parseInt(id, 10);
      if (isNaN(parsed)) {
        throw new Error(`Invalid Telegram chat ID: ${id}`);
      }
      return parsed;
    });
};