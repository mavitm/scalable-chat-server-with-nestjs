import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageScheme } from '../tools/models/message.model';
import { MessageService } from './message.service';
import { UserModule } from '../user/user.module';
import { PropagatorModule } from '../propagator/propagator.module';

@Module({
  imports: [
    UserModule,
    PropagatorModule,
    MongooseModule.forFeature([{ name: 'Message', schema: MessageScheme }]),
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
