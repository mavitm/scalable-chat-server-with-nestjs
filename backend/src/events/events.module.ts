import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message/message.module';
import { PropagatorModule } from '../propagator/propagator.module';
import { RedisModule } from '../redis/redis.modeule';
import { StateModule } from '../state/state.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MessageModule,
    PropagatorModule,
    RedisModule,
    StateModule,
  ],
  providers: [EventsGateway],
})
export class EventsModule {}
