import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import environment from '../environment';

import {
  REDIS_PUBLISHER_CLIENT,
  REDIS_SUBSCRIBER_CLIENT,
} from './redis.constants';

export type RedisClient = Redis.Redis;

const redisPort: number = parseInt(environment.redis.port as string, 10);

export const redisProviders: Provider[] = [
  {
    useFactory: (): RedisClient => {
      return new Redis({
        host: environment.redis.host,
        port: redisPort,
      });
    },
    provide: REDIS_SUBSCRIBER_CLIENT,
  },
  {
    useFactory: (): RedisClient => {
      return new Redis({
        host: environment.redis.host,
        port: redisPort,
      });
    },
    provide: REDIS_PUBLISHER_CLIENT,
  },
];
