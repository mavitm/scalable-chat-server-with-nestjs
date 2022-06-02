import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserSchema, UserModel } from '../tools/models/user.model';

describe('AuthService', () => {
  let appService: AuthService;
  let token: string;
  let password: string;
  const userModel: UserModel = {
    _id: 'tst',
    name: 'test',
    friends: [],
    email: 'test@test.com',
    password: '123456789',
    created: new Date(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    appService = app.get<AuthService>(AuthService);
    token = appService.getUserToken(userModel);
    password = await appService.convertToHash(userModel.password);
  });

  describe('verify token', () => {
    it('should return "jwt token"', () => {
      expect(appService.verifyUserToken(token)).toBeTruthy();
    });
  });

  describe('password compare', () => {
    it('should ', function () {
      expect(
        appService.compareHashes(userModel.password, password),
      ).resolves.toBeTruthy();
    });
  });
});
