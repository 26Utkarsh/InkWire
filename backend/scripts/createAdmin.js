/**
 * @fileoverview createAdmin.js — One-time admin user creation script for InkWire.
 * Run: node scripts/createAdmin.js
 * Only needed on first deployment. Safe to re-run — won't duplicate.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';

const SALT_ROUNDS = 12;

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('ERROR: ADMIN_PASSWORD must be at least 12 characters for security.');
    process.exit(1);
  }

  try {
    await connectDB();

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      console.log('To reset password, delete the admin from MongoDB Atlas and re-run this script.');
      process.exit(0);
    }

    /** The Admin model's pre-save hook auto-hashes passwordHash */
    await Admin.create({ email, passwordHash: password });

    console.log('');
    console.log('✅ Admin account created successfully!');
    console.log(`   Email: ${email}`);
    console.log('   Password: (as set in .env)');
    console.log('');
    console.log('   Login at: http://localhost:5173/admin/login');
    console.log('');
  } catch (err) {
    console.error('Failed to create admin:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
