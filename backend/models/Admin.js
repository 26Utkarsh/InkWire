/**
 * @fileoverview Admin.js — Admin user model for InkWire.
 * SECURITY: bcrypt hashing, account lockout, full login history audit trail.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AUTH } from '../config/constants.js';

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:  { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil:   { type: Date, default: null },
    lastLogin:     { type: Date },

    /**
     * Login history — last 10 attempts (successful and failed).
     * Each entry records: IP address, success/fail, and timestamp.
     * Used for intrusion detection — visible in admin dashboard.
     */
    loginHistory: [
      {
        ip:        { type: String },
        success:   { type: Boolean },
        at:        { type: Date, default: Date.now },
        _id:       false,   // no need for sub-document IDs
      }
    ],
  },
  { timestamps: true }
);

/**
 * Hash password before saving (only if modified)
 */
adminSchema.pre('save', async function preSave() {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, AUTH.BCRYPT_ROUNDS);
});

/**
 * Verify a plain password against stored hash.
 * @param {string} plainPassword
 * @returns {Promise<boolean>}
 */
adminSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/**
 * Check if account is currently locked.
 * @returns {boolean}
 */
adminSchema.methods.isLocked = function isLocked() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

/**
 * Increment login attempt counter — lock after max attempts.
 * @returns {Promise<void>}
 */
adminSchema.methods.incrementLoginAttempts = async function incrementLoginAttempts() {
  this.loginAttempts += 1;
  if (this.loginAttempts >= AUTH.MAX_LOGIN_ATTEMPTS) {
    this.lockedUntil = new Date(Date.now() + AUTH.LOCKOUT_MINUTES * 60 * 1000);
    this.loginAttempts = 0;
  }
  await this.save();
};

/**
 * Reset login attempts after successful login.
 * @returns {Promise<void>}
 */
adminSchema.methods.resetLoginAttempts = async function resetLoginAttempts() {
  this.loginAttempts = 0;
  this.lockedUntil  = null;
  this.lastLogin    = new Date();
  await this.save();
};

/**
 * Record a login event (success or failure) in the audit history.
 * Keeps only the last 10 entries to prevent unbounded document growth.
 * @param {{ ip: string, success: boolean }} entry
 * @returns {Promise<void>}
 */
adminSchema.methods.recordLoginAttempt = async function recordLoginAttempt({ ip, success }) {
  this.loginHistory.unshift({ ip, success, at: new Date() });
  // Keep only the most recent 10 records
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(0, 10);
  }
  await this.save();
};

export const Admin = mongoose.model('Admin', adminSchema);

