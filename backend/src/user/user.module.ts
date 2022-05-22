import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../tools/models/user.model';
import { AuthService } from '../auth/auth.service';
import { PropagatorModule } from '../propagator/propagator.module';

@Module({
  imports: [
    PropagatorModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UserService, AuthService],
  exports: [UserService],
})
export class UserModule {}
