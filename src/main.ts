/* eslint-disable @typescript-eslint/no-floating-promises */

import { join } from 'path';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import * as session from 'express-session';
import * as pgSession from 'connect-pg-simple';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LanguageInterceptor } from './common/interceptors/language.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'fatal', 'error', 'warn'],
  });

  app.useGlobalInterceptors(new LanguageInterceptor());

  const configService = app.get(ConfigService);
 
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

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

  const PgSession = pgSession(session);
  app.enableCors({
    origin: configService.get<string>('ORIGIN_ALLOWLIST'),
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true,
  });
// 
  app.use(
    session({
      store: new PgSession({
        conString: configService.get<string>('DATABASE_URL'),
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    }),
  );

  app.useStaticAssets(join(__dirname, '../..', 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('LaLaBrand API')
    .setDescription('LaLaBrand API documentation')
    .setVersion('1.0')
    .addGlobalParameters({
      in: 'header',
      name: 'X-Language',
      description: 'Код мови (ua, en)',
      schema: {
        example: 'ua',
      },
    })
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введіть JWT токен авторизації',
        in: 'header',
      },
      'jwt',
    )
    .addSecurityRequirements('jwt')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: (a, b) => {
        const order = [
          'Авторизація',
          'Користувачі',
          'Адреси користувачів',
          'SMS-розсилка',
          'Відправка листів',
          'Шаблони листів',
          'Корзина',
          'Замовлення',
          'Країна',
          'Бренд',
          'Категорії параметрів',
          'Параметри',
          'Одиниці виміру',
          'Категорії',
          'Акції категорій',
          'Товари',
          'Акції товарів',
          'Резерви товарів',
          'Рейтинг товарів',
          'Про нас',
          'Доставка та оплата',
          'Запитання та відповіді',
          'Контакти',
        ];
        return order.indexOf(a) - order.indexOf(b);
      },
    },
  });

  await app.listen(configService.get<string>('PORT') ?? 3000);
}

bootstrap();
