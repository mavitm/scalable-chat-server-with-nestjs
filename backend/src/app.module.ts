import environment from './environment';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    EventsModule,
    AuthModule,
    UserModule,
    MessageModule,
    MongooseModule.forRoot(environment.mongoUrl),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
