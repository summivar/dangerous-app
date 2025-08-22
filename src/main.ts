import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '@/app.module.js';
import { config } from '@/config/index.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true,
    });
    
    logger.log(`🚀 Starting application on http://0.0.0.0:${config.APP_PORT}`);
    logger.log(`🤖 Telegram bot configured with token: ${config.TELEGRAM_BOT_TOKEN.substring(0, 20)}...`);
    logger.log(`📱 Ready to send messages to ${config.TELEGRAM_CHAT_IDS.split(',').length} chat(s)`);
    
    await app.listen(config.APP_PORT, '0.0.0.0');
    
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();