import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PropagatorService } from './propagator.service';
import { StateService } from '../state/state.service';

@Injectable()
export class PropagatorInterceptor<T>
  implements NestInterceptor<T, WsResponse<T>>
{
  constructor(
    private readonly propagatorService: PropagatorService,
    private stateService: StateService,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<WsResponse<T>> {
    const socket = context.switchToWs().getClient();
    return next.handle().pipe(
      tap((data) => {
        this.propagatorService.propagateEvent({
          ...data,
          socketId: socket.id,
          userId: this.stateService.getUserIdByClienId(socket.id),
        });
      }),
    );
  }
}
