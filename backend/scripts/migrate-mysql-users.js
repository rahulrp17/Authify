import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import { User } from '../src/models/User.js';

const dryRun = process.argv.includes('--dry-run');
const table = process.env.LEGACY_MYSQL_TABLE || 'tbl_users';
const batchSize = 500;

const required = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const normalizeRow = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.toLowerCase().replaceAll('_', ''), value]),
  );

const toBoolean = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

const toDate = (value, fallback = new Date()) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const validateTableName = (value) => {
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error('LEGACY_MYSQL_TABLE contains invalid characters.');
  }

  return value;
};

const main = async () => {
  const mysqlConfig = {
    host: required('LEGACY_MYSQL_HOST'),
    port: Number.parseInt(process.env.LEGACY_MYSQL_PORT || '3306', 10),
    user: required('LEGACY_MYSQL_USER'),
    password: required('LEGACY_MYSQL_PASSWORD'),
    database: required('LEGACY_MYSQL_DATABASE'),
    ssl: process.env.LEGACY_MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };

  const mongoUri = required('MONGODB_URI');
  const safeTable = validateTableName(table);

  console.info(`[migration] Reading ${safeTable} from MySQL${dryRun ? ' (dry run)' : ''}.`);

  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  await mongoose.connect(mongoUri);
  await User.init();

  let processed = 0;
  let skipped = 0;
  let upserted = 0;
  let modified = 0;
  let matched = 0;
  let batch = [];

  const flush = async () => {
    if (!batch.length) return;

    if (!dryRun) {
      const result = await User.bulkWrite(batch, { ordered: false });
      upserted += result.upsertedCount || 0;
      modified += result.modifiedCount || 0;
      matched += result.matchedCount || 0;
    }

    batch = [];
  };

  try {
    const [rows] = await mysqlConnection.query(`SELECT * FROM \`${safeTable}\``);

    for (const rawRow of rows) {
      const row = normalizeRow(rawRow);
      const email = String(row.email || '').trim().toLowerCase();
      const passwordHash = String(row.password || '');
      const legacyUserId = String(row.userid || '').trim();
      const fullName = String(row.name || '').trim() || 'Authify User';

      if (!email || !passwordHash) {
        skipped += 1;
        console.warn('[migration] Skipped a row without email or password.');
        continue;
      }

      if (!/^\$2[aby]\$/.test(passwordHash)) {
        skipped += 1;
        console.warn(`[migration] Skipped ${email}: password is not a recognized BCrypt hash.`);
        continue;
      }

      const createdAt = toDate(row.createdat);
      const updatedAt = toDate(row.updatedat, createdAt);
      const document = {
        userId: legacyUserId || randomUUID(),
        fullName: fullName.slice(0, 80),
        email,
        password: passwordHash,
        isAccountVerified: toBoolean(row.isaccountverified),
        passwordChangedAt: updatedAt,
        lastLoginAt: null,
        createdAt,
        updatedAt,
      };

      batch.push({
        updateOne: {
          filter: { email },
          update: { $set: document },
          upsert: true,
        },
      });

      processed += 1;

      if (batch.length >= batchSize) {
        await flush();
      }
    }

    await flush();

    if (dryRun) {
      console.info(
        `[migration] Dry run complete. Processed=${processed} skipped=${skipped}. No writes performed.`,
      );
    } else {
      console.info(
        `[migration] Complete. Processed=${processed} skipped=${skipped} upserted=${upserted} modified=${modified} matched=${matched}.`,
      );
    }
  } finally {
    await mysqlConnection.end();
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error('[migration] Failed:', error.message);
  process.exitCode = 1;
});
