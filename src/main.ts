import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap')
  //! PARA AGREGAR EL PREFIJO API EN LAS SOLICITUDES
  app.setGlobalPrefix('api');


  //! PARA LOS CLASS VALIDATOR Y TRANSFORMER
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted:true
    })
  )

  const config = new DocumentBuilder()
  .setTitle('Teslo RESTFULL API')
  .setDescription('Teslo shop endpoints')
  .setVersion('1.0')
  
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT);
  logger.log(`APP RUNNING ON PORT  ${process.env.PORT}`);
  
}
bootstrap();
