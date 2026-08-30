import mongoose from 'mongoose';

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://127.0.0.1:27017/ayurveda_lab';

  try {
    const mongoUri = primaryUri || fallbackUri;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Primary URI failed (${error.message}). Connecting to local MongoDB fallback...`);
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected to local fallback: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (fallbackError) {
      console.error(`[MongoDB] Local fallback error: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
};
