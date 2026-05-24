import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  displayName: string;
  email: string;
  passwordHash?: string;
}

const userSchema = new Schema<IUser>(
  {
    displayName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;