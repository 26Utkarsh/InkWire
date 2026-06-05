/**
 * @fileoverview db.js — MongoDB Atlas connection for InkWire.
 * Single connection instance, reused across all services.
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { DB } from './constants.js';
import { seedAdmin } from '../controllers/auth.controller.js';

/**
 * Connect to MongoDB Atlas using URI from environment variables.
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: DB.CONNECT_TIMEOUT_MS,
      maxPoolSize: DB.MAX_POOL_SIZE,
    });

    logger.info('[DB] Connected to MongoDB Atlas successfully');

    // Automatically seed admin user from env variables on startup
    await seedAdmin();

    mongoose.connection.on('disconnected', () => {
      logger.warn('[DB] MongoDB disconnected — attempting reconnect');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`[DB] MongoDB error: ${err.message}`);
    });
  } catch (err) {
    logger.error(`[DB] Connection failed: ${err.message}`);
    throw err;
  }
};
