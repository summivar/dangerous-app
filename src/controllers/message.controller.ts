import { Controller, Post, Body, Get, Res, Logger, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { TelegramService } from '@/services/telegram.service.js';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4096, 'Message is too long'),
});

@Controller()
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Get()
  getHomePage(@Res() res: Response): void {
    try {
      const htmlPath = join(process.cwd(), 'src', 'views', 'index.html');
      const html = readFileSync(htmlPath, 'utf-8');
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      this.logger.error('Error reading HTML file:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
  }

  @Post('send')
  async sendMessage(@Body() body: unknown, @Res() res: Response): Promise<void> {
    try {
      const { message } = sendMessageSchema.parse(body);
      
      this.logger.log(`Received message to send: "${message.substring(0, 50)}..."`);
      
      const result = await this.telegramService.sendMessageSafe(message);
      
      if (result.success > 0) {
        this.logger.log(`Message sent successfully to ${result.success} out of ${result.success + result.failed} chats`);
        
        if (result.failed > 0) {
          this.logger.warn(`Failed to send to ${result.failed} chats: ${result.errors.join(', ')}`);
          res.status(HttpStatus.OK).send(`Message sent to ${result.success} chats. ${result.failed} failed.`);
        } else {
          res.status(HttpStatus.OK).send('Message sent successfully to all chats');
        }
      } else {
        this.logger.error('Failed to send message to any chats');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to send message to any chats');
      }
      
    } catch (error) {
      this.logger.error('Error sending message:', error);
      
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(', ');
        res.status(HttpStatus.BAD_REQUEST).send(errorMessage);
      } else if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Unknown error occurred');
      }
    }
  }
}