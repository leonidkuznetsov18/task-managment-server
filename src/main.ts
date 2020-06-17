import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';

const serverConfig = config.get('server');
const PORT = process.env.PORT || serverConfig.port;

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: serverConfig.origin,
    });
    logger.log(`Accepting request from origin ${serverConfig.origin}`);
  }
  await app.listen(PORT);
  logger.log(`Application listening on port ${PORT}`);
}
bootstrap();
