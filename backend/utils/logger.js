/**
 * @fileoverview logger.js — Winston logger for InkWire backend.
 * Use everywhere instead of console.log.
 * logger.info(), logger.warn(), logger.error() only.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

/** Custom log format with timestamp and level */
const logFormat = printf(({ timestamp: ts, level, message }) =>
  `[${ts}] [${level.toUpperCase()}] ${message}`
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});
