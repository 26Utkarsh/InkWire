/**
 * @fileoverview Admin.js — Admin user model for InkWire.
 * Single admin user with login attempt tracking.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AUTH } from '../config/constants.js';

const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

/**
 * Hash password before saving
 */
adminSchema.pre('save', async function preSave() {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, AUTH.BCRYPT_ROUNDS);
});

/**
 * Verify a plain password against stored hash
 * @param {string} plainPassword
 * @returns {Promise<boolean>}
 */
adminSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/**
 * Check if account is currently locked
 * @returns {boolean}
 */
adminSchema.methods.isLocked = function isLocked() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

/**
 * Increment login attempt counter — lock after max attempts
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
 * Reset login attempts after successful login
 * @returns {Promise<void>}
 */
adminSchema.methods.resetLoginAttempts = async function resetLoginAttempts() {
  this.loginAttempts = 0;
  this.lockedUntil = null;
  this.lastLogin = new Date();
  await this.save();
};

export const Admin = mongoose.model('Admin', adminSchema);
