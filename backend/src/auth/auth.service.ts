import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import environment from '../environment';
import { UserModel } from '../tools/models/user.model';
import { ClientLoginDto, ServerMessageDto } from '../tools/dtos/message.dto';
import { WsException } from '@nestjs/websockets';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  getUserToken(userModelData: UserModel): string {
    return jwt.sign(
      {
        name: userModelData.name,
        _id: userModelData._id,
        email: userModelData.email,
      },
      environment.jwtSecretKey,
    );
  }
  verifyUserToken(token: string): any {
    try {
      const decoded = jwt.verify(token, environment.jwtSecretKey);
      if (decoded) {
        return decoded;
      }
    } catch (e) {
      throw new WsException(e.message);
    }
    return false;
  }

  getUserLoginMessage(user: UserModel, req: ClientLoginDto): ServerMessageDto {
    return {
      method: 'login',
      result: {
        name: user.name,
        _id: user._id,
        token: this.getUserToken(user),
        code: 200,
      },
      id: req.id,
    };
  }
  async convertToHash(value: string) {
    let hashString;
    await bcrypt
      .hash(environment.bcrypt.secretKey + value, environment.bcrypt.saltRounds)
      .then((hash) => {
        hashString = hash;
      });
    return await hashString;
  }
  async compareHashes(password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compareSync(
      environment.bcrypt.secretKey + password,
      hashed,
    );
  }
}
