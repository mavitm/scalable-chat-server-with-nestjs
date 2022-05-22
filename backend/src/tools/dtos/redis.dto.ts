import { ServerMessageDto } from './message.dto';

export class RedisSocketEventEmitDTO extends ServerMessageDto {}
export class RedisSocketEventSendDTO extends RedisSocketEventEmitDTO {
  public socketId: string;
  public data: any;
  public userId: string;
}
