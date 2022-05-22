import * as mongose from 'mongoose';
import mongoose from 'mongoose';

export class MessageModel {
  _id: string;
  content: string;
  user_id: string;
  user_name: string;
  created: Date;
}

export const MessageScheme = new mongose.Schema({
  content: { type: String, required: [true, 'message is required'] },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User is required'],
  },
  user_name: { type: String, required: [true, 'User name is required'] },
  created: { type: Date, default: Date.now },
});
