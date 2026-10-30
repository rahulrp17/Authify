import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => randomUUID(),
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters.'],
      maxlength: [80, 'Full name must be at most 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email is too long.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, returnedObject) => {
        delete returnedObject.password;
        delete returnedObject.__v;
        return returnedObject;
      },
    },
  },
);

userSchema.pre('validate', function ensureUserId(next) {
  if (!this.userId) {
    this.userId = randomUUID();
  }
  next();
});

export const User = mongoose.model('User', userSchema);
