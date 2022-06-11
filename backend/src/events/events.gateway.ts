import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import {
  Logger,
  ValidationPipe,
  Body,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import {
  ClientGlobalDto,
  ClientLoginDto,
  ClientMessageDto,
  ListRequestDto,
  ServerMessageDto,
  UserCreateDto,
} from '../tools/dtos/message.dto';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { EventsExceptionFilter } from './events.exception.filter';
import { MessageService } from '../message/message.service';
import { EventsGuard } from './events.guard';
import { UserModel } from '../tools/models/user.model';
import environment from '../environment';
import { StateService } from '../state/state.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PropagatorInterceptor } from '../propagator/propagator.interceptor';

@UseInterceptors(PropagatorInterceptor)
@WebSocketGateway({
  cors: environment.cors,
  allowEIO3: true,
  transports: ['websocket'],
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('EventsGateway');

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private eventStateService: StateService,
  ) {}

  @UseFilters(new EventsExceptionFilter())
  @UseGuards(EventsGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @Body(new ValidationPipe()) payload: ClientMessageDto,
  ): Promise<Observable<WsResponse<any>>> {
    const tokenUser = this.authService.verifyUserToken(payload.params.token);
    const message = await this.messageService.create(payload.params, tokenUser);
    const sendData = {
      method: payload.method,
      id: payload.id,
      result: {
        message: this.messageService.formatContent(message.content),
        owner: message.user_name,
        created: message.created,
        _id: message._id,
      },
    };
    if (message) {
      this.messageService.distributeMessageToFriends(message, client.id).then();
    }
    return this.returnData(sendData);
  }

  @UseFilters(new EventsExceptionFilter())
  @UseGuards(EventsGuard)
  @SubscribeMessage('getUsers')
  async handleGetUsers(
    @ConnectedSocket() client: Socket,
    @Body(new ValidationPipe()) payload: ListRequestDto,
  ): Promise<Observable<WsResponse<any>>> {
    let users: UserModel[];
    try {
      users = await this.userService.findAll(payload.params);
    } catch (e) {
      throw new WsException(e.message);
    }
    const sendData = {
      method: 'getUsers',
      id: payload.id,
      result: users,
    };
    return this.returnData(sendData);
  }

  @UseFilters(new EventsExceptionFilter())
  @UseGuards(EventsGuard)
  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @Body(new ValidationPipe()) payload: ListRequestDto,
  ): Promise<Observable<WsResponse<any>>> {
    const tokenUser = this.authService.verifyUserToken(payload.params.token);
    try {
      const messages = await this.messageService.getUserMessages(
        tokenUser,
        payload.params,
      );

      const sendData = {
        method: 'getMessages',
        id: payload.id,
        result: messages,
      };
      return this.returnData(sendData);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  @UseFilters(new EventsExceptionFilter())
  @UseGuards(EventsGuard)
  @SubscribeMessage('setFriend')
  async handleSetFriends(
    @ConnectedSocket() client: Socket,
    @Body(new ValidationPipe()) payload: ClientGlobalDto,
  ): Promise<Observable<WsResponse<any>>> {
    const selectedUser = this.authService.verifyUserToken(payload.params.token);
    try {
      const response = await this.userService.setFriends(selectedUser, payload);
      return this.returnData(response);
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage('login')
  @UseFilters(new EventsExceptionFilter())
  async handleLogin(
    @ConnectedSocket() client: Socket,
    @Body(new ValidationPipe()) payload: ClientLoginDto,
  ): Promise<Observable<WsResponse<any>>> {
    const loginData: { user: UserModel | any; response: ServerMessageDto } =
      await this.userService.login(payload);
    if (loginData.user) {
      this.eventStateService.add(loginData.user._id.toString(), client);
      //@Todo get in state service and send when singular
      this.userService.sendNotification(loginData.user, 'login').then();
    } else {
      if (Object.prototype.hasOwnProperty.call(loginData.response, 'error')) {
        throw new WsException(loginData.response.error.message);
      }
    }
    return this.returnData(loginData.response);
  }

  @SubscribeMessage('register')
  @UseFilters(new EventsExceptionFilter())
  async handleRegister(
    @ConnectedSocket() client: Socket,
    @Body(new ValidationPipe()) payload: UserCreateDto,
  ): Promise<Observable<WsResponse<any>>> {
    const user = await this.userService.create(payload.params);
    const sendData: ServerMessageDto = this.authService.getUserLoginMessage(
      user,
      payload,
    );
    if (user) {
      this.eventStateService.add(user._id.toString(), client);
    }
    return this.returnData(sendData);
  }

  afterInit(server: Server) {
    this.logger.log('Socket server init');
  }

  /**
   *
   * @param client
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    //If the user does not log in after the connection, the connection will be broken.
    setTimeout(this.checkUserIsLoggedIn.bind(this), 15000, client);
  }

  /**
   *
   * @param client
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    //@Todo get in state service and send when singular
    this.userService
      .sendNotification(
        this.eventStateService.getUserIdByClienId(client.id),
        'logout',
      )
      .then();

    this.eventStateService.remove(
      this.eventStateService.getUserIdByClienId(client.id),
      client,
    );
  }

  /**
   *
   * @param sendData
   * @private
   */
  private returnData(sendData): Observable<WsResponse<any>> {
    return from([sendData]).pipe(
      map((data) => {
        return { event: sendData.method, data };
      }),
    );
  }

  /**
   * disconnect if client is not a valid user
   * @param client
   * @private
   */
  private checkUserIsLoggedIn(client: Socket) {
    const userId: string = this.eventStateService.getUserIdByClienId(client.id);
    if (typeof userId === 'undefined') {
      console.log(
        'Connection closed because login request was not sent',
        client.request.connection.remoteAddress,
      );
      client.disconnect(true);
    }
  }
}
