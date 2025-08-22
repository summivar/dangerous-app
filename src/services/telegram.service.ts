import { Injectable, Logger } from '@nestjs/common';
import { Bot } from 'grammy';
import { config, telegramChatIds } from '@/config/index.js';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly bot: Bot;

  constructor() {
    this.bot = new Bot(config.TELEGRAM_BOT_TOKEN);
    this.logger.log(`Telegram service initialized with ${telegramChatIds.length} chat IDs`);
  }

  async sendMessage(message: string): Promise<void> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    const sendPromises = telegramChatIds.map(async (chatId) => {
      try {
        await this.bot.api.sendMessage(chatId, message);
        this.logger.log(`Message sent successfully to chat ID: ${chatId}`);
      } catch (error) {
        this.logger.error(`Failed to send message to chat ID ${chatId}:`, error);
        throw error;
      }
    });

    try {
      await Promise.all(sendPromises);
      this.logger.log(`Message sent to all ${telegramChatIds.length} chats`);
    } catch (error) {
      this.logger.error('Failed to send message to some chats:', error);
      throw new Error('Failed to send message to one or more chats');
    }
  }

  async sendMessageSafe(message: string): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    const results = await Promise.allSettled(
      telegramChatIds.map(async (chatId) => {
        try {
          await this.bot.api.sendMessage(chatId, message);
          this.logger.log(`Message sent successfully to chat ID: ${chatId}`);
          return { chatId, success: true };
        } catch (error) {
          this.logger.error(`Failed to send message to chat ID ${chatId}:`, error);
          return { chatId, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    const failed = results.length - successful;
    const errors = results
      .filter(result => result.status === 'fulfilled' && !result.value.success)
      .map(result => (result as any).value.error);

    this.logger.log(`Message sending completed: ${successful} successful, ${failed} failed`);

    return { success: successful, failed, errors };
  }
}