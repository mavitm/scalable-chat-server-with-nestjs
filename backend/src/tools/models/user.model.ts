import * as mongoose from 'mongoose';

export class UserModel {
  _id: string;
  name: string;
  email: string;
  password: string;
  friends: any;
  created: Date;
}

export const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    required: [true, 'User name is required'],
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: [true, 'User email must be unique'],
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
    },
  },
  password: { type: String, required: [true, 'User name is required'] },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  created: { type: Date, default: Date.now },
});
