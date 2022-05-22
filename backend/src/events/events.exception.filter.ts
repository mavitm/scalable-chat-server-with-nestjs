import {
  ArgumentsHost,
  Catch,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class EventsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient() as WebSocket;
    const data = host.switchToWs().getData();

    let error;
    if (exception instanceof WsException) {
      error = exception.getError();
    } else if (
      exception instanceof WsException ||
      exception instanceof BadRequestException
    ) {
      error = exception.getResponse();
    } else {
      error = exception;
    }
    //const error = exception;
    const details = error instanceof Object ? { ...error } : { message: error };
    const respose = {
      method: data.method || 'error',
      id: data.id || 'unknown',
      error: {
        id: (client as any).id,
        ...details,
      },
    };
    client.send(JSON.stringify(respose));
    if (Object.prototype.hasOwnProperty.call(data, 'method')) {
      if (data.method === 'login' || data.method === 'register') {
        //console.log('disconnected', exception);
        host.switchToWs().getClient().disconnect(true);
      }
    }
    return respose;
  }
}
