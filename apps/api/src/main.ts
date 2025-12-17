// import './instrument';

import { config } from 'dotenv';
import { resolve } from 'path';
import chalk from 'chalk';

// Load .env file from apps/api directory
config({ path: resolve(__dirname, '../.env') });

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const basicAuth = require('express-basic-auth');
// import * as socketIo from 'socket.io';

import { SwaggerHelper } from './common/helpers/swagger.helper';
import { LoggingInterceptor } from './common/interceptors/logger.interceptor';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure Socket.IO adapter with CORS
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  const configService = app.get(ConfigService);
  const appConfig = configService.get('app');
  const swaggerConfig = configService.get('swagger');

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
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
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

  await app.listen(defaultPort, () => {
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
  });
}
void bootstrap();
