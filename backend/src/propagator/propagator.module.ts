import { Module } from '@nestjs/common';

import { RedisModule } from '../redis/redis.modeule';

import { PropagatorService } from './propagator.service';
import { StateModule } from '../state/state.module';

@Module({
  imports: [RedisModule, StateModule],
  providers: [PropagatorService],
  exports: [PropagatorService],
})
export class PropagatorModule {}
