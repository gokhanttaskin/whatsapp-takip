// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.setGlobalPrefix('api'); // 👈 Tüm route'lar /api ile başlar
//   await app.listen(3000);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS Ayarları
  app.enableCors({
    origin: 'http://localhost:3001', // React uygulamanızın URL'si
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // İzin verilen HTTP metodları
    credentials: true, // Kimlik bilgileri (token) için
  });

  app.setGlobalPrefix('api'); // Tüm route'lar /api ile başlar
  await app.listen(3000);
}
bootstrap();