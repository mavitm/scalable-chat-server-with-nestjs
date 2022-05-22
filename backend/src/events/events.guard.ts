import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class EventsGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient() as WebSocket;
    const request = context.switchToWs().getData();
    if (Object.prototype.hasOwnProperty.call(request, 'params')) {
      if (Object.prototype.hasOwnProperty.call(request.params, 'token')) {
        const userInfo = this.authService.verifyUserToken(request.params.token);
        return userInfo !== false;
      }
    }
    return false;
  }
}
