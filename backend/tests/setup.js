import { existsSync } from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.COOKIE_SECRET = 'test-cookie-secret-that-is-at-least-32-characters-long';
process.env.OTP_HASH_SECRET = 'test-otp-secret-that-is-at-least-32-characters-long';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/authify_test_placeholder';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.COOKIE_SAME_SITE = 'lax';
process.env.RATE_LIMIT_DISABLED = 'true';
process.env.OTP_RESEND_SECONDS = '60';
process.env.OTP_MAX_ATTEMPTS = '5';
process.env.SMTP_HOST = '';

let mongoServer;

beforeAll(async () => {
  const windowsMongo = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
  const systemBinary =
    process.env.MONGOMS_SYSTEM_BINARY || (existsSync(windowsMongo) ? windowsMongo : undefined);

  mongoServer = await MongoMemoryServer.create({
    ...(systemBinary ? { binary: { systemBinary } } : {}),
  });

  process.env.MONGODB_URI = mongoServer.getUri('authify_test');
  await mongoose.connect(process.env.MONGODB_URI);

  const [{ User }, { OtpToken }, { Session }] = await Promise.all([
    import('../src/models/User.js'),
    import('../src/models/OtpToken.js'),
    import('../src/models/Session.js'),
  ]);

  await Promise.all([User.init(), OtpToken.init(), Session.init()]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  await Promise.all(collections.map((collection) => collection.deleteMany({})));

  const { clearOutbox } = await import('../src/services/emailService.js');
  clearOutbox();
});
