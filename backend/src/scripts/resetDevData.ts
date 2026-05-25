import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';

dotenv.config();

const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai';

const resolveRedisUrl = () => {
  return process.env.REDISCLOUD_URL || process.env.REDIS_URL || process.env.REDIS_TLS_URL || process.env.UPSTASH_REDIS_URL || '';
};

const run = async () => {
  const redisUrlValue = resolveRedisUrl();
  const redis = redisUrlValue
    ? new Redis(redisUrlValue)
    : new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      });

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