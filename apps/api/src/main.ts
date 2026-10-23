import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3001;
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port);
  logger.info(`Papaya Core API running on: http://localhost:${port}`);
}

bootstrap();
