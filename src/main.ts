import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  //Esta configuracion le decimaos al backend que los datos deben ser el mismo nombre
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true
    })
  )
  //Cuando desplegamos en la nube el puerto va a a variar, dependiendo del servicio, ahi se lo ponemos sino por default agarra el 3000
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
