import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../tools/models/user.model';

import {
  ClientGlobalDto,
  ClientLoginDto,
  ClientRegisterParamDto,
  ServerMessageDto,
} from '../tools/dtos/message.dto';
import { AuthService } from '../auth/auth.service';
import { ResourceService } from '../lib/services/resource.service';
import { WsException } from '@nestjs/websockets';
import { PropagatorService } from '../propagator/propagator.service';

@Injectable()
export class UserService extends ResourceService<
  UserModel,
  ClientRegisterParamDto,
  ClientRegisterParamDto
> {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserModel>,
    private authService: AuthService,
    private propagetorService: PropagatorService,
  ) {
    super(userModel);
  }

  /**
   * saves user to database
   * @param userParam
   */
  async create(userParam: ClientRegisterParamDto): Promise<UserModel> {
    userParam.password = await this.authService.convertToHash(
      userParam.password,
    );
    return await super.create(userParam);
  }

  /**
   *
   * @param params
   */
  async login(params: ClientLoginDto): Promise<any> {
    let message: string, code: number;
    const user: UserModel = await this.userModel
      .findOne({ email: params.params.email })
      .exec();
    if (user) {
      if (
        await this.authService.compareHashes(
          params.params.password,
          user.password,
        )
      ) {
        return {
          user,
          response: this.authService.getUserLoginMessage(user, params),
        };
      } else {
        message = 'the password is incorrect';
        code = 403;
      }
    } else {
      message = 'User not found';
      code = 404;
    }

    return {
      user: false,
      response: {
        method: 'login',
        error: {
          code,
          message,
        },
        id: params.id,
      },
    };
  }

  /**
   *
   * @param selectedUser
   * @param payload
   */
  async setFriends(
    selectedUser: { name; _id; email },
    payload: ClientGlobalDto,
  ): Promise<ServerMessageDto> {
    const currentUser = await this.findById(selectedUser._id);
    const targetUser = await this.findById(payload.params.id);

    if (currentUser && targetUser) {
      const allFriendsCurrentUser = currentUser.friends.toString().split(',');
      const allFriendsTargetUser = targetUser.friends.toString().split(',');

      if (!allFriendsCurrentUser.includes(targetUser._id.toString())) {
        currentUser.friends.push(targetUser);
      }

      await this.userModel
        .findByIdAndUpdate(currentUser._id, currentUser, {
          new: true,
        })
        .exec();

      if (!allFriendsTargetUser.includes(currentUser._id.toString())) {
        targetUser.friends.push(currentUser);
      }

      await this.userModel
        .findByIdAndUpdate(targetUser._id, targetUser, { new: true })
        .exec();

      return {
        method: payload.method,
        id: payload.id,
        result: {
          code: 200,
          message: 'transaction successful',
        },
      };
    } else {
      throw new WsException('user not found');
    }
  }

  /**
   * user's friends
   * @param userId
   */
  async getFriends(userId: string): Promise<UserModel[]> {
    const user = await this.findById(userId);
    const friends = await this.userModel
      .find({ _id: { $in: user.friends } })
      .exec();
    return friends;
  }

  /**
   * sends notifications to users friends, for login and logout process
   * @param loginUser
   * @param notifyType
   */
  async sendNotification(loginUser: UserModel | string, notifyType: string) {
    let currentUser: UserModel;
    try {
      if (typeof loginUser === 'string') {
        currentUser = await this.findById(loginUser);
      } else {
        currentUser = loginUser;
      }

      currentUser.friends.forEach((userId) => {
        this.propagetorService.propagateEvent({
          method: 'notify',
          socketId: 'target', //fake
          id: '_notify', //fake
          userId: userId.toString(),
          data: {
            method: 'notify',
            id: '_notify',
            result: {
              type: notifyType,
              user: currentUser.name,
            },
          },
        });
      });
    } catch (e) {}
  }
}
