import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptions/http';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env';

async function bootstrap() {
  const logLevels: LogLevel[] =
    env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors();

  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));

  const config = new DocumentBuilder()
    .setTitle('Crypto Arbitrage API')
    .setDescription('Crypto Arbitrage API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Crypto Arbitrage')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerUiEnabled: true,
  });

  const port = env.PORT ?? 3001;
  
  await app.listen(port);
  
  const logger = new Logger('Bootstrap');

  logger.log(`🚀 Alive at: http://localhost:${port}`);
  logger.log(
    `📚 API Docs at: http://localhost:${port}/api/docs`,
  );
  logger.log(`🌐 Environment: ${env.NODE_ENV || 'dev'}`);
}
bootstrap();
