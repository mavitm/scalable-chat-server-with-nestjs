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
   *
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
   * @param targetUser
   */
  async setFriends(
    selectedUser: { name; _id; email },
    targetUser: ClientGlobalDto,
  ): Promise<ServerMessageDto> {
    const leftUser = await this.findById(selectedUser._id);
    const rightUser = await this.findById(targetUser.params.id);
    if (leftUser && rightUser) {
      const allFriendsLeftUser = leftUser.friends.toString().split(',');
      const allFriendsRightUser = rightUser.friends.toString().split(',');

      if (!allFriendsLeftUser.includes(rightUser._id.toString())) {
        leftUser.friends.push(rightUser);
      }

      await this.userModel
        .findByIdAndUpdate(leftUser._id, leftUser, {
          new: true,
        })
        .exec();

      if (!allFriendsRightUser.includes(leftUser._id.toString())) {
        rightUser.friends.push(leftUser);
      }

      await this.userModel
        .findByIdAndUpdate(rightUser._id, rightUser, { new: true })
        .exec();

      return {
        method: targetUser.method,
        id: targetUser.id,
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
   *
   * @param userId
   */
  async getFriends(userId: string): Promise<UserModel[]> {
    const user = await this.findById(userId);
    const friends = await this.userModel
      .find({ _id: { $in: user.friends } })
      .exec();
    return friends;
  }

  async sendNotification(loginUser: UserModel | string, notifyType: string) {
    let otherUer: UserModel[];
    let leftUser: UserModel;
    try {
      if (typeof loginUser === 'string') {
        otherUer = await this.getFriends(loginUser);
        leftUser = await this.findById(loginUser);
      } else {
        otherUer = await this.getFriends(loginUser._id);
        leftUser = await this.findById(loginUser._id);
      }

      otherUer.forEach((user) => {
        this.propagetorService.propagateEvent({
          method: 'notify',
          socketId: 'target', //fake
          id: '_notify', //fake
          userId: user._id.toString(),
          data: {
            method: 'notify',
            id: '_notify',
            result: {
              type: notifyType,
              user: leftUser.name,
            },
          },
        });
      });
    } catch (e) {}
  }
}
