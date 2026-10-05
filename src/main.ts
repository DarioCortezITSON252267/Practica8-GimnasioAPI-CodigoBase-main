// dotenv PRIMERO, antes de cualquier otro import. AuthModule lee
// process.env.JWT_SECRET al cargarse, asi que si esto va despues el
// secreto llega vacio y ningun token sirve.
import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DominioExceptionFilter } from './comun/filtros/dominio.filter';
import { LoggingInterceptor } from './comun/interceptores/logging.interceptor';
import { SobreInterceptor } from './comun/interceptores/sobre.interceptor';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // La frontera de entrada: nada llega al Controller sin pasar por aqui.
  app.useGlobalPipes(
    new ValidationPipe({
      // 1. Quita del cuerpo todo campo que el DTO no declare.
      whitelist: true,
      // 2. Y ademas rechaza la peticion si venia alguno. Sin whitelist
      //    esta opcion no hace nada y tampoco avisa. Comprobado.
      forbidNonWhitelisted: true,
      // 3. Convierte el JSON plano en una instancia de la clase del DTO.
      transform: true,
      // 4. Rechaza lo que no sabe validar en vez de dejarlo pasar.
      forbidUnknownValues: true,
    }),
  );

  // La frontera de salida: un solo traductor de errores de dominio.
  app.useGlobalFilters(new DominioExceptionFilter());

  // El orden importa: primero mide, luego envuelve.
  app.useGlobalInterceptors(new LoggingInterceptor(), new SobreInterceptor());

  // TODAS las rutas piden token; lo publico se marca con @Publico().
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Le dice al NAVEGADOR que origenes pueden leer las respuestas.
  app.enableCors({
    origin: ['http://localhost:5173'], // el puerto de Vite
    exposedHeaders: ['Location', 'X-Request-Id'],
  });

  // La documentacion viva en /docs.
  const config = new DocumentBuilder()
    .setTitle('API del Gimnasio')
    .setVersion('1.0')
    .addBearerAuth() // agrega el boton Authorize
    .addSecurityRequirements('bearer') // pone el candado en todas las rutas
    .build();
  const documento = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documento);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
