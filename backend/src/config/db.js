import mongoose from 'mongoose';

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

export const connectDB = async (uri) => {
  mongoose.connection.on('connected', () => {
    console.info('[database] MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('[database] MongoDB connection error:', error.message);
  });

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
