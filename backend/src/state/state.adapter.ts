import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { PropagatorService } from '../propagator/propagator.service';

export class StateAdapter extends IoAdapter implements WebSocketAdapter {
  public constructor(
    app: INestApplicationContext,
    private propagatorService: PropagatorService,
  ) {
    super(app);
  }

  // @ts-ignore
  create(
    port: number,
    options?: ServerOptions & { namespace?: string; server?: any },
  ): Server {
    const server = super.createIOServer(port, options);
    this.propagatorService.setSocketServer(server);
    /** server.use(middleware) **/
    return server;
  }
}
