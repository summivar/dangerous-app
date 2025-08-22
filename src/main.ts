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
    
    await app.listen(config.APP_PORT, '0.0.0.0');
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();