import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StateAdapter } from './state/state.adapter';
import environment from './environment';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PropagatorService } from './propagator/propagator.service';
import { join } from 'path';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new StateAdapter(app, app.get(PropagatorService)));

  app.useStaticAssets(join(__dirname, '..', 'static'));

  await app.listen(environment.listenPort);
}
bootstrap();
