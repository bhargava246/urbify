import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';

  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: isProduction
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            )
          : winston.format.combine(
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context }) =>
                `[${timestamp}] [${String(context ?? 'App')}] ${level}: ${String(message)}`,
              ),
            ),
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const frontendUrl = configService.get<string>('app.frontendUrl', '*');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // ─── Security ───────────────────────────────────────────────────────────────────────────────
  app.use(helmet());

  app.enableCors({
    origin: nodeEnv === 'production' ? [frontendUrl] : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ─── Global prefix & versioning ───────────────────────────────────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix);

  // ─── Global validation pipe ─────────────────────────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger / OpenAPI ───────────────────────────────────────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('PropEase API')
      .setDescription(
        '🏠 PropEase – Zero Brokerage Real Estate Platform API\n\n' +
          'Authenticate via **POST /api/v1/auth/login** → copy the `accessToken` → click **Authorize**.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Registration, login, OTP, token refresh')
      .addTag('Users', 'Profile management')
      .addTag('Properties', 'Listing creation, search, moderation')
      .addTag('Payments', 'Contact unlock, PhonePe, refunds')
      .addTag('Uploads', 'AWS S3 file uploads')
      .addTag('Notifications', 'In-app & email notifications')
      .addTag('Search', 'Saved searches & shortlists')
      .addTag('Health', 'Service health check')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log(`Swagger docs → http://localhost:${port}/${apiPrefix}/docs`);
  }

  // ─── Start server ───────────────────────────────────────────────────────────────────────────────
  await app.listen(port);
  logger.log(`PropEase API running on port ${port} [${nodeEnv}]`);
  logger.log(`API prefix: /${apiPrefix}`);
}

void bootstrap();
