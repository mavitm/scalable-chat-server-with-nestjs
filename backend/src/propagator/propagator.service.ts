import { Injectable } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { Server } from 'socket.io';

import { RedisService } from '../redis/redis.service';
import { StateService } from '../state/state.service';

import {
  RedisSocketEventEmitDTO,
  RedisSocketEventSendDTO,
} from '../tools/dtos/redis.dto';

import {
  REDIS_SOCKET_EVENT_SEND_NAME,
  REDIS_SOCKET_EVENT_EMIT_ALL_NAME,
} from './propagator.constants';

@Injectable()
export class PropagatorService {
  private socketServer: Server;
  constructor(
    private readonly stateService: StateService,
    private readonly redisService: RedisService,
  ) {
    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_SEND_NAME)
      .pipe(tap(this.consumeSendEvent))
      .subscribe();
    this.redisService
      .fromEvent(REDIS_SOCKET_EVENT_EMIT_ALL_NAME)
      .pipe(tap(this.consumeEmitToAllEvent))
      .subscribe();
  }

  setSocketServer(server: Server): PropagatorService {
    this.socketServer = server;
    return this;
  }

  private consumeSendEvent = (eventInfo: RedisSocketEventSendDTO): void => {
    const { userId, socketId } = eventInfo;
    let targetUser = userId;
    if (!targetUser) {
      targetUser = this.stateService.getUserIdByClienId(socketId) as string;
    }
    return this.stateService
      .get(targetUser)
      .filter((socket) => socket.id !== socketId)
      .forEach((socket) => {
        socket.send(JSON.stringify(eventInfo.data));
      });
  };

  private consumeEmitToAllEvent = (
    eventInfo: RedisSocketEventEmitDTO,
  ): void => {
    this.socketServer.emit(eventInfo.method, eventInfo.result);
  };

  propagateEvent(eventInfo: RedisSocketEventSendDTO): boolean {
    this.redisService.publish(REDIS_SOCKET_EVENT_SEND_NAME, eventInfo);
    return true;
  }
}
