import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';

dotenv.config();

const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);

const run = async () => {
  const redis = new Redis({ host: redisHost, port: redisPort });

  try {
    await mongoose.connect(mongodbUri);

    await Promise.all([
      User.deleteMany({}),
      Assignment.deleteMany({}),
    ]);

    await redis.flushdb();

    console.log('Reset complete: cleared MongoDB users/assignments and Redis keys');
  } finally {
    await redis.quit();
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('Reset failed:', error);
  process.exitCode = 1;
});