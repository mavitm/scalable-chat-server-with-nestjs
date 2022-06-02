import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
@Injectable()
export class StateService {
  /**
   * clientId:UserMongoID
   */
  socketUser = new Map<string, string>();
  /**
   * userMongoID:userClient(s)
   */
  socketState = new Map<string, Socket[]>();

  /**
   * Add user and socket data for logged in user
   * @param userId
   * @param socket
   */
  public add(userId: string, socket: Socket): boolean {
    if (this.socketState.has(userId)) {
      if (this.hasUserSocket(userId, socket)) {
        //already exist for socket.id
        return true;
      }
    }
    const existingSockets = this.socketState.get(userId) || [];
    const sockets = [...existingSockets, socket];
    this.socketUser.set(socket.id, userId);
    this.socketState.set(userId, sockets);
    return true;
  }

  /**
   * Deleting user data in case of socket shutdown
   * @param userId
   * @param socket
   */
  public remove(userId: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(userId);

    if (!existingSockets) {
      return true;
    }

    const sockets = existingSockets.filter((s) => s.id !== socket.id);

    if (!sockets.length) {
      this.socketState.delete(userId);
    } else {
      this.socketState.set(userId, sockets);
    }

    this.socketUser.delete(socket.id);
    return true;
  }

  /**
   * sockets matching the user id value in the database
   * @param userId
   */
  public get(userId: string): Socket[] {
    return this.socketState.get(userId) || [];
  }

  /**
   * all sockets of the matching user in a connection
   * @param socketId
   */
  public getUserClientsBySocketId(socketId: string): Socket[] {
    const userId = this.socketUser.get(socketId);
    return this.get(userId);
  }

  public getUserClientsBySocket(socket: Socket): Socket[] {
    return this.getUserClientsBySocketId(socket.id);
  }

  /**
   * user id value linked to client id
   * @param clientId
   */
  public getUserIdByClienId(clientId: string): string {
    return this.socketUser.get(clientId);
  }

  /**
   *
   * @param userId
   * @param socket
   */
  public hasUserSocket(userId: string, socket: Socket): boolean {
    const sockets = this.get(userId).filter((s) => s.id === socket.id);
    return sockets.length > 0;
  }

  public getUserIds() {
    return Object.keys(this.socketState);
  }

  public getAll(): Socket[] {
    const all = [];
    this.socketState.forEach((sockets) => all.push(sockets));
    return all;
  }
}
