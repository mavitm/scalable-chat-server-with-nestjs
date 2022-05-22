import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageModel } from '../tools/models/message.model';
import {
  ClientGlobalParamsDto,
  ClientMessageParamsDto,
  ListRequestDto,
  ServerMessageDto,
} from '../tools/dtos/message.dto';
import { UserService } from '../user/user.service';
import { PropagatorService } from '../propagator/propagator.service';
import { ResourceService } from '../lib/services/resource.service';

@Injectable()
export class MessageService extends ResourceService<
  MessageModel,
  ClientMessageParamsDto,
  ClientMessageParamsDto
> {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<MessageModel>,
    private readonly userService: UserService,
    private readonly propagatorService: PropagatorService,
  ) {
    super(messageModel);
  }

  // @ts-ignore
  async create(
    messageData: ClientMessageParamsDto,
    user: { name; _id; email },
  ): Promise<MessageModel> {
    const createMessage = new this.messageModel({
      content: messageData.message,
      user_id: user._id,
      user_name: user.name,
      created: new Date(),
    });
    return await createMessage.save();
  }

  formatContent(content: string): string {
    return content;
  }

  async getUserMessages(
    userInfo: { name; _id; email },
    params: ClientGlobalParamsDto,
  ) {
    const user = await this.userService.findById(userInfo._id);
    const userIds = user.friends;
    userIds.push(user._id);
    const query = Object.assign(params);
    query.query = { user_id: { $in: userIds } };
    const messages = await this.findAll(query);
    return messages;
  }

  async distributeMessageToFriends(message: MessageModel, socketId: string) {
    const otherUer = await this.userService.getFriends(message.user_id);

    otherUer.forEach((user) => {
      this.propagatorService.propagateEvent({
        method: 'message',
        socketId,
        id: 'message',
        userId: user._id.toString(),
        data: {
          method: 'message',
          id: 'message',
          result: {
            message: this.formatContent(message.content),
            owner: message.user_name,
            created: message.created,
            _id: message._id,
          },
        },
      });
    });
  }
}
