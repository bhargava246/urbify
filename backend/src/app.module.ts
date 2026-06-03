import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import * as Joi from 'joi';

// Config files
import appConfig    from './config/app.config';
import jwtConfig    from './config/jwt.config';
import awsConfig    from './config/aws.config';
import phonepeConfig from './config/phonepe.config';

// Infrastructure
import { PrismaModule } from './prisma/prisma.module';

// Feature modules
import { AuthModule }          from './modules/auth/auth.module';
import { UsersModule }         from './modules/users/users.module';
import { PropertiesModule }    from './modules/properties/properties.module';
import { PaymentsModule }      from './modules/payments/payments.module';
import { UploadsModule }       from './modules/uploads/uploads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule }        from './modules/search/search.module';

// Common
import { JwtAuthGuard }               from './common/guards/jwt-auth.guard';
import { RolesGuard }                 from './common/guards/roles.guard';
import { HttpExceptionFilter }        from './common/filters/http-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { LoggingInterceptor }         from './common/interceptors/logging.interceptor';

// Health
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    // ─── Config ──────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, awsConfig, phonepeConfig],
      validationSchema: Joi.object({
        NODE_ENV:               Joi.string().valid('development', 'production', 'test').default('development'),
        PORT:                   Joi.number().default(3001),
        DATABASE_URL:           Joi.string().required(),
        JWT_ACCESS_SECRET:      Joi.string().min(32).required(),
        JWT_REFRESH_SECRET:     Joi.string().min(32).required(),
        ENCRYPTION_KEY:         Joi.string().required(),
        // AWS S3 (for photo uploads — optional until S3 is configured)
        AWS_REGION:             Joi.string().default('ap-south-1'),
        AWS_ACCESS_KEY_ID:      Joi.string().optional().allow(''),
        AWS_SECRET_ACCESS_KEY:  Joi.string().optional().allow(''),
        AWS_S3_BUCKET_NAME:     Joi.string().optional().allow(''),
        // PhonePe (optional until payment gateway is configured)
        PHONEPE_MERCHANT_ID:    Joi.string().optional().allow(''),
        PHONEPE_SALT_KEY:       Joi.string().optional().allow(''),
        PHONEPE_SALT_INDEX:     Joi.string().default('1'),
        PHONEPE_BASE_URL:       Joi.string().default('https://api-preprod.phonepe.com/apis/pg-sandbox'),
      }),
      validationOptions: { abortEarly: false },
    }),

    // ─── Rate limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl:   config.get<number>('THROTTLE_TTL', 60) * 1000,
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // ─── Health ───────────────────────────────────────────────────────────────
    TerminusModule,

    // ─── Infrastructure ───────────────────────────────────────────────────────
    PrismaModule,

    // ─── Features ─────────────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    PropertiesModule,
    PaymentsModule,
    UploadsModule,
    NotificationsModule,
    SearchModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
