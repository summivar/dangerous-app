import { Module } from '@nestjs/common';
import { MessageController } from '@/controllers/message.controller.js';
import { TelegramService } from '@/services/telegram.service.js';

@Module({
  controllers: [MessageController],
  providers: [TelegramService],
})
export class AppModule {}