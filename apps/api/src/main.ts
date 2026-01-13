// import './instrument';
// Deployment trigger - 2026-01-13: Fix module format (CommonJS)

// Load dotenv FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Set up module aliases for @ryla/* packages at runtime
// This allows Node.js to resolve @ryla/* imports to dist/libs/* paths
// Must be done before any other imports that use @ryla/* packages
// __dirname is /app/dist/apps/api/src, so we need to go up 4 levels to /app/dist
const moduleAlias = require('module-alias');
const distPath = resolve(__dirname, '../../../../dist');
moduleAlias.addAliases({
  '@ryla/shared': resolve(distPath, 'libs/shared/src'),
  '@ryla/data': resolve(distPath, 'libs/data/src'),
  '@ryla/business': resolve(distPath, 'libs/business/src'),
  '@ryla/ui': resolve(distPath, 'libs/ui/src'),
  '@ryla/analytics': resolve(distPath, 'libs/analytics/src'),
  '@ryla/trpc': resolve(distPath, 'libs/trpc/src'),
  '@ryla/payments': resolve(distPath, 'libs/payments/src'),
  '@ryla/email': resolve(distPath, 'libs/email/src'),
});

// Load .env file from apps/api directory - MUST be before other imports
config({ path: resolve(__dirname, '../.env') });

import chalk from 'chalk';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

const cookieParser = require('cookie-parser');

const basicAuth = require('express-basic-auth');
// import * as socketIo from 'socket.io';

import { SwaggerHelper } from './common/helpers/swagger.helper';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { AppModule } from './modules/app.module';
import { runMigrations } from './database/run-migrations';
import { RedisService } from './modules/redis/services/redis.service';

async function bootstrap() {
  try {
    // Run database migrations before starting the app
    // Only run in production (skip in development for faster startup)
    if (process.env.NODE_ENV === 'production' && process.env.SKIP_MIGRATIONS !== 'true') {
      try {
        await runMigrations();
      } catch (error) {
        console.error('⚠️  Migration failed, but continuing startup:', error);
        // Don't fail startup if migrations fail - allow manual migration
      }
    }
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
      abortOnError: false,
      bufferLogs: false,
    });

    // Verify Redis connection on startup (non-blocking)
    try {
      const redisService = app.get(RedisService);
      console.log(chalk.blue('🔍 Checking Redis connection...'));
      
      // Try to connect and ping Redis with timeout
      const pingResult = await Promise.race([
        redisService.ping(),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
        ),
      ]);

      if (pingResult === 'PONG') {
        console.log(chalk.green('✅ Redis connection successful'));
      } else {
        console.warn(chalk.yellow('⚠️  Redis ping returned unexpected result:', pingResult));
      }
    } catch (error: any) {
      // Don't fail startup if Redis is unavailable - graceful degradation
      console.warn(
        chalk.yellow('⚠️  Redis connection check failed (continuing without Redis):'),
        error.message || error
      );
      console.warn(
        chalk.gray('   The app will continue to run, but Redis features will be unavailable.')
      );
    }

    // Configure Socket.IO adapter with CORS
    const ioAdapter = new IoAdapter(app);
    app.useWebSocketAdapter(ioAdapter);

    const configService = app.get(ConfigService);
    const appConfig = configService.get('app');
    const swaggerConfig = configService.get('swagger');

    if (!appConfig) {
      throw new Error('App config not found');
    }
    const swaggerPassword = swaggerConfig.password || 'password';
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: { admin: swaggerPassword },
      }),
    );

    app.use(
      '/webhooks-secure-func',
      bodyParser.raw({ type: 'application/json' }),
    );
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    // Enable cookie parsing
    app.use(cookieParser());

    app.useGlobalInterceptors(new LoggingInterceptor());

    const config = new DocumentBuilder()
      .setTitle('RYLA Nest Backend')
      .setDescription(
        "Robust backend boilerplate designed for scalability, flexibility, and ease of development.",
      )
      .setVersion('1.0.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerHelper.setDefaultResponses(document);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        docExpansion: 'none',
        defaultModelRendering: 3,
        persistAuthorization: true,
      },
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    );

    app.enableCors({
      origin: (
        _origin: string,

        callback: (_err: Error | null, _allow?: boolean) => void,
      ) => {
        return callback(null, true);
      },
      methods: 'GET,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'X-Forwarded-For',
      ],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 3600,
    });

    const defaultPort = appConfig.port || 3001;
    await app.listen(defaultPort);

    console.log('');
    console.log(
      chalk.green.bold('🚀 ') +
      chalk.white('Server running on ') +
      chalk.cyan.bold(`http://${appConfig.host}:${defaultPort}`),
    );
    console.log(
      chalk.blue.bold('📚 ') +
      chalk.white('Swagger docs: ') +
      chalk.cyan.bold(`http://${appConfig.host}:${defaultPort}/docs`),
    );
    console.log(
      chalk.yellow.bold('🔐 ') +
      chalk.white('Swagger auth: ') +
      chalk.gray('admin / admin'),
    );
    console.log('');
  } catch (error) {
    console.error('Error during bootstrap:', error);
    throw error;
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
});
